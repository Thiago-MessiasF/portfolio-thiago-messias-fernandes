import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 32 }),
  churchId: int("churchId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Churches (Multi-tenant) ──────────────────────────────────────────────────
export const churches = mysqlTable("churches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  primaryColor: varchar("primaryColor", { length: 20 }).default("#7C3AED"),
  secondaryColor: varchar("secondaryColor", { length: 20 }).default("#4C1D95"),
  accentColor: varchar("accentColor", { length: 20 }).default("#DDD6FE"),
  website: text("website"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("Brasil"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Church = typeof churches.$inferSelect;
export type InsertChurch = typeof churches.$inferInsert;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["culto", "celula", "conferencia", "retiro", "oracao", "outro"]).default("culto").notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  location: text("location"),
  isOnline: boolean("isOnline").default(false).notNull(),
  coverUrl: text("coverUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Livestreams ──────────────────────────────────────────────────────────────
export const livestreams = mysqlTable("livestreams", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  eventId: int("eventId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  streamUrl: text("streamUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  status: mysqlEnum("status", ["scheduled", "live", "ended"]).default("scheduled").notNull(),
  viewerCount: int("viewerCount").default(0),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  preacher: varchar("preacher", { length: 255 }),
  topic: text("topic"),
  aiSummary: text("aiSummary"),
  aiVerses: json("aiVerses"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Livestream = typeof livestreams.$inferSelect;
export type InsertLivestream = typeof livestreams.$inferInsert;

// ─── Recordings ───────────────────────────────────────────────────────────────
export const recordings = mysqlTable("recordings", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  livestreamId: int("livestreamId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"),
  preacher: varchar("preacher", { length: 255 }),
  topic: text("topic"),
  aiSummary: text("aiSummary"),
  aiVerses: json("aiVerses"),
  viewCount: int("viewCount").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  recordedAt: timestamp("recordedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = typeof recordings.$inferInsert;

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  livestreamId: int("livestreamId").notNull(),
  userId: int("userId"),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isModerated: boolean("isModerated").default(false).notNull(),
  moderationReason: text("moderationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Donations ────────────────────────────────────────────────────────────────
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  userId: int("userId"),
  donorName: varchar("donorName", { length: 255 }),
  donorEmail: varchar("donorEmail", { length: 320 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BRL").notNull(),
  method: mysqlEnum("method", ["pix", "cartao", "boleto", "transferencia"]).default("pix").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  message: text("message"),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

// ─── Prayer Requests ──────────────────────────────────────────────────────────
export const prayerRequests = mysqlTable("prayer_requests", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  userId: int("userId"),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  status: mysqlEnum("status", ["active", "answered", "archived"]).default("active").notNull(),
  prayerCount: int("prayerCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrayerRequest = typeof prayerRequests.$inferSelect;
export type InsertPrayerRequest = typeof prayerRequests.$inferInsert;

// ─── Jitsi Rooms ─────────────────────────────────────────────────────────────
export const jitsiRooms = mysqlTable("jitsi_rooms", {
  id: int("id").autoincrement().primaryKey(),
  churchId: int("churchId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  roomId: varchar("roomId", { length: 255 }).notNull().unique(),
  description: text("description"),
  type: mysqlEnum("type", ["reuniao", "celula", "oracao", "estudo", "outro"]).default("reuniao").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  maxParticipants: int("maxParticipants").default(50),
  createdBy: int("createdBy"),
  scheduledAt: timestamp("scheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JitsiRoom = typeof jitsiRooms.$inferSelect;
export type InsertJitsiRoom = typeof jitsiRooms.$inferInsert;
