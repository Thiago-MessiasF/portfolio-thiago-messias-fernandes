import { z } from "zod";
import { createDonation, getDonationStats, getDonations, getDonationsByUser, updateDonationStatus } from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const donationsRouter = router({
  list: adminProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getDonations(input.churchId)),

  myDonations: protectedProcedure.query(({ ctx }) => getDonationsByUser(ctx.user.id)),

  stats: adminProcedure.input(z.object({ churchId: z.number() })).query(({ input }) => getDonationStats(input.churchId)),

  create: publicProcedure
    .input(
      z.object({
        churchId: z.number(),
        donorName: z.string().optional(),
        donorEmail: z.string().email().optional(),
        amount: z.number().positive(),
        method: z.enum(["pix", "cartao", "boleto", "transferencia"]).default("pix"),
        message: z.string().optional(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createDonation({
        churchId: input.churchId,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        amount: input.amount.toFixed(2) as unknown as never,
        method: input.method,
        message: input.message,
        isAnonymous: input.isAnonymous,
        userId: ctx.user?.id,
        status: "completed",
        transactionId: `TXN-${Date.now()}`,
      });
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "completed", "failed", "refunded"]) }))
    .mutation(async ({ input }) => {
      await updateDonationStatus(input.id, input.status);
      return { success: true };
    }),
});
