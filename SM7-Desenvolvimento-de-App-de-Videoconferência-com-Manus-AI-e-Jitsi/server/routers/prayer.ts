import { z } from "zod";
import {
  createPrayerRequest,
  getPrayerRequests,
  getPrayerRequestsByUser,
  incrementPrayerCount,
  updatePrayerRequestStatus,
} from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const prayerRouter = router({
  list: publicProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getPrayerRequests(input.churchId)),

  myRequests: protectedProcedure.query(({ ctx }) => getPrayerRequestsByUser(ctx.user.id)),

  create: publicProcedure
    .input(
      z.object({
        churchId: z.number(),
        authorName: z.string().min(1),
        title: z.string().min(2),
        content: z.string().min(10),
        isAnonymous: z.boolean().default(false),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createPrayerRequest({ ...input, userId: ctx.user?.id });
      return { success: true };
    }),

  pray: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await incrementPrayerCount(input.id);
    return { success: true };
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["active", "answered", "archived"]) }))
    .mutation(async ({ input }) => {
      await updatePrayerRequestStatus(input.id, input.status);
      return { success: true };
    }),
});
