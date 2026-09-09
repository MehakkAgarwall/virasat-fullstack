import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];

    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // First, try the local copy of the original Manus media.
    // This lets the project work without the old Manus storage service.
    const localRoot = path.resolve(
      process.cwd(),
      "public",
      "manus-storage",
    );

    const localPath = path.resolve(localRoot, key);

    // Prevent path traversal outside public/manus-storage.
    const isInsideLocalRoot =
      localPath === localRoot ||
      localPath.startsWith(localRoot + path.sep);

    if (isInsideLocalRoot && fs.existsSync(localPath)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.sendFile(localPath);
      return;
    }

    // If the file isn't available locally, preserve the existing
    // Manus/Forge storage behavior.
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );

      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: {
          Authorization: `Bearer ${ENV.forgeApiKey}`,
        },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(
          `[StorageProxy] forge error: ${forgeResp.status} ${body}`,
        );
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };

      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}