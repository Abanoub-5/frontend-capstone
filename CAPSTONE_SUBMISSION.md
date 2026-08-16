# Capstone Submission — LeadRadar AI

## Project Brief

**LeadRadar AI** is a frontend capstone that helps sales teams qualify leads in
seconds. A user describes a lead in plain language — company size, budget, and
engagement — and the app streams a request to **Gemini 3.6 Flash** which calls a
Zod-validated `scoreLead` tool, returning a score out of 100 and a
**Hot / Warm / Cold** category with a short explanation.

Built with a vanilla HTML/CSS/JS frontend (Vite), an Express API, and the Vercel
AI SDK. Demonstrates AI-assisted development, structured validation, streaming
UI, accessibility, responsive layout, and automated tests.

## Live Application

**Production URL:** TODO — not yet deployed / URL not discoverable in this
environment (no Vercel credentials or `gh` CLI available).

## Repository

- GitHub: https://github.com/Abanoub-5/frontend-capstone

## Features

- **AI lead scoring dashboard** with streaming tool UI (input build → received
  fields → score card).
- **Example/suggestion prompts** for one-click try-out.
- **Retry on failure** with friendly, human-readable errors.
- **Settings page**: profile, password, and notification preferences persisted
  to `localStorage` with inline validation.
- **Clear All Data** utility.

## AI Integration

- Provider: Google Gemini (`gemini-3.6-flash`) via `@ai-sdk/google` + AI SDK.
- Server-side API key only (`GOOGLE_GENERATIVE_AI_API_KEY` in `.env`, git-ignored).
- Tool: `scoreLead` (`server/tools/scoreLead.js`) with Zod **input** and
  **output** schemas.
- Server validates message count, length, shape, and roles before calling the
  model.
- Malformed responses, rate limits, network failures, and stream errors all map
  to safe UI states (no crashes; Retry available).

## Testing Evidence

Run with: `npm test` (Node built-in `node:test`, no extra dependencies).

```
tests 25
pass 25
fail 0
```

Coverage:
- `tests/validation.test.js` — all form validation rules.
- `tests/scoreLead.test.js` — Hot/Warm/Cold logic + Zod input/output schema
  rejection.
- `tests/chatUtils.test.js` — HTML escaping, SSE parsing, buffer handling,
  HTTP/network/tool error mapping.

## Performance & Accessibility

- **Build:** `npm run build` succeeds (Vite). Measured output: main JS 8.79 kB
  gzip, settings JS 1.57 kB gzip, CSS 2.96 kB gzip, two small HTML pages.
- **Accessibility (WCAG 2.1 AA-oriented):** skip link, labeled inputs,
  `aria-invalid` + focus-to-first-error, `aria-live` announcements (including
  the final AI score), visible focus rings, `prefers-reduced-motion`,
  single-column responsive layout.
- **Note:** Lighthouse was not run (no lab environment available); see
  [AUDIT.md](./AUDIT.md). No scores are fabricated.

## Deployment & Operation

- Frontend: static Vite build (`dist/`), multi-page (`index.html`,
  `settings.html`).
- API: Express app re-exported as a Vercel serverless function (`api/chat.js`),
  proxied from the frontend (`/api/chat`).
- Env var: `GOOGLE_GENERATIVE_AI_API_KEY` (host-side secret).
- See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for the verified
  checklist and rollback plan.

## Known Limitations

- Profile/notification data is demo-only (`localStorage`, no backend accounts).
- Core feature requires the Gemini API (valid key + network).
- Conversation capped at 20 messages; focus is lead scoring, not open chat.
- No end-to-end DOM test yet (unit tests cover pure logic).

## Reflection

See [REFLECTION.md](./REFLECTION.md). The hardest part was the streaming AI
tool integration; the biggest win was constraining the model with strict Zod
schemas rather than prompt text alone.