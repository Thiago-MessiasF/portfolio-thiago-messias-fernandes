import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLivestream, getLiveLivestreams, getLivestreamById, getLivestreams, updateLivestream } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const livestreamsRouter = router({
  list: publicProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getLivestreams(input.churchId)),

  live: publicProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getLiveLivestreams(input.churchId)),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const stream = await getLivestreamById(input.id);
    if (!stream) throw new TRPCError({ code: "NOT_FOUND", message: "Transmissão não encontrada" });
    return stream;
  }),

  create: adminProcedure
    .input(
      z.object({
        churchId: z.number(),
        title: z.string().min(2),
        description: z.string().optional(),
        streamUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        scheduledAt: z.number().optional(),
        preacher: z.string().optional(),
        topic: z.string().optional(),
        eventId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createLivestream({
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["scheduled", "live", "ended"]),
      })
    )
    .mutation(async ({ input }) => {
      const updates: Record<string, unknown> = { status: input.status };
      if (input.status === "live") updates.startedAt = new Date();
      if (input.status === "ended") updates.endedAt = new Date();
      await updateLivestream(input.id, updates as Parameters<typeof updateLivestream>[1]);
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        streamUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        preacher: z.string().optional(),
        topic: z.string().optional(),
        aiSummary: z.string().optional(),
        aiVerses: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateLivestream(id, data as Parameters<typeof updateLivestream>[1]);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const { getDb } = await import("../db");
    const { livestreams } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(livestreams).where(eq(livestreams.id, input.id));
    return { success: true };
  }),

  incrementViewers: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const stream = await getLivestreamById(input.id);
    if (stream) {
      await updateLivestream(input.id, { viewerCount: (stream.viewerCount ?? 0) + 1 });
    }
    return { success: true };
  }),
});
