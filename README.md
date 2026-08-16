# LeadRadar AI — Frontend Capstone

## Project Brief

**LeadRadar AI** is a frontend capstone project that helps sales teams qualify
inbound leads instantly. Users describe a lead in plain language (company size,
budget, and engagement level) and the app uses an AI lead-scoring tool to return
a score out of 100 with a **Hot / Warm / Cold** category, so sellers know where
to focus their time.

This project demonstrates AI-assisted development practices with a modern,
vanilla-JS frontend (HTML + CSS + JavaScript, built with Vite) backed by a small
Node.js/Express API that calls the Google Gemini API through the Vercel AI SDK.

## Target Users / Problem

- **Who:** Sales development representatives (SDRs) and small sales teams.
- **Problem:** Manually triaging a large number of raw leads is slow and
  inconsistent. SDRs need a quick, repeatable way to rank leads so they can
  prioritize follow-up.
- **Solution:** Describe a lead once, get a deterministic, explainable score and
  category computed from company size, budget, and engagement.

## Features

- **AI Lead Scoring dashboard** — describe a lead in natural language; the model
  extracts structured fields and calls the `scoreLead` tool.
- **Streaming response UI** — shows live tool input building, the received lead
  fields, and the final score card (with progress bar).
- **Example prompts** — one-click suggestion buttons to try the feature.
- **Retry on failure** — failed requests render a friendly error with a Retry
  button; no data is lost.
- **Settings page** — profile form, account/password form, and notification
  preferences, all persisted to `localStorage` with inline validation.
- **Clear All Data** — wipes local storage.
- **Accessibility** — WCAG 2.1 AA-oriented: skip link, labeled inputs, `aria-live`
  announcements, visible focus states, `aria-invalid` on errors, reduced-motion
  support.
- **Responsive** — mobile and desktop layouts.

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | HTML5, CSS3, vanilla JavaScript (ES modules)        |
| Build tool     | [Vite](https://vitejs.dev/)                         |
| Server         | Node.js + [Express](https://expressjs.com/)         |
| AI             | [Vercel AI SDK](https://ai-sdk.dev/) + `@ai-sdk/google` (Gemini 3.6 Flash) |
| Validation     | [Zod](https://zod.dev/)                             |
| Tests          | Node.js built-in test runner (`node:test`)          |
| Deployment     | Vercel (static frontend + serverless `api/chat`)    |

## Setup

Requirements: Node.js 18+ (tested on Node 24).

```bash
# 1. Clone
git clone https://github.com/Abanoub-5/frontend-capstone.git
cd frontend-capstone

# 2. Install dependencies
npm install

# 3. Create the environment file
#    Copy .env.example to .env (see Environment Variables below)

# 4. Start the AI API server (terminal 1)
node server/index.js

# 5. Start the frontend dev server (terminal 2)
npm run dev
```

Open http://localhost:5173 (Vite proxies `/api` to the server on port 3000).

## Environment Variables

Create a `.env` file in the project root:

```env
# Required for the AI feature
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-studio-api-key

# Optional (defaults to 3000)
PORT=3000
```

| Variable                        | Required | Description                                       |
| ------------------------------- | -------- | ------------------------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY`  | Yes      | API key from [Google AI Studio](https://aistudio.google.com/). **Server-side only — never ship it in the frontend bundle.** |
| `PORT`                          | No       | Port for the Express API server (default `3000`). |

> The API key is read by the Express server via `dotenv`. It is git-ignored
> (`.env` is in `.gitignore`) and is never bundled into the client.

## Architecture

```
Browser (Vite dev server / static build)
   │  fetch /api/chat  (SSE stream)
   ▼
Express server (server/app.js, also exported as api/chat.js for Vercel)
   │  validate messages → check API key → convertToModelMessages
   ▼
Vercel AI SDK streamText
   │  model: google("gemini-3.6-flash")
   │  tools: { scoreLead }
   ▼
Gemini API
```

- `index.html` / `settings.html` — the two pages (Vite multi-page build).
- `chat.js` — dashboard logic: submit, SSE parsing, streaming render, retry.
- `settings.js` — settings forms + `localStorage` persistence.
- `src/validation.js` — pure validation rules shared with the UI.
- `src/chatUtils.js` — pure helpers: HTML escaping, SSE parsing, error mapping.
- `server/app.js` — Express app: message validation + AI streaming route.
- `server/tools/scoreLead.js` — the `scoreLead` AI tool (Zod-validated input/output).
- `api/chat.js` — Vercel serverless entry point re-exporting the Express app.

## AI Integration

- The user prompt is streamed to **Gemini 3.6 Flash** via the AI SDK.
- The system prompt instructs the model to extract `companySize`, `budget`, and
  `engagement`, ask for any missing values, and then **always** call the
  `scoreLead` tool.
- **`scoreLead` tool** (`server/tools/scoreLead.js`):
  - Input schema (Zod): `companySize` (int ≥ 1), `budget` (≥ 0),
    `engagement` (`low | medium | high`).
  - Output schema (Zod): `score` (0–100), `category` (`Hot | Warm | Cold`),
    plus the echoed inputs.
  - Scoring: 10–30 pts for size, 10–40 for budget, 10–30 for engagement;
    `Hot ≥ 70`, `Warm ≥ 40`, else `Cold`.
- **Security & resilience:**
  - The API key stays server-side; the client never sees it.
  - Incoming messages are validated (count, length, shape, roles) before any AI
    call; oversized/empty/invalid requests get a `400`.
  - Tool input **and** output are validated with Zod so malformed responses
    cannot crash the app.
  - Provider failures, rate limits, network interruptions, and stream errors map
    to friendly, human-readable error UI with a Retry action.

## Testing

The project uses Node.js's built-in test runner — no extra test dependencies.

```bash
npm test
```

Coverage (25 tests):

- `tests/validation.test.js` — username, email, display name, bio, avatar URL,
  password, and password-confirmation rules.
- `tests/scoreLead.test.js` — Hot/Warm/Cold classification, edge inputs, and
  Zod schema rejection of invalid tool input/output.
- `tests/chatUtils.test.js` — HTML escaping, SSE parsing, buffer handling, and
  error-to-message mapping (HTTP, network, tool, and unknown errors).

## Deployment

The frontend builds to static files with `vite build`; the Express app is
re-exported as a Vercel serverless function through `api/chat.js`.

```bash
npm run build
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for the pre-launch
checklist. The recommended host is **Vercel** (framework preset: Vite), with
`GOOGLE_GENERATIVE_AI_API_KEY` set as an environment variable (not in the repo).

## Accessibility

Oriented to WCAG 2.1 AA:

- Skip-to-content link on both pages.
- All inputs have programmatic labels.
- Errors use `aria-invalid` + `aria-describedby` and get keyboard focus on submit.
- Loading and status changes announced via `aria-live`/`role="status"`;
  the final score is announced to screen readers.
- Visible `:focus-visible` rings on links, buttons, inputs, and toggles.
- Semantic headings and landmarks; single `<h1>` per page.
- `prefers-reduced-motion` disables animations.
- Responsive single-column layouts on small screens with touch-friendly targets.

See [AUDIT.md](./AUDIT.md) for the accessibility/performance audit notes.

## Limitations

- **Demo persistence:** profile and notification data live in `localStorage`
  only — no backend account system.
- **AI dependency:** scoring requires a valid Gemini API key and network access;
  without them the chat shows a clear error and Retry.
- **Single-turn focus:** the conversation is capped at 20 messages and the UI is
  built around the lead-scoring use case, not open-ended chat.
- **No offline mode:** the app needs the API for its core feature.

## Future Improvements

- Real authentication and server-side user profiles.
- Persisted lead history with a data store.
- More AI tools (e.g., summary generation, next-step suggestions).
- Add a lightweight end-to-end test using a headless browser.
- Automated Lighthouse CI check and axe-core assertions.