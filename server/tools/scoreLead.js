import { tool } from "ai";
import { z } from "zod";

export const scoreLead = tool({
  description:
    "Scores a sales lead based on company size, budget, and engagement level.",

  inputSchema: z.object({
    companySize: z
      .number()
      .int()
      .min(1)
      .describe("Number of employees in the company"),

    budget: z
      .number()
      .min(0)
      .describe("Potential customer budget in USD"),

    engagement: z
      .enum(["low", "medium", "high"])
      .describe("The lead's engagement level"),
  }),

  outputSchema: z.object({
    score: z.number().int().min(0).max(100),
    category: z.enum(["Hot", "Warm", "Cold"]),
    companySize: z.number(),
    budget: z.number(),
    engagement: z.enum(["low", "medium", "high"]),
  }),

  execute: async ({ companySize, budget, engagement }) => {
    let score = 0;

    if (companySize >= 100) {
      score += 30;
    } else if (companySize >= 50) {
      score += 20;
    } else {
      score += 10;
    }

    if (budget >= 10000) {
      score += 40;
    } else if (budget >= 5000) {
      score += 25;
    } else {
      score += 10;
    }

    if (engagement === "high") {
      score += 30;
    } else if (engagement === "medium") {
      score += 20;
    } else {
      score += 10;
    }

    const category =
      score >= 70 ? "Hot" : score >= 40 ? "Warm" : "Cold";

    return {
      score,
      category,
      companySize,
      budget,
      engagement,
    };
  },
});