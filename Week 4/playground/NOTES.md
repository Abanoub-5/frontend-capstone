# Accessibility Comparison

This document compares the hand-rolled components in `components/` with the
generated shadcn/ui components in `src/components/ui/` (which wrap **Radix UI**
primitives). Both implement the same W3C WAI-ARIA Authoring Practices patterns
(Modal Dialog and Tabs); the goal is to learn from each implementation, not to
judge one as "better" in every dimension.

- Hand-rolled: `components/Dialog/Dialog.tsx`, `components/Tabs/Tabs.tsx`,
  `components/Disclosure/Disclosure.tsx`
- shadcn/ui: `src/components/ui/dialog.tsx`, `src/components/ui/tabs.tsx`,
  `src/components/ui/button.tsx`
- Underlying primitives: Radix UI (`radix-ui` package)

---

## Modal Dialog

### What my implementation handled correctly

- **Full ARIA contract from scratch.** `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`, and `aria-describedby` are wired to caller-provided
  heading/description ids. Nothing is magic — every attribute is explicit and
  commented.
- **Focus trap that never escapes.** The Tab handler computes the dialog's
  focusable region and wraps focus in *both* directions, including the edge
  case where the dialog container itself (`tabIndex={-1}`) currently has focus.
  If the dialog has no focusable children, focus falls back to the container so
  the Escape handler stays reachable.
- **Explicit focus restore.** The previously focused element (the trigger
  button) is captured on open and `.focus()`-ed in the effect cleanup, which
  runs on close/unmount. Because the dialog is controlled, cleanup always runs
  regardless of how it closes (Escape, backdrop, close button).
- **Scroll lock that restores exactly.** The previous `body` overflow value is
  saved and restored, rather than hard-coding `overflow: ""`, so a dialog
  nested under another scroll-locking layer behaves correctly.
- **Precise backdrop detection.** `onMouseDown` on the overlay compares
  `event.target === event.currentTarget`, so a drag that begins on the backdrop
  and ends on the panel cannot accidentally dismiss the dialog.
- **Zero dependencies.** The dialog is a single file using only React's
  `createPortal`. No animation library, no focus-trap package.

### What shadcn/ui handled better

- **Dismissal and `data-*` state attributes.** Radix exposes `data-open` /
  `data-closed` attributes on the overlay and content, which the Tailwind
  classes use to drive enter/exit animations. My dialog animates in on mount
  but simply disappears on close (no exit animation), because a controlled
  `open=false` unmounts the subtree instantly. An exit animation would require
  either keeping the node mounted or introducing a stateful delay — Radix
  handles this natively.
- **Primitive composition and reuse.** Radix splits the dialog into
  `Trigger`, `Portal`, `Overlay`, `Content`, `Close`, `Title`, and
  `Description` as separate components. This lets consumers keep the trigger
  close to the content, compose an `asChild` trigger that *becomes* any custom
  button, and swap pieces. My dialog is a single component where the trigger
  button must live outside and the close button is just children.
- **Automatic description wiring.** Radix auto-wires `aria-describedby` to its
  `Description` component (and warns in development if a `Description` is
  missing), so authors cannot forget it. My implementation only wires it if the
  caller passes `describedBy`, which is easy to skip.
- **Reduced-motion handling out of the box.** The generated classes use
  Tailwind's `data-open`/`data-closed` animation utilities, and `tw-animate-css`
  ships with `motion-reduce:` variants. My dialog relies on a hand-written
  `@media (prefers-reduced-motion: reduce)` block instead.

---

## Tabs

### What my implementation handled correctly

- **Manual activation with roving tabindex.** Arrow keys move focus
  (ArrowRight/ArrowLeft/Home/End with wrapping), while Enter/Space commit the
  selection. This is the APG-recommended behavior when panels are expensive to
  render, and it is fully documented in the source. The roving `tabIndex={0}`
  is updated from a dedicated `focusedIndex`, and an `onFocus` handler keeps it
  in sync if a tab is reached by mouse or Tab.
- **Correct hidden-panel handling.** Inactive panels use the native `hidden`
  attribute, which removes them from both the tab order and the accessibility
  tree — a screen reader never announces collapsed panels, and no extra
  `aria-hidden` bookkeeping is needed.
- **Full ARIA wiring.** Each tab has `aria-controls` pointing at its panel and
  each panel has `aria-labelledby` pointing back at its tab, plus
  `aria-selected` on tabs and `aria-label` on the tablist (required because
  `role="tablist"` has no implicit name).
- **Space key scrolling prevention.** `event.preventDefault()` on the Space key
  stops the page from scrolling while the tablist has focus — a subtle bug
  many hand-rolled tab implementations miss.

### What shadcn/ui handled better

- **Orientation support.** Radix Tabs supports `orientation="vertical"` out of
  the box, including correct ArrowUp/ArrowDown navigation and the `data-*`
  orientation hooks the styles need. My implementation is horizontal-only.
- **Automatic activation option and focus+selection coupling.** Radix activates
  the tab that receives focus (automatic activation), which matches the APG's
  default recommendation for simple, low-latency panels and requires one fewer
  keystroke. My manual-activation design is the more conservative variant.
  Radix also offers `onValueChange`, controlled `value`, and
  `disabled`/`disabled-on-focus` support that my minimal API lacks.
- **Robust typing via generics.** Radix's `ComponentProps<typeof TabsPrimitive.Root>`
  pattern forwards the full DOM prop surface with correct types, so consumers
  get autocomplete and type checking for every native attribute. My custom
  `TabsProps` intentionally exposes a narrow API and requires a cast-free but
  more restrictive prop set.
- **`asChild` composition.** Radix `TabsTrigger`/`TabsContent` support
  `asChild`, letting consumers render tabs as links or custom elements while
  keeping the ARIA wiring. My tabs are always `<button>` elements.

---

## Disclosure

There is no generated shadcn Disclosure (shadcn has an Accordion instead), so
this section compares my Disclosure against Radix's Accordion architecture
which `src/components/ui` could equally be built from.

### What my implementation handled correctly

- **Native semantics do the work.** The disclosure is literally a `<button>`
  with `aria-expanded` and `aria-controls`. The native button provides the
  entire keyboard contract (Enter/Space, Space on key-up), focusability, and
  screen-reader announcement for free — no custom key handlers, which keeps the
  component small and bug-proof.
- **`hidden` for collapsed content.** Collapsed content is removed from the tab
  order and the accessibility tree via the native `hidden` attribute.
- **Decorative icon isolation.** The chevron is `aria-hidden="true"` so screen
  readers announce only the button label.

### What shadcn/ui/Radix handles better (as seen in its Accordion primitives)

- **Composition for multi-section accordions.** Radix `Accordion` provides a
  `type="single" | "multiple"` API, `value`/`onValueChange` controlled state,
  and `collapsible` support — a reusable primitive for accordions with several
  sections. My Disclosure is a single, self-contained section and callers would
  have to compose multiple instances and coordinate state themselves to build a
  full accordion.
- **Focus handling for many sections.** Radix Accordion includes roving
  tabindex across accordion headers so arrow keys move between sections; my
  single Disclosure relies on normal Tab order (which is fine for one section
  but not scalable to N sections).

---

## Concrete improvements to make (two minimum)

1. **Add exit animations to the Dialog without breaking focus restoration.**
   Currently my controlled dialog unmounts instantly when `open` turns false,
   so the close animation is skipped. Improvement: keep the portal mounted
   during a short "closing" phase, animate the overlay/panel out, and only
   remove the DOM node after the animation ends — while *still* running focus
   restoration and scroll unlock in the effect cleanup so Escape/backdrop
   dismissal feels as snappy as Radix's `data-closed` animation. This also
   matches Radix's approach of driving open/closed state from `data-*`
   attributes rather than conditional unmounting.

2. **Move to a compound-component API with `asChild` support and `data-*` state
   attributes.** Rather than a single `<Dialog open labelledBy onClose>`
   component, split into `Dialog`, `DialogTrigger`, `DialogPortal`,
   `DialogOverlay`, `DialogContent`, `DialogClose`, `DialogTitle`, and
   `DialogDescription` (mirroring Radix). Apply `data-open`/`data-closed` and
   `data-orientation` attributes so consumers (and CSS) can react to state
   declaratively. Add `asChild` so a DialogTrigger can be any element. This
   improves composition, removes the footgun of passing a raw `labelledBy` id,
   and gives automatic `aria-describedby` wiring.

3. **Add vertical orientation support to Tabs.** Extend `TabsProps` with
   `orientation: "horizontal" | "vertical"`, swap ArrowLeft/ArrowRight for
   ArrowUp/ArrowDown when vertical, set `aria-orientation` on the tablist, and
   expose `disabled` per tab. This closes the largest functional gap with the
   Radix-backed shadcn Tabs.
