import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createBooking, createManagedExperience, createManagedProduct, createProductEnquiry, createTravellerReflection, deleteManagedProduct, getArtisanProfile, getCulturalResource, getOrCreateArtisanProfile, getOrCreateTravellerProfile, getPublishedExperience, getPublishedProduct, getTravellerProfile, listAuthorityPlannedRoutes, listBookingsForArtisan, listBookingsForTraveller, listCulturalResources, listDemoStates, listExperiencesForArtisan, listProductEnquiriesForArtisan, listProductsForArtisan, listPublishedExperiences, listPublishedProductsForArtisan, listPublishedProductsForCraft, listSharedTravellerReflections, listTravellerReflections, publishTravellerReflection, removeBookingForTraveller, respondToProductEnquiry, saveDemoState, updateArtisanProfile, updateBookingStatus, updateManagedExperience, updateManagedProduct, updateTravellerProfile } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const managedMediaUrl = z.string().trim().min(1).max(1024).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use a public HTTPS URL or a managed project media path.");
const optionalVideoUrl = z.string().trim().max(1024).refine((value) => !value || /^https?:\/\//.test(value), "Use a public HTTPS video URL.");
const optionalManagedImageUrl = z.string().trim().max(1024).refine((value) => !value || value.startsWith("/manus-storage/"), "Use a managed project image path.");
const managedProductInput = z.object({ artisanKey: z.string().min(8).max(191), craftId: z.number().int().positive(), name: z.string().trim().min(2).max(255), description: z.string().trim().min(12).max(5000), price: z.number().int().min(0).max(1000000), imageUrl: z.string().trim().min(1).max(1024).refine((value) => value.startsWith("/manus-storage/"), "Use a managed project image path."), quantity: z.number().int().min(0).max(1000000), available: z.number().int().min(0).max(1) });
const managedExperienceInput = z.object({
  artisanKey: z.string().min(8).max(191),
  craftId: z.number().int().min(0),
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(12).max(5000),
  location: z.string().trim().min(2).max(255),
  duration: z.string().trim().min(2).max(128),
  price: z.number().int().min(0).max(1000000),
  capacity: z.number().int().min(1).max(1000),
  availableDates: z.string().trim().min(2).max(255),
  availableTimes: z.string().trim().min(2).max(255),
  previewImageUrl: managedMediaUrl,
  coverImageUrl: managedMediaUrl,
  galleryImageUrls: z.array(managedMediaUrl).max(6),
  previewVideoUrl: optionalVideoUrl,
  youtubeVideoUrl: optionalVideoUrl,
  previewCaption: z.string().trim().min(2).max(500),
  detourDistanceKm: z.string().trim().min(2).max(64),
  detourMinutes: z.number().int().min(0).max(1440),
  routeExplanation: z.string().trim().min(12).max(2048),
  available: z.number().int().min(0).max(1),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  booking: router({
    getExperience: publicProcedure
      .input(z.object({ experienceId: z.string().min(1) }))
      .query(({ input }) => getPublishedExperience(input.experienceId)),
    create: publicProcedure
      .input(z.object({
        experienceId: z.string().min(1),
        travellerKey: z.string().min(8).max(191),
        travellerName: z.string().min(1).max(191),
        bookingDate: z.string().min(1).max(64),
        bookingTime: z.string().min(1).max(64).default("10:00 AM"),
      }))
      .mutation(({ input }) => createBooking(input)),
    listForArtisan: publicProcedure
      .input(z.object({ artisanKey: z.string().min(8).max(191) }))
      .query(({ input }) => listBookingsForArtisan(input.artisanKey)),
    listForTraveller: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191) }))
      .query(({ input }) => listBookingsForTraveller(input.travellerKey)),
    updateStatus: publicProcedure
      .input(z.object({ bookingId: z.string().min(1), artisanKey: z.string().min(8).max(191), status: z.enum(["accepted", "rejected"]) }))
      .mutation(({ input }) => updateBookingStatus(input)),
    removeForTraveller: publicProcedure
      .input(z.object({ bookingId: z.string().min(1), travellerKey: z.string().min(8).max(191) }))
      .mutation(({ input }) => removeBookingForTraveller(input)),
  }),
  experience: router({
    get: publicProcedure
      .input(z.object({ experienceId: z.string().min(1) }))
      .query(({ input }) => getPublishedExperience(input.experienceId)),
    listPublished: publicProcedure.query(() => listPublishedExperiences()),
    listForArtisan: publicProcedure
      .input(z.object({ artisanKey: z.string().min(8).max(191) }))
      .query(({ input }) => listExperiencesForArtisan(input.artisanKey)),
    create: publicProcedure
      .input(managedExperienceInput)
      .mutation(({ input }) => createManagedExperience(input)),
    update: publicProcedure
      .input(managedExperienceInput.extend({ id: z.string().min(1).max(64) }))
      .mutation(({ input }) => updateManagedExperience(input)),
  }),
  culturalResource: router({
    list: publicProcedure.query(() => listCulturalResources()),
    get: publicProcedure.input(z.object({ resourceId: z.string().min(1).max(64) })).query(({ input }) => getCulturalResource(input.resourceId)),
  }),
  authority: router({
    plannedRoutes: publicProcedure.query(() => listAuthorityPlannedRoutes()),
  }),
  product: router({
    get: publicProcedure.input(z.object({ productId: z.string().min(8).max(64) })).query(({ input }) => getPublishedProduct(input.productId)),
    listByCraft: publicProcedure.input(z.object({ craftId: z.number().int().positive() })).query(({ input }) => listPublishedProductsForCraft(input.craftId)),
    listPublishedForArtisan: publicProcedure.input(z.object({ artisanKey: z.string().min(8).max(191) })).query(({ input }) => listPublishedProductsForArtisan(input.artisanKey)),
    listForArtisan: publicProcedure.input(z.object({ artisanKey: z.string().min(8).max(191) })).query(({ input }) => listProductsForArtisan(input.artisanKey)),
    create: publicProcedure.input(managedProductInput).mutation(({ input }) => createManagedProduct(input)),
    update: publicProcedure.input(managedProductInput.extend({ id: z.string().min(8).max(64) })).mutation(({ input }) => updateManagedProduct(input)),
    remove: publicProcedure.input(z.object({ id: z.string().min(8).max(64), artisanKey: z.string().min(8).max(191) })).mutation(({ input }) => deleteManagedProduct(input)),
  }),
  productEnquiry: router({
    create: publicProcedure.input(z.object({ productId: z.string().min(8).max(64), travellerKey: z.string().min(8).max(191), travellerName: z.string().trim().min(2).max(191), message: z.string().trim().min(2).max(2000) })).mutation(({ input }) => createProductEnquiry(input)),
    listForArtisan: publicProcedure.input(z.object({ artisanKey: z.string().min(8).max(191) })).query(({ input }) => listProductEnquiriesForArtisan(input.artisanKey)),
    respond: publicProcedure.input(z.object({ enquiryId: z.string().min(8).max(64), artisanKey: z.string().min(8).max(191) })).mutation(({ input }) => respondToProductEnquiry(input)),
  }),
  artisanProfile: router({
    get: publicProcedure
      .input(z.object({ artisanKey: z.string().min(8).max(191) }))
      .query(({ input }) => getArtisanProfile(input.artisanKey)),
    getOrCreate: publicProcedure
      .input(z.object({ artisanKey: z.string().min(8).max(191), personalName: z.string().min(1).max(191) }))
      .mutation(({ input }) => getOrCreateArtisanProfile(input)),
    update: publicProcedure
      .input(z.object({
        artisanKey: z.string().min(8).max(191),
        primaryCraftId: z.number().int().positive().nullable(),
        studioName: z.string().trim().min(2).max(191),
        personalName: z.string().trim().min(2).max(191),
        craftSpecialization: z.string().trim().min(2).max(255),
        location: z.string().trim().min(2).max(255),
        state: z.string().trim().min(2).max(128),
        yearsOfPractice: z.number().int().min(0).max(100),
        bio: z.string().trim().min(12).max(5000),
        profilePhotoUrl: z.string().trim().min(1).max(1024).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use a public HTTPS URL or a managed project image path."),
        coverPhotoUrl: z.string().trim().min(1).max(1024).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use a public HTTPS URL or a managed project image path."),
        publicContact: z.string().trim().max(320),
        languages: z.string().trim().max(500),
        experienceInfo: z.string().trim().min(2).max(5000),
      }))
      .mutation(({ input }) => updateArtisanProfile(input)),
  }),
  travellerProfile: router({
    get: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191) }))
      .query(({ input }) => getTravellerProfile(input.travellerKey)),
    getOrCreate: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191), displayName: z.string().min(1).max(191) }))
      .mutation(({ input }) => getOrCreateTravellerProfile(input)),
    update: publicProcedure
      .input(z.object({
        travellerKey: z.string().min(8).max(191),
        displayName: z.string().trim().min(2).max(191),
        profilePhotoUrl: z.string().trim().max(1024).refine((value) => !value || value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use a public HTTPS URL or a managed project image path."),
        introduction: z.string().trim().min(2).max(5000),
        preferences: z.string().trim().min(2).max(5000),
      }))
      .mutation(({ input }) => updateTravellerProfile(input)),
  }),
  travellerJournal: router({
    list: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191) }))
      .query(({ input }) => listTravellerReflections(input.travellerKey)),
    create: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191), content: z.string().trim().min(2).max(2500), reviewPhotoUrl: optionalManagedImageUrl.optional().default(""), shareToBoard: z.boolean().optional().default(false) }))
      .mutation(({ input }) => createTravellerReflection(input)),
    publish: publicProcedure
      .input(z.object({ travellerKey: z.string().min(8).max(191), reflectionId: z.string().min(8).max(64) }))
      .mutation(({ input }) => publishTravellerReflection(input)),
    listShared: publicProcedure
      .query(() => listSharedTravellerReflections()),
  }),
  demoState: router({
    list: publicProcedure
      .input(z.object({ subjectKey: z.string().min(8).max(191) }))
      .query(({ input }) => listDemoStates(input.subjectKey)),
    save: publicProcedure
      .input(z.object({
        subjectKey: z.string().min(8).max(191),
        scope: z.enum(["traveller", "artisan", "authority"]),
        payload: z.record(z.string(), z.unknown()),
      }))
      .mutation(({ input }) => saveDemoState(input)),
  }),
});

export type AppRouter = typeof appRouter;
