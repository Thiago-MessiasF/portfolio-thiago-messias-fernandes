import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const eventsRouter = router({
  list: publicProcedure
    .input(z.object({ churchId: z.number(), upcoming: z.boolean().optional() }))
    .query(({ input }) => getEvents(input.churchId, input.upcoming)),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const event = await getEventById(input.id);
    if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento não encontrado" });
    return event;
  }),

  create: adminProcedure
    .input(
      z.object({
        churchId: z.number(),
        title: z.string().min(2),
        description: z.string().optional(),
        type: z.enum(["culto", "celula", "conferencia", "retiro", "oracao", "outro"]).default("culto"),
        startAt: z.number(),
        endAt: z.number().optional(),
        location: z.string().optional(),
        isOnline: z.boolean().default(false),
        coverUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createEvent({
        ...input,
        startAt: new Date(input.startAt),
        endAt: input.endAt ? new Date(input.endAt) : undefined,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        type: z.enum(["culto", "celula", "conferencia", "retiro", "oracao", "outro"]).optional(),
        startAt: z.number().optional(),
        endAt: z.number().optional(),
        location: z.string().optional(),
        isOnline: z.boolean().optional(),
        coverUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, startAt, endAt, ...rest } = input;
      await updateEvent(id, {
        ...rest,
        ...(startAt ? { startAt: new Date(startAt) } : {}),
        ...(endAt ? { endAt: new Date(endAt) } : {}),
      });
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteEvent(input.id);
    return { success: true };
  }),
});
