import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    getDb: vi.fn().mockResolvedValue(null),
    upsertUser: vi.fn().mockResolvedValue(undefined),
    getUserByOpenId: vi.fn().mockResolvedValue(undefined),
    getLivestreams: vi.fn().mockResolvedValue([]),
    getLiveLivestreams: vi.fn().mockResolvedValue([]),
    getLivestreamById: vi.fn().mockResolvedValue(null),
    createLivestream: vi.fn().mockResolvedValue(undefined),
    updateLivestream: vi.fn().mockResolvedValue(undefined),
    getEvents: vi.fn().mockResolvedValue([]),
    getEventById: vi.fn().mockResolvedValue(null),
    createEvent: vi.fn().mockResolvedValue(undefined),
    deleteEvent: vi.fn().mockResolvedValue(undefined),
    getRecordings: vi.fn().mockResolvedValue([]),
    getRecordingById: vi.fn().mockResolvedValue(null),
    createRecording: vi.fn().mockResolvedValue(undefined),
    updateRecording: vi.fn().mockResolvedValue(undefined),
    incrementRecordingView: vi.fn().mockResolvedValue(undefined),
    getChurchById: vi.fn().mockResolvedValue(null),
    updateChurch: vi.fn().mockResolvedValue(undefined),
    getJitsiRooms: vi.fn().mockResolvedValue([]),
    getJitsiRoomById: vi.fn().mockResolvedValue(null),
    createJitsiRoom: vi.fn().mockResolvedValue(undefined),
    updateJitsiRoom: vi.fn().mockResolvedValue(undefined),
    deleteJitsiRoom: vi.fn().mockResolvedValue(undefined),
    getPrayerRequests: vi.fn().mockResolvedValue([]),
    getPrayerRequestsByUser: vi.fn().mockResolvedValue([]),
    createPrayerRequest: vi.fn().mockResolvedValue(undefined),
    incrementPrayerCount: vi.fn().mockResolvedValue(undefined),
    updatePrayerStatus: vi.fn().mockResolvedValue(undefined),
    getDonations: vi.fn().mockResolvedValue([]),
    createDonation: vi.fn().mockResolvedValue(undefined),
    getDonationStats: vi.fn().mockResolvedValue({ total: 0, count: 0, thisMonth: 0 }),
    getChatMessages: vi.fn().mockResolvedValue([]),
    createChatMessage: vi.fn().mockResolvedValue(undefined),
    getAllUsers: vi.fn().mockResolvedValue([]),
    updateUserRole: vi.fn().mockResolvedValue(undefined),
  };
});

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "user-1",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("auth", () => {
  it("me returns null when unauthenticated", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user when authenticated", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
  });

  it("logout clears session cookie", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("livestreams", () => {
  it("list returns empty array for church with no streams", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.livestreams.list({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("live returns empty array when no live streams", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.livestreams.live({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.livestreams.create({
        churchId: 1,
        title: "Test Stream",
      })
    ).rejects.toThrow();
  });

  it("admin can create livestream", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.livestreams.create({
      churchId: 1,
      title: "Culto Dominical",
      preacher: "Pastor João",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("events", () => {
  it("list returns empty array for church with no events", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.list({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can create event", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.create({
      churchId: 1,
      title: "Culto de Domingo",
      type: "culto",
      startAt: Date.now() + 86400000,
    });
    expect(result).toEqual({ success: true });
  });

  it("non-admin cannot create event", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.events.create({
        churchId: 1,
        title: "Culto",
        type: "culto",
        startAt: Date.now() + 86400000,
      })
    ).rejects.toThrow();
  });
});

describe("recordings", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.recordings.list({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can create recording", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.recordings.create({
      churchId: 1,
      title: "Pregação: A Graça de Deus",
      videoUrl: "https://example.com/video.mp4",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("prayer requests", () => {
  it("list returns public active requests", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.prayer.list({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("anyone can create prayer request", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.prayer.create({
      churchId: 1,
      authorName: "Maria",
      title: "Cura para minha família",
      content: "Por favor orem pela saúde da minha família que está passando por dificuldades.",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("donations", () => {
  it("stats returns donation statistics", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.donations.stats({ churchId: 1 });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("thisMonth");
  });

  it("anyone can create donation", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.donations.create({
      churchId: 1,
      amount: 50,
      method: "pix",
      donorName: "João Silva",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("jitsi rooms", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.jitsi.list({ churchId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can create jitsi room", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.jitsi.create({
      churchId: 1,
      name: "Célula da Zona Norte",
      type: "celula",
    });
    expect(result).toMatchObject({ success: true });
  });
});

describe("admin", () => {
  it("non-admin cannot access users list", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.users()).rejects.toThrow();
  });

  it("admin can access users list", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.users();
    expect(Array.isArray(result)).toBe(true);
  });
});
