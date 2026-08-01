# Accessibility Playground

A keyboard-first playground of three components — **Modal Dialog**, **Tabs**,
and **Disclosure** — built from scratch against the
[W3C WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), plus a
shadcn/ui (Radix) reference implementation for comparison.

## Stack

- React 19
- TypeScript (strict)
- Vite
- oxlint (ESLint-compatible, ships with the Vite template)
- No component libraries for the custom components (only `react-dom` portal)
- shadcn/ui + Radix for the comparison section only

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL. Other scripts:

```bash
npm run build   # strict type-check (tsc -b) + production bundle
npm run lint    # oxlint
npm run preview # preview the production build
```

## Project structure

```
playground/
├── components/                  # hand-rolled, zero-dependency components
│   ├── Dialog/                  #   Dialog.tsx + dialog.css
│   ├── Tabs/                    #   Tabs.tsx + tabs.css
│   └── Disclosure/              #   Disclosure.tsx + disclosure.css
├── src/
│   ├── App.tsx                  # demo page + keyboard test guide
│   ├── components/ui/           # generated shadcn/ui (Dialog, Tabs, Button)
│   ├── lib/utils.ts             # shadcn cn() helper
│   └── main.tsx
├── NOTES.md                     # accessibility comparison vs shadcn/ui
└── README.md
```

## Keyboard shortcuts

### Modal Dialog

| Key                     | Action                                                |
| ----------------------- | ----------------------------------------------------- |
| `Tab` / `Shift+Tab`     | Move focus; **cycles** and never escapes the dialog   |
| `Escape`                | Close the dialog                                      |
| `Enter` / `Space`       | Activate the focused button inside                    |
| —                       | Focus enters automatically on open, returns to the trigger button on close |

Also: clicking the backdrop closes the dialog, body scrolling is locked while
open, and the dialog renders through a portal into `document.body`.

### Tabs (manual activation)

| Key            | Action                                         |
| -------------- | ---------------------------------------------- |
| `ArrowRight`   | Move focus to the next tab (wraps around)      |
| `ArrowLeft`    | Move focus to the previous tab (wraps)         |
| `Home`         | Move focus to the first tab                    |
| `End`          | Move focus to the last tab                     |
| `Enter`        | Activate the focused tab                       |
| `Space`        | Activate the focused tab                       |

Only the active panel is visible; `aria-selected` marks the active tab.

### Disclosure

| Key        | Action                              |
| ---------- | ----------------------------------- |
| `Tab`      | Reach the disclosure button         |
| `Enter`    | Expand / collapse                   |
| `Space`    | Expand / collapse                   |

`aria-expanded` reflects the open state and `aria-controls` links the button to
its content region.

## Testing with keyboard only

Put the mouse away and use the on-page **Keyboard-only test guide** in
`App.tsx`. The checklist:

1. `Tab` to the "Open dialog" button, press `Enter`, verify focus lands inside
   the dialog, `Tab`/`Shift+Tab` never leave it, `Escape` closes it, and focus
   returns to the button.
2. `Tab` into the tab list, navigate with the arrow keys, `Home`/`End`, and
   activate with `Enter`/`Space`.
3. Expand/collapse the disclosures with `Enter`/`Space`.

Use a screen reader (NVDA on Windows, VoiceOver on macOS, or the Chrome
DevTools accessibility tree) to verify `role`/`aria-*` attributes are set.

## Accessibility notes

- `NOTES.md` contains a detailed comparison between the hand-rolled components
  and the shadcn/ui (Radix) equivalents, including what each handled better and
  three concrete improvements to adopt.
- The hand-rolled components use a `--cp-*` CSS-variable namespace so they never
  collide with the shadcn/ui theme tokens.
