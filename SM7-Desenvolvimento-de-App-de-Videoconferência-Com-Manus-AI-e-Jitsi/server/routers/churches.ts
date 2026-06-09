import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createChurch, getAllChurches, getChurchById, getChurchBySlug, updateChurch } from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const churchesRouter = router({
  list: publicProcedure.query(() => getAllChurches()),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const church = await getChurchBySlug(input.slug);
    if (!church) throw new TRPCError({ code: "NOT_FOUND", message: "Igreja não encontrada" });
    return church;
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const church = await getChurchById(input.id);
    if (!church) throw new TRPCError({ code: "NOT_FOUND", message: "Igreja não encontrada" });
    return church;
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createChurch(input);
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateChurch(id, data);
      return { success: true };
    }),
});
