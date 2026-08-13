import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "@ai-sdk/google";import { streamText, convertToModelMessages } from "ai";
import { scoreLead } from "./tools/scoreLead.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
model: google("gemini-3.6-flash"),
      system: `
You are a lead scoring assistant.

When the user asks you to score a sales lead and provides
company size, budget, and engagement, ALWAYS use the scoreLead tool.

Required information:
- companySize: number of employees
- budget: potential budget in USD
- engagement: low, medium, or high

After the tool finishes, briefly explain the result.
`,

      messages: modelMessages,

      tools: {
        scoreLead,
      },

      maxOutputTokens: 500,
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Failed to process the AI request.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running at http://localhost:${PORT}`);
});