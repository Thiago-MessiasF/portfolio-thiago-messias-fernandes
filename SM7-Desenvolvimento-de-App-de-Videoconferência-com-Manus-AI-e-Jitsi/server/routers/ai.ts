import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { updateLivestream, updateRecording } from "../db";

export const aiRouter = router({
  generateSummary: adminProcedure
    .input(z.object({ topic: z.string(), preacher: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente especializado em teologia cristã. Gere um resumo pastoral elegante e edificante de uma pregação.",
          },
          {
            role: "user",
            content: `Gere um resumo de 3-4 parágrafos para a pregação:\nTema: ${input.topic}\nPregador: ${input.preacher ?? "Não informado"}\nDescrição: ${input.description ?? ""}`,
          },
        ],
      });
      const content = response.choices[0]?.message?.content;
      const summary = typeof content === "string" ? content : "";
      return { summary };
    }),

  suggestVerses: publicProcedure
    .input(z.object({ topic: z.string() }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um especialista em teologia bíblica. Sugira versículos bíblicos relevantes para um tema de pregação.",
          },
          {
            role: "user",
            content: `Sugira 5 versículos bíblicos relevantes para o tema: "${input.topic}". Responda em JSON.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "verses_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reference: { type: "string" },
                      text: { type: "string" },
                      relevance: { type: "string" },
                    },
                    required: ["reference", "text", "relevance"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["verses"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : "{}";
      const parsed = JSON.parse(text);
      return parsed as { verses: Array<{ reference: string; text: string; relevance: string }> };
    }),

  saveSummaryToLivestream: adminProcedure
    .input(z.object({ livestreamId: z.number(), summary: z.string(), verses: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      await updateLivestream(input.livestreamId, {
        aiSummary: input.summary,
        aiVerses: input.verses as unknown as null,
      });
      return { success: true };
    }),

  saveSummaryToRecording: adminProcedure
    .input(z.object({ recordingId: z.number(), summary: z.string() }))
    .mutation(async ({ input }) => {
      await updateRecording(input.recordingId, { aiSummary: input.summary });
      return { success: true };
    }),
});
