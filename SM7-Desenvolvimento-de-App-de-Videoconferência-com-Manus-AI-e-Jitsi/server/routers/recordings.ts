import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRecording, getRecordingById, getRecordings, incrementRecordingView, updateRecording } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const recordingsRouter = router({
  list: publicProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getRecordings(input.churchId)),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const recording = await getRecordingById(input.id);
    if (!recording) throw new TRPCError({ code: "NOT_FOUND", message: "Gravação não encontrada" });
    await incrementRecordingView(input.id);
    return recording;
  }),

  create: adminProcedure
    .input(
      z.object({
        churchId: z.number(),
        title: z.string().min(2),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        preacher: z.string().optional(),
        topic: z.string().optional(),
        livestreamId: z.number().optional(),
        recordedAt: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createRecording({
        ...input,
        recordedAt: input.recordedAt ? new Date(input.recordedAt) : new Date(),
      });
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        preacher: z.string().optional(),
        topic: z.string().optional(),
        aiSummary: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateRecording(id, data);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const { getDb } = await import("../db");
    const { recordings } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(recordings).where(eq(recordings.id, input.id));
    return { success: true };
  }),
});
