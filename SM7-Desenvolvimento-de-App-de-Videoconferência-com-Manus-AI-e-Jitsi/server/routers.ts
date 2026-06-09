import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getAllUsers, updateUserProfile } from "./db";
import { churchesRouter } from "./routers/churches";
import { eventsRouter } from "./routers/events";
import { livestreamsRouter } from "./routers/livestreams";
import { recordingsRouter } from "./routers/recordings";
import { chatRouter } from "./routers/chat";
import { donationsRouter } from "./routers/donations";
import { prayerRouter } from "./routers/prayer";
import { jitsiRouter } from "./routers/jitsi";
import { aiRouter } from "./routers/ai";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Feature routers
  churches: churchesRouter,
  events: eventsRouter,
  livestreams: livestreamsRouter,
  recordings: recordingsRouter,
  chat: chatRouter,
  donations: donationsRouter,
  prayer: prayerRouter,
  jitsi: jitsiRouter,
  ai: aiRouter,

  // Admin
  admin: router({
    users: adminProcedure.query(() => getAllUsers()),
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // User profile
  profile: router({
    update: protectedProcedure
      .input(z.object({ name: z.string().optional(), phone: z.string().optional(), avatarUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
