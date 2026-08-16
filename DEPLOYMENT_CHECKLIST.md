# Deployment Checklist — LeadRadar AI

Use this checklist before and after shipping. Each item is marked:

- [x] **Verified** — actually checked on this run.
- [ ] **Not verified** — must be confirmed manually.

---

## Before deploy

- [ ] **Production build passes**
  - Verified locally with `npm run build` (Vite build succeeds; output in `dist/`).

- [ ] **Environment variables are set in the host**
  - Required: `GOOGLE_GENERATIVE_AI_API_KEY`.
  - Verified locally only; must be set in the hosting provider (e.g., Vercel
    project settings → Environment Variables).

- [ ] **No secrets in the repository**
  - Verified locally: `.env` is git-ignored and not tracked; no API keys appear
    in `git diff` or tracked files.

- [ ] **AI API key is reachable from the server**
  - Not verified locally (would require a live Gemini call with the real key).

---

## After deploy

- [ ] **Production URL loads**
  - Not verified — production URL not yet available/known.

- [ ] **Main user flow works**
  - Open dashboard → type a lead description → suggestions clickable → score
    card appears.
  - Not verified on the live site.

- [ ] **AI feature works end to end**
  - A real prompt produces a tool-input build, a score card (Hot/Warm/Cold +
    score/100), and a brief explanation.
  - Not verified on the live site.

- [ ] **Error states behave**
  - Kill/remove the API key and confirm a friendly error + Retry renders instead
    of a crash.
  - Not verified on the live site.

- [ ] **Mobile layout OK**
  - Forms, chat input, score grid, and buttons usable at 375px width.
  - Not verified on a device.

- [ ] **Accessibility spot check**
  - Tab through both pages; skip link, focus rings, and form error focus work.
  - Not verified on the live site.

- [ ] **Automated tests pass**
  - Verified locally: `npm test` → 25/25 passing.

- [ ] **README accurate**
  - Verified locally: README reflects current stack, scripts, and env vars.

---

## Rollback plan

1. **Revert code:** in the hosting provider, redeploy the last known-good commit
   (or `git revert` the failing commit and redeploy). All releases here are
   tagged by git commit, so any prior commit is restorable.
2. **Remove/rotate the API key:** if the key is suspected compromised, rotate it
   in Google AI Studio and update the provider env var — no code change needed.
3. **Static fallback:** because the core feature needs the API, if the AI service
   is down the site degrades to "unable to score leads" with clear errors rather
   than crashing; the settings/profile pages remain functional.
4. **Check the last verified state:** confirm tests (`npm test`) and build
   (`npm run build`) pass on the reverted commit before promoting it.