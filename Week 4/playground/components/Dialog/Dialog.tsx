import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import './dialog.css'

/**
 * CSS selector for everything that can receive keyboard focus.
 * Used by the focus trap to enumerate the dialog's focusable region.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  'iframe',
].join(',')

/**
 * An element counts as focusable only when it is rendered on screen.
 * `hidden`/`display:none` elements must never receive programmatic focus,
 * otherwise the focus trap can silently move focus to an invisible node.
 */
function isVisible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0
}

/** All focusable descendants of `container` that are actually visible. */
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    isVisible,
  )
}

/**
 * Per WAI-ARIA APG, the first focusable element inside a dialog should
 * receive focus when it opens. If the dialog contains no focusable
 * elements, focus the dialog itself (it has `tabIndex={-1}`) so it is
 * still reachable and the Escape key keeps working.
 */
function focusFirstFocusable(container: HTMLElement | null): void {
  if (!container) return
  const [first] = getFocusable(container)
  if (first) {
    first.focus()
  } else {
    container.focus()
  }
}

export interface DialogProps {
  /** Whether the dialog is open (rendered through a portal). */
  open: boolean
  /**
   * Request to close the dialog. The component is controlled: callers pass
   * this handler and decide whether to flip `open` back to false. Invoked by
   * Escape, backdrop click, and (via `children`) the close button.
   */
  onClose: () => void
  /**
   * `id` of the element that names the dialog (required by `aria-labelledby`).
   * Usually the dialog's heading, e.g. `<h2 id="my-title">`.
   */
  labelledBy: string
  /**
   * Optional `id` of the element that describes the dialog
   * (wired to `aria-describedby`). Usually a supporting paragraph.
   */
  describedBy?: string
  /** Content rendered inside the dialog panel. */
  children: ReactNode
  /** Whether the Escape key should close the dialog. Defaults to true. */
  closeOnEscape?: boolean
  /** Whether clicking the backdrop should close the dialog. Defaults to true. */
  closeOnOutsideClick?: boolean
}

/**
 * An accessible modal dialog built from scratch.
 *
 * Accessibility decisions:
 * - `role="dialog"` + `aria-modal="true"` tell assistive technology that the
 *   rest of the page is inert while the dialog is open (so we do NOT need to
 *   bolt `aria-hidden` onto the application root).
 * - `aria-labelledby` names the dialog (a heading). `aria-describedby`
 *   optionally points at a description paragraph.
 * - Focus is moved into the dialog on open and trapped on Tab / Shift+Tab.
 * - Focus is restored to the previously focused element (the trigger button)
 *   on close, per the APG "focus is maintained within the modal" rules.
 * - `document.body` scrolling is disabled while open and restored on close.
 * - Rendered through `createPortal` into `document.body` so the dialog always
 *   escapes ancestor `overflow`/`transform` containers and stacks above the
 *   page; it is also removed entirely from the DOM when closed.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus management + scroll locking, all in one effect keyed on `open`.
  useEffect(() => {
    if (!open) return

    // Remember who had focus so we can restore it on close (trigger button).
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    // Lock body scroll while the modal is open. Save the previous value so we
    // can restore it exactly on cleanup (not just reset to "").
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus into the dialog. The panel is committed to the DOM before
    // effects run, so the ref is available here.
    focusFirstFocusable(panelRef.current)

    return () => {
      // Unlock scroll and hand focus back to whoever opened the dialog.
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  /**
   * Keyboard handling for the modal:
   * - Escape closes it (matching APG modal behavior).
   * - Tab / Shift+Tab is trapped: cycling off the first or last element wraps
   *   focus around instead of letting it escape into the page behind.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      // stopPropagation prevents a parent dialog from also reacting.
      event.stopPropagation()
      if (closeOnEscape) onClose()
      return
    }

    if (event.key !== 'Tab') return
    const container = panelRef.current
    if (!container) return

    const focusable = getFocusable(container)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement | null
    const activeInList = active !== null && focusable.includes(active)

    // Wrap in either direction. We also trap when the container itself (or an
    // element outside our list) has focus, so Shift+Tab can never escape.
    if (event.shiftKey) {
      if (active === first || active === container || !activeInList) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || active === container || !activeInList) {
      event.preventDefault()
      first.focus()
    }
  }

  /**
   * Backdrop click detection. We compare `event.target` against
   * `event.currentTarget` so only clicks on the overlay itself count;
   * clicks bubbling up from the dialog panel are ignored. `mousedown` is used
   * instead of `click` so a drag that starts on the backdrop and ends on the
   * dialog does not accidentally close it.
   */
  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (!closeOnOutsideClick) return
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return createPortal(
    <div className="dialog-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className="dialog-panel"
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
