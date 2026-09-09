import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { artisanProfiles, bookings, culturalResources, demoStates, experiences, InsertUser, productEnquiries, products, travellerProfiles, travellerReflections, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type DemoScope = "traveller" | "artisan" | "authority";
export type PersistedDemoState = { scope: DemoScope; payload: Record<string, unknown>; updatedAt: Date };

function parseDemoPayload(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export async function listDemoStates(subjectKey: string): Promise<PersistedDemoState[]> {
  const db = await getDb();
  if (!db) return [];

  const records = await db.select().from(demoStates).where(eq(demoStates.subjectKey, subjectKey));
  return records.map((record) => ({
    scope: record.scope,
    payload: parseDemoPayload(record.payload),
    updatedAt: record.updatedAt,
  }));
}

export type AuthorityPlannedRoute = {
  id: string;
  origin: string;
  destination: string;
  stopCount: number;
  source: "api" | "mock" | null;
  planCount: number;
  updatedAt: Date;
};

type RouteStateRecord = Pick<PersistedDemoState, "payload" | "updatedAt">;

function routePlaceName(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const name = (value as Record<string, unknown>).name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

/**
 * Projects Traveller demo snapshots into anonymous route summaries. The Authority
 * view deliberately never receives a subject key, name, saved items, or profile data.
 */
export function projectAuthorityPlannedRoutes(records: RouteStateRecord[]): AuthorityPlannedRoute[] {
  const grouped = new Map<string, AuthorityPlannedRoute>();

  records.forEach((record) => {
    const routeExperience = record.payload.routeExperience;
    if (!routeExperience || typeof routeExperience !== "object" || Array.isArray(routeExperience)) return;
    const route = routeExperience as Record<string, unknown>;
    const origin = routePlaceName(route.origin) || (typeof record.payload.origin === "string" ? record.payload.origin.trim() : "");
    const destination = routePlaceName(route.destination) || (typeof record.payload.destination === "string" ? record.payload.destination.trim() : "");
    if (!origin || !destination) return;

    const crafts = Array.isArray(route.crafts) ? route.crafts : [];
    const source = record.payload.source === "api" || record.payload.source === "mock" ? record.payload.source : null;
    const id = `${origin.toLowerCase()}::${destination.toLowerCase()}`;
    const existing = grouped.get(id);
    if (existing) {
      existing.planCount += 1;
      if (record.updatedAt.getTime() > existing.updatedAt.getTime()) {
        existing.stopCount = crafts.length;
        existing.source = source;
        existing.updatedAt = record.updatedAt;
      }
      return;
    }
    grouped.set(id, { id, origin, destination, stopCount: crafts.length, source, planCount: 1, updatedAt: record.updatedAt });
  });

  return Array.from(grouped.values()).sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
}

export async function listAuthorityPlannedRoutes(): Promise<AuthorityPlannedRoute[]> {
  const db = await getDb();
  if (!db) return [];
  const records = await db.select({ payload: demoStates.payload, updatedAt: demoStates.updatedAt })
    .from(demoStates)
    .where(eq(demoStates.scope, "traveller"))
    .orderBy(desc(demoStates.updatedAt));
  return projectAuthorityPlannedRoutes(records.map((record) => ({ payload: parseDemoPayload(record.payload), updatedAt: record.updatedAt })));
}

export type ArtisanProfileInput = {
  artisanKey: string;
  primaryCraftId: number | null;
  studioName: string;
  personalName: string;
  craftSpecialization: string;
  location: string;
  state: string;
  yearsOfPractice: number;
  bio: string;
  profilePhotoUrl: string;
  coverPhotoUrl: string;
  publicContact: string;
  languages: string;
  experienceInfo: string;
};

export type ManagedExperienceInput = {
  artisanKey: string;
  craftId: number;
  title: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  capacity: number;
  availableDates: string;
  availableTimes: string;
  previewImageUrl: string;
  coverImageUrl: string;
  galleryImageUrls: string[];
  previewVideoUrl: string;
  youtubeVideoUrl: string;
  previewCaption: string;
  detourDistanceKm: string;
  detourMinutes: number;
  routeExplanation: string;
  available: number;
};

export type TravellerProfileInput = {
  travellerKey: string;
  displayName: string;
  profilePhotoUrl: string;
  introduction: string;
  preferences: string;
};

export type TravellerReflectionInput = {
  travellerKey: string;
  content: string;
  reviewPhotoUrl?: string;
  shareToBoard?: boolean;
};

export type ManagedProductInput = {
  artisanKey: string;
  craftId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  available: number;
};

const DEFAULT_PROFILE_PHOTO = "/manus-storage/mysore-silk-loom_4b1db1d7.jpg";
const DEFAULT_COVER_PHOTO = "/manus-storage/mysuru-heritage-pavilion_6c4424ad.jpg";
const LEGACY_TRAVELLER_PHOTO = "/manus-storage/virasat-maker-at-work_7e0e99ef.jpg";

function toArtisanDisplayName(profile: { personalName: string; studioName: string } | null, fallbackName: string) {
  return profile ? `${profile.personalName} · ${profile.studioName}` : fallbackName;
}

function parseGalleryUrls(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === "string") : [];
  } catch {
    return [];
  }
}

function withResolvedProfile(row: { experience: typeof experiences.$inferSelect | null; profile: typeof artisanProfiles.$inferSelect | null }) {
  if (!row.experience) return null;
  const profileLocation = row.profile ? [row.profile.location, row.profile.state].filter(Boolean).join(", ") : "";
  return {
    ...row.experience,
    galleryImageUrls: parseGalleryUrls(row.experience.galleryImageUrls),
    artisanName: toArtisanDisplayName(row.profile, row.experience.artisanName),
    location: profileLocation || row.experience.location,
    craftSpecialization: row.profile?.craftSpecialization ?? null,
    artisanProfile: row.profile,
  };
}

function withResolvedBooking(row: { booking: typeof bookings.$inferSelect; experience: typeof experiences.$inferSelect | null; profile: typeof artisanProfiles.$inferSelect | null; traveller: typeof travellerProfiles.$inferSelect | null }) {
  return {
    booking: { ...row.booking, travellerName: row.traveller?.displayName ?? row.booking.travellerName },
    experience: withResolvedProfile(row),
    travellerProfile: row.traveller,
  };
}

export async function getArtisanProfile(artisanKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select().from(artisanProfiles).where(eq(artisanProfiles.artisanKey, artisanKey)).limit(1);
  return rows[0] ?? null;
}

export async function listAllArtisanProfiles() {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select().from(artisanProfiles).orderBy(artisanProfiles.personalName);
  return rows.map((row) => ({
    id: row.id,
    artisanKey: row.artisanKey,
    personalName: row.personalName,
    studioName: row.studioName,
    craftSpecialization: row.craftSpecialization,
    state: row.state,
    location: row.location,
    coverPhotoUrl: row.coverPhotoUrl,
    profilePhotoUrl: row.profilePhotoUrl,
    yearsOfPractice: row.yearsOfPractice,
    bio: row.bio.length > 150 ? row.bio.slice(0, 147) + "…" : row.bio,
  }));
}

export async function getOrCreateArtisanProfile(input: { artisanKey: string; personalName: string }) {
  const existing = await getArtisanProfile(input.artisanKey);
  if (existing) return existing;
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const personalName = input.personalName.trim() || "New Artisan";
  const studioName = `${personalName}'s Studio`;
  await db.insert(artisanProfiles).values({
    artisanKey: input.artisanKey,
    primaryCraftId: null,
    studioName,
    personalName,
    craftSpecialization: "Craft practice",
    location: "India",
    state: "",
    yearsOfPractice: 0,
    bio: "A living craft practice, shared directly with travellers.",
    profilePhotoUrl: DEFAULT_PROFILE_PHOTO,
    coverPhotoUrl: DEFAULT_COVER_PHOTO,
    publicContact: "",
    languages: "",
    experienceInfo: "Experience details will appear here when published.",
  });
  return getArtisanProfile(input.artisanKey);
}

export async function updateArtisanProfile(input: ArtisanProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const values = {
    primaryCraftId: input.primaryCraftId,
    studioName: input.studioName,
    personalName: input.personalName,
    craftSpecialization: input.craftSpecialization,
    location: input.location,
    state: input.state,
    yearsOfPractice: input.yearsOfPractice,
    bio: input.bio,
    profilePhotoUrl: input.profilePhotoUrl,
    coverPhotoUrl: input.coverPhotoUrl,
    publicContact: input.publicContact,
    languages: input.languages,
    experienceInfo: input.experienceInfo,
    updatedAt: new Date(),
  };
  await db.update(artisanProfiles).set(values).where(eq(artisanProfiles.artisanKey, input.artisanKey));
  const profile = await getArtisanProfile(input.artisanKey);
  if (!profile) throw new Error("The Artisan profile could not be saved.");
  return profile;
}

export async function getTravellerProfile(travellerKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select().from(travellerProfiles).where(eq(travellerProfiles.travellerKey, travellerKey)).limit(1);
  const profile = rows[0];
  return profile ? { ...profile, profilePhotoUrl: profile.profilePhotoUrl === LEGACY_TRAVELLER_PHOTO ? "" : profile.profilePhotoUrl } : null;
}

export async function getOrCreateTravellerProfile(input: { travellerKey: string; displayName: string }) {
  const existing = await getTravellerProfile(input.travellerKey);
  if (existing) return existing;
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const displayName = input.displayName.trim() || "Aarav";
  await db.insert(travellerProfiles).values({
    travellerKey: input.travellerKey,
    displayName,
    profilePhotoUrl: "",
    introduction: "A curious traveller following living craft stories across India.",
    preferences: "Handmade traditions, intimate workshops, and cultural detours.",
  });
  return getTravellerProfile(input.travellerKey);
}

export async function updateTravellerProfile(input: TravellerProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  await db.update(travellerProfiles).set({
    displayName: input.displayName,
    profilePhotoUrl: input.profilePhotoUrl,
    introduction: input.introduction,
    preferences: input.preferences,
    updatedAt: new Date(),
  }).where(eq(travellerProfiles.travellerKey, input.travellerKey));
  await db.update(bookings).set({ travellerName: input.displayName, updatedAt: new Date() }).where(eq(bookings.travellerKey, input.travellerKey));
  const profile = await getTravellerProfile(input.travellerKey);
  if (!profile) throw new Error("The Traveller profile could not be saved.");
  return profile;
}

export async function listTravellerReflections(travellerKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  return db.select()
    .from(travellerReflections)
    .where(eq(travellerReflections.travellerKey, travellerKey))
    .orderBy(desc(travellerReflections.createdAt))
    .limit(12);
}

export async function createTravellerReflection(input: TravellerReflectionInput) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const id = `reflection-${crypto.randomUUID()}`;
  const sharedAt = input.shareToBoard ? new Date() : null;
  await db.insert(travellerReflections).values({ id, travellerKey: input.travellerKey, content: input.content, reviewPhotoUrl: input.reviewPhotoUrl ?? "", isShared: input.shareToBoard ? 1 : 0, sharedAt });
  const created = await db.select().from(travellerReflections).where(eq(travellerReflections.id, id)).limit(1);
  if (!created[0]) throw new Error("The reflection could not be saved.");
  return created[0];
}

export async function publishTravellerReflection(input: { travellerKey: string; reflectionId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const owned = await db.select().from(travellerReflections)
    .where(and(eq(travellerReflections.id, input.reflectionId), eq(travellerReflections.travellerKey, input.travellerKey)))
    .limit(1);
  if (!owned[0]) throw new Error("Only your own reflection can be shared.");
  await db.update(travellerReflections).set({ isShared: 1, sharedAt: owned[0].sharedAt ?? new Date(), updatedAt: new Date() })
    .where(eq(travellerReflections.id, input.reflectionId));
  const published = await db.select().from(travellerReflections).where(eq(travellerReflections.id, input.reflectionId)).limit(1);
  if (!published[0]) throw new Error("The reflection could not be shared.");
  return published[0];
}

export async function listSharedTravellerReflections() {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ reflection: travellerReflections, profile: travellerProfiles })
    .from(travellerReflections)
    .leftJoin(travellerProfiles, eq(travellerReflections.travellerKey, travellerProfiles.travellerKey))
    .where(eq(travellerReflections.isShared, 1))
    .orderBy(desc(travellerReflections.sharedAt), desc(travellerReflections.createdAt))
    .limit(36);
  return rows.map(({ reflection, profile }) => ({
    ...reflection,
    travellerName: profile?.displayName?.trim() || "Traveller",
    travellerProfilePhotoUrl: profile?.profilePhotoUrl === LEGACY_TRAVELLER_PHOTO ? "" : profile?.profilePhotoUrl ?? "",
  }));
}

function withProductProfile(row: { product: typeof products.$inferSelect; profile: typeof artisanProfiles.$inferSelect | null }) {
  return { ...row.product, artisanName: row.profile ? `${row.profile.personalName} · ${row.profile.studioName}` : "Published artisan", studioName: row.profile?.studioName ?? "Published studio", artisanProfilePhotoUrl: row.profile?.profilePhotoUrl ?? "" };
}

export async function listPublishedProductsForCraft(craftId: number) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ product: products, profile: artisanProfiles }).from(products).leftJoin(artisanProfiles, eq(products.artisanKey, artisanProfiles.artisanKey)).where(and(eq(products.craftId, craftId), eq(products.available, 1))).orderBy(desc(products.updatedAt));
  return rows.map(withProductProfile);
}

export async function listPublishedProductsForArtisan(artisanKey: string) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ product: products, profile: artisanProfiles }).from(products).leftJoin(artisanProfiles, eq(products.artisanKey, artisanProfiles.artisanKey)).where(and(eq(products.artisanKey, artisanKey), eq(products.available, 1))).orderBy(desc(products.updatedAt));
  return rows.map(withProductProfile);
}

export async function listProductsForArtisan(artisanKey: string) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  return db.select().from(products).where(eq(products.artisanKey, artisanKey)).orderBy(desc(products.updatedAt));
}

export async function getPublishedProduct(productId: string) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ product: products, profile: artisanProfiles }).from(products).leftJoin(artisanProfiles, eq(products.artisanKey, artisanProfiles.artisanKey)).where(and(eq(products.id, productId), eq(products.available, 1))).limit(1);
  return rows[0] ? withProductProfile(rows[0]) : null;
}

export async function createManagedProduct(input: ManagedProductInput) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  if (!await getArtisanProfile(input.artisanKey)) throw new Error("Save the Artisan public profile before publishing a product.");
  const id = `product-${crypto.randomUUID()}`;
  await db.insert(products).values({ id, ...input });
  const saved = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!saved[0]) throw new Error("The product could not be saved.");
  return saved[0];
}

export async function updateManagedProduct(input: ManagedProductInput & { id: string }) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const owned = await db.select().from(products).where(and(eq(products.id, input.id), eq(products.artisanKey, input.artisanKey))).limit(1);
  if (!owned[0]) throw new Error("Only the linked Artisan can edit this product.");
  await db.update(products).set({ craftId: input.craftId, name: input.name, description: input.description, price: input.price, imageUrl: input.imageUrl, quantity: input.quantity, available: input.available, updatedAt: new Date() }).where(eq(products.id, input.id));
  const saved = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
  if (!saved[0]) throw new Error("The product could not be saved.");
  return saved[0];
}

export async function deleteManagedProduct(input: { id: string; artisanKey: string }) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const owned = await db.select().from(products).where(and(eq(products.id, input.id), eq(products.artisanKey, input.artisanKey))).limit(1);
  if (!owned[0]) throw new Error("Only the linked Artisan can remove this product.");
  await db.delete(products).where(eq(products.id, input.id)); return { id: input.id };
}

export async function createProductEnquiry(input: { productId: string; travellerKey: string; travellerName: string; message: string }) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const product = await db.select().from(products).where(and(eq(products.id, input.productId), eq(products.available, 1))).limit(1);
  if (!product[0]) throw new Error("This piece is not currently available for enquiries.");
  const id = `product-enquiry-${crypto.randomUUID()}`;
  await db.insert(productEnquiries).values({ id, productId: product[0].id, artisanKey: product[0].artisanKey, travellerKey: input.travellerKey, travellerName: input.travellerName, message: input.message });
  const created = await db.select().from(productEnquiries).where(eq(productEnquiries.id, id)).limit(1);
  if (!created[0]) throw new Error("Your enquiry could not be saved."); return created[0];
}

export async function listProductEnquiriesForArtisan(artisanKey: string) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  return db.select({ enquiry: productEnquiries, product: products }).from(productEnquiries).leftJoin(products, eq(productEnquiries.productId, products.id)).where(eq(productEnquiries.artisanKey, artisanKey)).orderBy(desc(productEnquiries.updatedAt));
}

export async function respondToProductEnquiry(input: { enquiryId: string; artisanKey: string }) {
  const db = await getDb(); if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const owned = await db.select().from(productEnquiries).where(and(eq(productEnquiries.id, input.enquiryId), eq(productEnquiries.artisanKey, input.artisanKey))).limit(1);
  if (!owned[0]) throw new Error("Only the linked Artisan can respond to this enquiry.");
  await db.update(productEnquiries).set({ status: "responded", updatedAt: new Date() }).where(eq(productEnquiries.id, input.enquiryId));
  const updated = await db.select().from(productEnquiries).where(eq(productEnquiries.id, input.enquiryId)).limit(1);
  if (!updated[0]) throw new Error("The enquiry could not be updated."); return updated[0];
}

export async function getPublishedExperience(experienceId: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ experience: experiences, profile: artisanProfiles })
    .from(experiences)
    .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
    .where(and(eq(experiences.id, experienceId), eq(experiences.available, 1)))
    .limit(1);
  return rows[0] ? withResolvedProfile(rows[0]) : null;
}

export async function listPublishedExperiences() {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ experience: experiences, profile: artisanProfiles })
    .from(experiences)
    .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
    .where(eq(experiences.available, 1))
    .orderBy(desc(experiences.updatedAt));
  return rows.map(withResolvedProfile).filter((experience): experience is NonNullable<typeof experience> => Boolean(experience));
}

/** Source-linked cultural records remain distinct from managed, bookable experiences. */
export async function listCulturalResources() {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  return db.select().from(culturalResources).orderBy(culturalResources.title);
}

export async function getCulturalResource(resourceId: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select().from(culturalResources).where(eq(culturalResources.id, resourceId)).limit(1);
  return rows[0] ?? null;
}

export async function listExperiencesForArtisan(artisanKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const [rows, artisanBookings] = await Promise.all([
    db.select({ experience: experiences, profile: artisanProfiles })
      .from(experiences)
      .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
      .where(eq(experiences.artisanKey, artisanKey))
      .orderBy(desc(experiences.updatedAt)),
    db.select().from(bookings).where(eq(bookings.artisanKey, artisanKey)),
  ]);
  const bookingCounts = new Map<string, number>();
  artisanBookings.forEach((booking) => bookingCounts.set(booking.experienceId, (bookingCounts.get(booking.experienceId) ?? 0) + 1));
  return rows.map((row) => {
    const experience = withResolvedProfile(row);
    return experience ? { ...experience, bookingCount: bookingCounts.get(experience.id) ?? 0 } : null;
  }).filter((experience): experience is NonNullable<typeof experience> => Boolean(experience));
}

export async function createManagedExperience(input: ManagedExperienceInput) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const profile = await getArtisanProfile(input.artisanKey);
  if (!profile) throw new Error("Save the Artisan public profile before publishing an experience.");
  const id = `experience-${crypto.randomUUID()}`;
  await db.insert(experiences).values({
    id,
    artisanKey: input.artisanKey,
    artisanName: toArtisanDisplayName(profile, profile.personalName),
    craftId: input.craftId,
    title: input.title,
    description: input.description,
    location: input.location,
    duration: input.duration,
    price: input.price,
    capacity: input.capacity,
    availableDates: input.availableDates,
    availableTimes: input.availableTimes,
    previewImageUrl: input.previewImageUrl,
    coverImageUrl: input.coverImageUrl,
    galleryImageUrls: JSON.stringify(input.galleryImageUrls),
    previewVideoUrl: input.previewVideoUrl,
    youtubeVideoUrl: input.youtubeVideoUrl,
    previewCaption: input.previewCaption,
    detourDistanceKm: input.detourDistanceKm,
    detourMinutes: input.detourMinutes,
    routeExplanation: input.routeExplanation,
    available: input.available,
  });
  return listExperiencesForArtisan(input.artisanKey).then((items) => items.find((item) => item.id === id) ?? null);
}

export async function updateManagedExperience(input: ManagedExperienceInput & { id: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const profile = await getArtisanProfile(input.artisanKey);
  if (!profile) throw new Error("Save the Artisan public profile before updating an experience.");
  await db.update(experiences).set({
    artisanName: toArtisanDisplayName(profile, profile.personalName),
    craftId: input.craftId,
    title: input.title,
    description: input.description,
    location: input.location,
    duration: input.duration,
    price: input.price,
    capacity: input.capacity,
    availableDates: input.availableDates,
    availableTimes: input.availableTimes,
    previewImageUrl: input.previewImageUrl,
    coverImageUrl: input.coverImageUrl,
    galleryImageUrls: JSON.stringify(input.galleryImageUrls),
    previewVideoUrl: input.previewVideoUrl,
    youtubeVideoUrl: input.youtubeVideoUrl,
    previewCaption: input.previewCaption,
    detourDistanceKm: input.detourDistanceKm,
    detourMinutes: input.detourMinutes,
    routeExplanation: input.routeExplanation,
    available: input.available,
    updatedAt: new Date(),
  }).where(and(eq(experiences.id, input.id), eq(experiences.artisanKey, input.artisanKey)));
  return listExperiencesForArtisan(input.artisanKey).then((items) => items.find((item) => item.id === input.id) ?? null);
}

export async function createBooking(input: { experienceId: string; travellerKey: string; travellerName: string; bookingDate: string; bookingTime: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const experience = await getPublishedExperience(input.experienceId);
  if (!experience) throw new Error("This experience is not currently available.");
  const traveller = await getOrCreateTravellerProfile({ travellerKey: input.travellerKey, displayName: input.travellerName });
  const id = `booking-${crypto.randomUUID()}`;
  await db.insert(bookings).values({
    id,
    experienceId: experience.id,
    artisanKey: experience.artisanKey,
    travellerKey: input.travellerKey,
    travellerName: traveller?.displayName ?? input.travellerName,
    bookingDate: input.bookingDate,
    bookingTime: input.bookingTime,
    status: "pending",
  });
  return getBookingWithProfile(id);
}

async function getBookingWithProfile(bookingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ booking: bookings, experience: experiences, profile: artisanProfiles, traveller: travellerProfiles })
    .from(bookings)
    .leftJoin(experiences, eq(bookings.experienceId, experiences.id))
    .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
    .leftJoin(travellerProfiles, eq(bookings.travellerKey, travellerProfiles.travellerKey))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  const row = rows[0];
  return row ? withResolvedBooking(row) : null;
}

export async function listBookingsForArtisan(artisanKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ booking: bookings, experience: experiences, profile: artisanProfiles, traveller: travellerProfiles })
    .from(bookings)
    .leftJoin(experiences, eq(bookings.experienceId, experiences.id))
    .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
    .leftJoin(travellerProfiles, eq(bookings.travellerKey, travellerProfiles.travellerKey))
    .where(eq(bookings.artisanKey, artisanKey))
    .orderBy(desc(bookings.createdAt));
  return rows.map(withResolvedBooking);
}

export async function listBookingsForTraveller(travellerKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const rows = await db.select({ booking: bookings, experience: experiences, profile: artisanProfiles, traveller: travellerProfiles })
    .from(bookings)
    .leftJoin(experiences, eq(bookings.experienceId, experiences.id))
    .leftJoin(artisanProfiles, eq(experiences.artisanKey, artisanProfiles.artisanKey))
    .leftJoin(travellerProfiles, eq(bookings.travellerKey, travellerProfiles.travellerKey))
    .where(eq(bookings.travellerKey, travellerKey))
    .orderBy(desc(bookings.createdAt));
  return rows.map(withResolvedBooking);
}

export async function updateBookingStatus(input: { bookingId: string; artisanKey: string; status: "accepted" | "rejected" }) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const current = await getBookingWithProfile(input.bookingId);
  if (!current) throw new Error("This booking could not be found.");
  if (current.booking.artisanKey !== input.artisanKey) throw new Error("Only the connected Artisan can respond to this booking.");
  if (current.booking.status !== "pending") throw new Error("This booking has already received an Artisan response.");
  await db.update(bookings).set({ status: input.status }).where(and(eq(bookings.id, input.bookingId), eq(bookings.artisanKey, input.artisanKey), eq(bookings.status, "pending")));
  return getBookingWithProfile(input.bookingId);
}

export async function removeBookingForTraveller(input: { bookingId: string; travellerKey: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");
  const current = await getBookingWithProfile(input.bookingId);
  if (!current) throw new Error("This booking could not be found.");
  if (current.booking.travellerKey !== input.travellerKey) throw new Error("Only the Traveller who made this request can remove it.");
  await db.delete(bookings).where(and(eq(bookings.id, input.bookingId), eq(bookings.travellerKey, input.travellerKey)));
  return { id: current.booking.id, experienceId: current.booking.experienceId };
}

export async function saveDemoState(input: { subjectKey: string; scope: DemoScope; payload: Record<string, unknown> }): Promise<PersistedDemoState> {
  const db = await getDb();
  if (!db) throw new Error("Persistent storage is temporarily unavailable.");

  const payload = JSON.stringify(input.payload);
  await db.insert(demoStates).values({
    subjectKey: input.subjectKey,
    scope: input.scope,
    payload,
  }).onDuplicateKeyUpdate({
    set: { payload, updatedAt: new Date() },
  });

  return { scope: input.scope, payload: input.payload, updatedAt: new Date() };
}
