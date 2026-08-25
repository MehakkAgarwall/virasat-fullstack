import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A deliberately small persistence boundary for the retained prototype flows.
 * It stores Traveller, Artisan, and Authority state as one versioned snapshot
 * per browser/demo identity and scope, so the approved UI can evolve to
 * resource-level tables later without changing the user-facing routes.
 */
export const demoStates = mysqlTable("demo_states", {
  id: int("id").autoincrement().primaryKey(),
  subjectKey: varchar("subjectKey", { length: 191 }).notNull(),
  scope: mysqlEnum("scope", ["traveller", "artisan", "authority"]).notNull(),
  payload: text("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("demo_states_subject_scope_unique").on(table.subjectKey, table.scope),
]);

export type DemoState = typeof demoStates.$inferSelect;
export type InsertDemoState = typeof demoStates.$inferInsert;

/**
 * Public Artisan profile owned by one prototype or future authenticated artisan identity.
 * Photo fields store public URLs only; image bytes remain in managed object storage.
 */
export const artisanProfiles = mysqlTable("artisan_profiles", {
  id: int("id").autoincrement().primaryKey(),
  artisanKey: varchar("artisanKey", { length: 191 }).notNull(),
  /** Optional primary Railway craft relationship; experiences retain their own required craftId. */
  primaryCraftId: int("primaryCraftId"),
  studioName: varchar("studioName", { length: 191 }).notNull(),
  personalName: varchar("personalName", { length: 191 }).notNull(),
  craftSpecialization: varchar("craftSpecialization", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  state: varchar("state", { length: 128 }).notNull(),
  yearsOfPractice: int("yearsOfPractice").notNull(),
  bio: text("bio").notNull(),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 1024 }).notNull(),
  coverPhotoUrl: varchar("coverPhotoUrl", { length: 1024 }).notNull(),
  publicContact: varchar("publicContact", { length: 320 }).notNull(),
  languages: varchar("languages", { length: 500 }).notNull(),
  experienceInfo: text("experienceInfo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("artisan_profiles_artisan_key_unique").on(table.artisanKey),
]);

export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type InsertArtisanProfile = typeof artisanProfiles.$inferInsert;

/**
 * Traveller-owned identity and field preferences. This record is intentionally
 * separate from Artisan profiles: a Traveller can never alter the maker whose
 * experience they are viewing or booking.
 */
export const travellerProfiles = mysqlTable("traveller_profiles", {
  id: int("id").autoincrement().primaryKey(),
  travellerKey: varchar("travellerKey", { length: 191 }).notNull(),
  displayName: varchar("displayName", { length: 191 }).notNull(),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 1024 }).notNull(),
  introduction: text("introduction").notNull(),
  preferences: text("preferences").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("traveller_profiles_traveller_key_unique").on(table.travellerKey),
]);

export type TravellerProfile = typeof travellerProfiles.$inferSelect;
export type InsertTravellerProfile = typeof travellerProfiles.$inferInsert;

/**
 * Private field-journal reflections. These remain scoped to the traveller's
 * existing prototype identity and are never joined into public craft, maker,
 * experience, or booking responses.
 */
export const travellerReflections = mysqlTable("traveller_reflections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  travellerKey: varchar("travellerKey", { length: 191 }).notNull(),
  content: text("content").notNull(),
  /** Optional Traveller-owned image stored in managed object storage. It is visible only to the owner until the reflection is explicitly shared. */
  reviewPhotoUrl: varchar("reviewPhotoUrl", { length: 1024 }).notNull().default(""),
  /** A Traveller must explicitly opt in before a reflection appears on the Shared Trail Board. */
  isShared: int("isShared").notNull().default(0),
  sharedAt: timestamp("sharedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("traveller_reflections_traveller_created_idx").on(table.travellerKey, table.createdAt),
  index("traveller_reflections_shared_created_idx").on(table.isShared, table.sharedAt),
]);

export type TravellerReflection = typeof travellerReflections.$inferSelect;
export type InsertTravellerReflection = typeof travellerReflections.$inferInsert;

/** A published studio object. Products remain attached to the same Artisan and numeric Railway craft reference used by managed experiences. */
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  artisanKey: varchar("artisanKey", { length: 191 }).notNull(),
  craftId: int("craftId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  available: int("available").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("products_artisan_idx").on(table.artisanKey),
  index("products_craft_idx").on(table.craftId),
]);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const productEnquiryStatus = mysqlEnum("productEnquiryStatus", ["new", "responded"]);

/** A lightweight, persistent purchase enquiry—not a payment, cart, shipping, or order record. */
export const productEnquiries = mysqlTable("product_enquiries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  artisanKey: varchar("artisanKey", { length: 191 }).notNull(),
  travellerKey: varchar("travellerKey", { length: 191 }).notNull(),
  travellerName: varchar("travellerName", { length: 191 }).notNull(),
  message: text("message").notNull(),
  status: productEnquiryStatus.default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("product_enquiries_artisan_idx").on(table.artisanKey),
  index("product_enquiries_product_idx").on(table.productId),
  index("product_enquiries_traveller_idx").on(table.travellerKey),
]);

export type ProductEnquiry = typeof productEnquiries.$inferSelect;
export type InsertProductEnquiry = typeof productEnquiries.$inferInsert;

/**
 * Minimal canonical experience record for the approved SIH booking flow.
 * craftId is the verified numeric Railway craft ID, retained as a cross-service
 * reference rather than a database foreign key because Railway owns that table.
 */
export const experiences = mysqlTable("experiences", {
  id: varchar("id", { length: 64 }).primaryKey(),
  /** Prototype or future authenticated owner key; public profile values are resolved by this relationship at read time. */
  artisanKey: varchar("artisanKey", { length: 191 }).notNull(),
  /** Legacy display fallback only. The public Artisan profile is the authoritative display source. */
  artisanName: varchar("artisanName", { length: 191 }).notNull(),
  craftId: int("craftId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 128 }).notNull().default("60 minutes"),
  price: int("price").notNull().default(0),
  capacity: int("capacity").notNull().default(8),
  availableDates: varchar("availableDates", { length: 255 }).notNull().default("Dates to be confirmed"),
  availableTimes: varchar("availableTimes", { length: 255 }).notNull().default("10:00 AM · 2:00 PM · 4:30 PM"),
  previewImageUrl: varchar("previewImageUrl", { length: 1024 }).notNull().default("/manus-storage/mysore-silk-loom_4b1db1d7.jpg"),
  coverImageUrl: varchar("coverImageUrl", { length: 1024 }).notNull().default("/manus-storage/mysore-silk-loom_4b1db1d7.jpg"),
  galleryImageUrls: varchar("galleryImageUrls", { length: 4096 }).notNull().default("[]"),
  previewVideoUrl: varchar("previewVideoUrl", { length: 1024 }).notNull().default(""),
  youtubeVideoUrl: varchar("youtubeVideoUrl", { length: 1024 }).notNull().default(""),
  previewCaption: varchar("previewCaption", { length: 500 }).notNull().default("A closer look at the making.") ,
  detourDistanceKm: varchar("detourDistanceKm", { length: 64 }).notNull().default("4.8 km"),
  detourMinutes: int("detourMinutes").notNull().default(18),
  routeExplanation: varchar("routeExplanation", { length: 2048 }).notNull().default("Located close to your planned route and available during your selected travel window."),
  available: int("available").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

/**
 * Read-only cultural discovery records sourced from the live craft catalogue.
 * These intentionally do not carry Artisan ownership, price, capacity,
 * availability, or booking fields. They are not workshop listings.
 */
export const culturalResources = mysqlTable("cultural_resources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  craftId: int("craftId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  sourceLabel: varchar("sourceLabel", { length: 255 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1024 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("cultural_resources_craft_unique").on(table.craftId),
]);

export type CulturalResource = typeof culturalResources.$inferSelect;
export type InsertCulturalResource = typeof culturalResources.$inferInsert;

export const bookingStatus = mysqlEnum("bookingStatus", ["pending", "accepted", "rejected"]);

/** Canonical booking row shared by Traveller and Artisan prototype identities. */
export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  experienceId: varchar("experienceId", { length: 64 }).notNull(),
  artisanKey: varchar("artisanKey", { length: 191 }).notNull(),
  travellerKey: varchar("travellerKey", { length: 191 }).notNull(),
  travellerName: varchar("travellerName", { length: 191 }).notNull(),
  bookingDate: varchar("bookingDate", { length: 64 }).notNull(),
  bookingTime: varchar("bookingTime", { length: 64 }).notNull().default("10:00 AM"),
  status: bookingStatus.default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("bookings_artisan_idx").on(table.artisanKey),
  index("bookings_traveller_idx").on(table.travellerKey),
  index("bookings_experience_idx").on(table.experienceId),
]);

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
