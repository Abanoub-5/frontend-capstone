# Audit — LeadRadar AI

This document records what was audited, what was actually measured, and what was
improved. **No scores are invented** — anything not measured is stated as such.

## Lighthouse

- **Status:** Lighthouse was **not run**. No lab environment / Chrome DevTools
  automation was available in this session, so no Lighthouse score is reported
  here. A manual Lighthouse run against the deployed URL is recommended (see
  "How to run it yourself").

## Accessibility

- **Tooling:** No automated a11y tool (axe-core / Lighthouse) was executed.
  The assessment below is a **manual code-level review** against WCAG 2.1 AA
  success criteria.

### What was already good (found on inspection)

- Skip-to-content link on both pages (visible on focus).
- All form inputs have associated `<label>` elements.
- Chat input uses a visually-hidden label; errors use `role="alert"`.
- Loading state uses `role="status"` + `aria-label`; announcements use
  `aria-live="polite"`.
- Visible `:focus-visible` outlines on nav links, buttons, inputs, suggestions,
  and toggle switches.
- `prefers-reduced-motion` media query disables animations.
- Single `<h1>` per page with a clean heading hierarchy (h1 → h2 → h3).

### Concrete improvements made in this session

1. **Error focus management** (`settings.js`): submitting an invalid form now
   moves keyboard/AT focus to the first field with `aria-invalid`, instead of
   leaving the user to hunt for errors.
2. **Screen-reader announcement of the AI result** (`chat.js`): when the score
   card renders, the result is announced via the `aria-live` region
   ("Lead scored as X with a score of Y out of 100") so AT users hear the
   outcome, not just the loading state.
3. **Empty-submit feedback** (`chat.js`): submitting the chat form with no text
   now announces a hint and re-focuses the input instead of silently doing
   nothing.
4. **Password hint wired to accessibility tree** (`settings.html`): the
   "minimum 8 characters…" hint is now referenced via `aria-describedby` on the
   new-password field.

### Remaining observations

- Color contrast was reviewed by eye for the primary/secondary palette but not
  measured with a contrast tool.
- The toggle sliders rely on `:focus-visible` rings; worth confirming in
  high-contrast mode.

## Performance

- **Build output (measured this session):**
  - `index.html` 4.30 kB (gzip 1.49 kB)
  - `settings.html` 7.34 kB (gzip 1.72 kB)
  - CSS bundle 11.69 kB (gzip 2.96 kB)
  - `main` JS 8.79 kB (gzip 3.11 kB); `settings` JS 4.92 kB (gzip 1.57 kB)
- **Observations:**
  - No frameworks or heavyweight libraries in the client bundle; vanilla JS.
  - CSS is a single stylesheet (no runtime CSS-in-JS).
  - The only runtime dependency is the AI API call; the UI itself has no
    external asset loads (favicon is an inline SVG data URI).
  - The two pages are built separately (multi-page Vite build), so the settings
    page does not load the chat bundle.

## Tests

- `npm test` → **25/25 passing** using Node's built-in `node:test` runner
  (no browser/JS-DOM environment needed).
- Verified locally: validation rules, `scoreLead` classification + Zod schemas,
  and chat utilities (SSE parsing, escaping, error mapping).

## How to run the audit yourself

```bash
npm run build   # then serve dist/ and open Chrome DevTools → Lighthouse
npm test        # run the automated test suite
```

Lighthouse and axe-core should be run against the deployed URL once it exists,
and the scores added here.