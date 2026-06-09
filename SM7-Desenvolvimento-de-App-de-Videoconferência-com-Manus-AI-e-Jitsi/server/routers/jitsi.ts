import { z } from "zod";
import { createJitsiRoom, deleteJitsiRoom, getJitsiRoomById, getJitsiRooms, updateJitsiRoom } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { nanoid } from "nanoid";

export const jitsiRouter = router({
  list: publicProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getJitsiRooms(input.churchId)),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getJitsiRoomById(input.id);
  }),

  create: adminProcedure
    .input(
      z.object({
        churchId: z.number(),
        name: z.string().min(2),
        description: z.string().optional(),
        type: z.enum(["reuniao", "celula", "oracao", "estudo", "outro"]).default("reuniao"),
        maxParticipants: z.number().default(50),
        scheduledAt: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const roomId = `church-${input.churchId}-${nanoid(10)}`;
      await createJitsiRoom({
        ...input,
        roomId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        createdBy: ctx.user.id,
      });
      return { success: true, roomId };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateJitsiRoom(id, data);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteJitsiRoom(input.id);
    return { success: true };
  }),
});
