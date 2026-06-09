import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  chatMessages,
  churches,
  donations,
  events,
  jitsiRooms,
  livestreams,
  prayerRequests,
  recordings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
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
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUserProfile(userId: number, data: { name?: string; phone?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Churches ─────────────────────────────────────────────────────────────────
export async function getAllChurches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(churches).where(eq(churches.isActive, true)).orderBy(churches.name);
}

export async function getChurchBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(churches).where(eq(churches.slug, slug)).limit(1);
  return result[0];
}

export async function getChurchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(churches).where(eq(churches.id, id)).limit(1);
  return result[0];
}

export async function createChurch(data: typeof churches.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(churches).values(data);
  return result;
}

export async function updateChurch(id: number, data: Partial<typeof churches.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(churches).set(data).where(eq(churches.id, id));
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function getEvents(churchId: number, upcoming = false) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(events.churchId, churchId), eq(events.isPublished, true)];
  if (upcoming) conditions.push(gte(events.startAt, new Date()));
  return db.select().from(events).where(and(...conditions)).orderBy(events.startAt);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: typeof events.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(events).values(data);
  return result;
}

export async function updateEvent(id: number, data: Partial<typeof events.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(events).where(eq(events.id, id));
}

// ─── Livestreams ──────────────────────────────────────────────────────────────
export async function getLivestreams(churchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(livestreams).where(eq(livestreams.churchId, churchId)).orderBy(desc(livestreams.createdAt));
}

export async function getLiveLivestreams(churchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(livestreams)
    .where(and(eq(livestreams.churchId, churchId), eq(livestreams.status, "live")))
    .orderBy(desc(livestreams.startedAt));
}

export async function getLivestreamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(livestreams).where(eq(livestreams.id, id)).limit(1);
  return result[0];
}

export async function createLivestream(data: typeof livestreams.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(livestreams).values(data);
  return result;
}

export async function updateLivestream(id: number, data: Partial<typeof livestreams.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(livestreams).set(data).where(eq(livestreams.id, id));
}

// ─── Recordings ───────────────────────────────────────────────────────────────
export async function getRecordings(churchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(recordings)
    .where(and(eq(recordings.churchId, churchId), eq(recordings.isPublished, true)))
    .orderBy(desc(recordings.recordedAt));
}

export async function getRecordingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(recordings).where(eq(recordings.id, id)).limit(1);
  return result[0];
}

export async function createRecording(data: typeof recordings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(recordings).values(data);
  return result;
}

export async function updateRecording(id: number, data: Partial<typeof recordings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(recordings).set(data).where(eq(recordings.id, id));
}

export async function incrementRecordingView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(recordings).set({ viewCount: sql`viewCount + 1` }).where(eq(recordings.id, id));
}

// ─── Chat Messages ────────────────────────────────────────────────────────────
export async function getChatMessages(livestreamId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.livestreamId, livestreamId), eq(chatMessages.isModerated, false)))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

export async function createChatMessage(data: typeof chatMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(chatMessages).values(data);
  return result;
}

export async function moderateChatMessage(id: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(chatMessages).set({ isModerated: true, moderationReason: reason }).where(eq(chatMessages.id, id));
}

// ─── Donations ────────────────────────────────────────────────────────────────
export async function getDonations(churchId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(donations).where(eq(donations.churchId, churchId)).orderBy(desc(donations.createdAt)).limit(limit);
}

export async function getDonationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(donations).where(eq(donations.userId, userId)).orderBy(desc(donations.createdAt));
}

export async function createDonation(data: typeof donations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(donations).values(data);
  return result;
}

export async function updateDonationStatus(id: number, status: "pending" | "completed" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(donations).set({ status }).where(eq(donations.id, id));
}

export async function getDonationStats(churchId: number) {
  const db = await getDb();
  if (!db) return { total: 0, count: 0, thisMonth: 0 };
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allDonations = await db
    .select()
    .from(donations)
    .where(and(eq(donations.churchId, churchId), eq(donations.status, "completed")));

  const total = allDonations.reduce((sum, d) => sum + parseFloat(String(d.amount)), 0);
  const thisMonth = allDonations
    .filter((d) => d.createdAt >= firstOfMonth)
    .reduce((sum, d) => sum + parseFloat(String(d.amount)), 0);

  return { total, count: allDonations.length, thisMonth };
}

// ─── Prayer Requests ──────────────────────────────────────────────────────────
export async function getPrayerRequests(churchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(prayerRequests)
    .where(and(eq(prayerRequests.churchId, churchId), eq(prayerRequests.isPublic, true)))
    .orderBy(desc(prayerRequests.createdAt));
}

export async function getPrayerRequestsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prayerRequests).where(eq(prayerRequests.userId, userId)).orderBy(desc(prayerRequests.createdAt));
}

export async function createPrayerRequest(data: typeof prayerRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(prayerRequests).values(data);
  return result;
}

export async function incrementPrayerCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(prayerRequests).set({ prayerCount: sql`prayerCount + 1` }).where(eq(prayerRequests.id, id));
}

export async function updatePrayerRequestStatus(id: number, status: "active" | "answered" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(prayerRequests).set({ status }).where(eq(prayerRequests.id, id));
}

// ─── Jitsi Rooms ─────────────────────────────────────────────────────────────
export async function getJitsiRooms(churchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jitsiRooms).where(eq(jitsiRooms.churchId, churchId)).orderBy(desc(jitsiRooms.createdAt));
}

export async function getJitsiRoomById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jitsiRooms).where(eq(jitsiRooms.id, id)).limit(1);
  return result[0];
}

export async function createJitsiRoom(data: typeof jitsiRooms.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(jitsiRooms).values(data);
  return result;
}

export async function updateJitsiRoom(id: number, data: Partial<typeof jitsiRooms.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(jitsiRooms).set(data).where(eq(jitsiRooms.id, id));
}

export async function deleteJitsiRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(jitsiRooms).where(eq(jitsiRooms.id, id));
}
