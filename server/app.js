import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { scoreLead } from "./tools/scoreLead.js";

dotenv.config();

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "Provide at least one message.";
  }

  if (messages.length > MAX_MESSAGES) {
    return "Too many messages in this conversation.";
  }

  for (const message of messages) {
    if (!message || typeof message !== "object") {
      return "Invalid message format.";
    }

    if (message.role !== "user" && message.role !== "assistant") {
      return "Invalid message role.";
    }

    if (!Array.isArray(message.parts)) {
      return "Invalid message parts.";
    }

    const text = message.parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();

    if (!text) {
      return "Message text is required.";
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return "Message is too long.";
    }
  }

  return null;
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "50kb" }));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body ?? {};

    const validationError = validateMessages(messages);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");

      return res.status(500).json({
        error: "The AI service is not configured yet. Please try again later.",
      });
    }

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

If the user does not provide all three values, ask for the missing ones.
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

export default app;