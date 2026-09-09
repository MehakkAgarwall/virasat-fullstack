import "dotenv/config";
import express from "express";
import { createServer } from "http";
import multer from "multer";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { getOrCreateTravellerProfile, updateTravellerProfile } from "../db";
import { storagePut } from "../storage";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  const travellerPhotoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
  }).single("photo");
  // Photo bytes travel as multipart instead of base64 JSON: the external gateway blocks the latter before tRPC can respond.
  app.post("/api/upload/traveller-photo", (req, res) => {
    travellerPhotoUpload(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 2 MB." : "Choose one JPG, PNG, or WebP image.";
        res.status(400).json({ error: message });
        return;
      }
      const travellerKey = typeof req.body.travellerKey === "string" ? req.body.travellerKey.trim() : "";
      const displayName = typeof req.body.displayName === "string" ? req.body.displayName.trim() : "";
      const photo = req.file;
      if (!/^[A-Za-z0-9_-]{8,191}$/.test(travellerKey) || displayName.length < 2 || !photo) {
        res.status(400).json({ error: "A Traveller identity and one valid image are required." });
        return;
      }
      try {
        const extension = photo.mimetype === "image/jpeg" ? "jpg" : photo.mimetype.slice("image/".length);
        const upload = await storagePut(`traveller-profiles/${travellerKey}/profile.${extension}`, photo.buffer, photo.mimetype);
        const profile = await getOrCreateTravellerProfile({ travellerKey, displayName });
        if (!profile) throw new Error("Traveller profile could not be prepared for this photo.");
        const savedProfile = await updateTravellerProfile({
          travellerKey,
          displayName: profile.displayName ?? displayName,
          profilePhotoUrl: upload.url,
          introduction: profile.introduction ?? "A curious traveller following living craft stories across India.",
          preferences: profile.preferences ?? "Handmade traditions, intimate workshops, and cultural detours.",
        });
        res.status(201).json({ profile: savedProfile });
      } catch (error) {
        console.error("[Traveller photo upload]", error);
        res.status(502).json({ error: "Your photo could not be stored. Please try again." });
      }
    });
  });
  app.post("/api/upload/trail-review-photo", (req, res) => {
    travellerPhotoUpload(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 2 MB." : "Choose one JPG, PNG, or WebP image.";
        res.status(400).json({ error: message });
        return;
      }
      const travellerKey = typeof req.body.travellerKey === "string" ? req.body.travellerKey.trim() : "";
      const photo = req.file;
      if (!/^[A-Za-z0-9_-]{8,191}$/.test(travellerKey) || !photo) {
        res.status(400).json({ error: "A Traveller identity and one valid image are required." });
        return;
      }
      try {
        const extension = photo.mimetype === "image/jpeg" ? "jpg" : photo.mimetype.slice("image/".length);
        const upload = await storagePut(`traveller-reviews/${travellerKey}/${crypto.randomUUID()}.${extension}`, photo.buffer, photo.mimetype);
        res.status(201).json({ reviewPhotoUrl: upload.url });
      } catch (error) {
        console.error("[Trail review photo upload]", error);
        res.status(502).json({ error: "Your review photo could not be stored. Please try again." });
      }
    });
  });
  app.post("/api/upload/product-image", (req, res) => {
    travellerPhotoUpload(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 2 MB." : "Choose one JPG, PNG, or WebP image.";
        res.status(400).json({ error: message });
        return;
      }
      const artisanKey = typeof req.body.artisanKey === "string" ? req.body.artisanKey.trim() : "";
      const photo = req.file;
      if (!/^[A-Za-z0-9_-]{8,191}$/.test(artisanKey) || !photo) {
        res.status(400).json({ error: "An Artisan identity and one valid product image are required." });
        return;
      }
      try {
        const extension = photo.mimetype === "image/jpeg" ? "jpg" : photo.mimetype.slice("image/".length);
        const upload = await storagePut(`artisan-products/${artisanKey}/${crypto.randomUUID()}.${extension}`, photo.buffer, photo.mimetype);
        res.status(201).json({ imageUrl: upload.url });
      } catch (error) {
        console.error("[Product image upload]", error);
        res.status(502).json({ error: "Your product image could not be stored. Please try again." });
      }
    });
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
