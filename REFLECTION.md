# Reflection

## Hardest part and why

The hardest part was the **AI tool integration and streaming UI** —
specifically making the model reliably hand structured lead data to the
`scoreLead` tool and then rendering that interaction live without breaking
when things go wrong.

Why it was hard: the AI output is inherently non-deterministic. A model can
decide to ask a clarifying question, emit partial JSON while building a tool
call, or simply fail mid-stream. Handling that meant:

- defining strict Zod input and output schemas so bad data can never reach or
  leave the tool,
- writing an SSE parser that tolerates incomplete chunks and malformed lines,
- mapping every failure mode (HTTP status, network drop, tool error, stream
  error) to a friendly message instead of a crash,
- and building a loading/streaming UI that stays honest about what the AI is
  doing at each step.

The interplay between "streaming is asynchronous" and "the user pressed Retry"
also had to be carefully sequenced so a retry could not double-submit.

## What I would do differently

1. **Add tests earlier.** Most of the session's risk was in chat/streaming
   logic, but the test suite was added at the end. Writing the `node:test`
   tests as the utilities were built would have caught edge cases sooner.
2. **Keep validation fully shared.** Right now client validation and server
   validation live in separate files. A single shared validation module (used
   by both the browser and the API) would prevent drift between the two.
3. **Add a headless end-to-end test.** The current suite is excellent for pure
   logic but does not exercise the real DOM. A small Playwright/jsdom smoke
   test for "type a prompt → score card appears" would close the biggest
   coverage gap.
4. **Run Lighthouse before calling it done.** I deliberately did not invent
   scores, which means accessibility/performance numbers are still missing for
   the final report.

## One surprising lesson

**A well-defined tool contract makes the AI more reliable than the prompt does.**
Early attempts tried to make the model "behave" through the system prompt alone.
The real breakthrough was the Zod input schema on the `scoreLead` tool: once the
model had a strict schema, its tool calls were far more consistent, and every
malformed attempt was rejected deterministically instead of letting bad data
propagate. The lesson: when integrating an LLM, constrain it with structure
(schemas, types, validation) rather than hoping instructions alone will hold.