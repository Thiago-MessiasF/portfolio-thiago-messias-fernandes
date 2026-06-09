import { z } from "zod";
import { createChatMessage, getChatMessages, moderateChatMessage } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const OFFENSIVE_WORDS = ["palavrão", "ofensa", "ódio", "spam"];

async function moderateWithAI(content: string): Promise<{ isOffensive: boolean; reason: string }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system" as const,
          content:
            "Você é um moderador de chat para uma plataforma religiosa cristã. Analise a mensagem e determine se ela é ofensiva, inapropriada, spam, ou contrária aos valores cristãos. Responda APENAS com JSON: {\"isOffensive\": boolean, \"reason\": string}",
        },
        { role: "user" as const, content: `Mensagem: "${content}"` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isOffensive: { type: "boolean" },
              reason: { type: "string" },
            },
            required: ["isOffensive", "reason"],
            additionalProperties: false,
          },
        },
      },
    });
    const rawContent = response.choices[0]?.message?.content;
    const text = typeof rawContent === "string" ? rawContent : "{}";
    return JSON.parse(text);
  } catch {
    const lower = content.toLowerCase();
    const found = OFFENSIVE_WORDS.some((w) => lower.includes(w));
    return { isOffensive: found, reason: found ? "Palavra ofensiva detectada" : "" };
  }
}

export const chatRouter = router({
  list: publicProcedure
    .input(z.object({ livestreamId: z.number(), limit: z.number().default(50) }))
    .query(({ input }) => getChatMessages(input.livestreamId, input.limit)),

  send: publicProcedure
    .input(
      z.object({
        livestreamId: z.number(),
        content: z.string().min(1).max(500),
        authorName: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const modResult = await moderateWithAI(input.content);
      await createChatMessage({
        livestreamId: input.livestreamId,
        content: input.content,
        authorName: input.authorName,
        userId: ctx.user?.id,
        isModerated: modResult.isOffensive,
        moderationReason: modResult.isOffensive ? modResult.reason : undefined,
      });
      return { success: true, moderated: modResult.isOffensive };
    }),

  moderate: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      await moderateChatMessage(input.id, input.reason);
      return { success: true };
    }),
});
