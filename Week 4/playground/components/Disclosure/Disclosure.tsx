import { useId, useState, type ReactNode } from 'react'
import './disclosure.css'

export interface DisclosureProps {
  /** Text shown on the disclosure button (its accessible name). */
  buttonLabel: ReactNode
  /** Content revealed when the disclosure is expanded. */
  children: ReactNode
  /** Whether the disclosure starts expanded. Defaults to false. */
  defaultOpen?: boolean
}

/**
 * WAI-ARIA Disclosure pattern (single section).
 *
 * Accessibility decisions:
 * - A native `<button>` is used because it already provides the disclosure's
 *   entire keyboard contract for free: Enter and Space activate it, and it is
 *   announced correctly by screen readers. No custom key handling is needed
 *   (native Space triggers on key-up, matching APG button behavior).
 * - `aria-expanded` reflects the open state on the button.
 * - `aria-controls` points at the revealed region's id.
 * - The content region uses the native `hidden` attribute when collapsed:
 *   hidden elements are removed from both the Tab order and the accessibility
 *   tree, so screen readers do not announce collapsed content.
 */
export function Disclosure({ buttonLabel, children, defaultOpen = false }: DisclosureProps) {
  const baseId = useId()
  const [open, setOpen] = useState(defaultOpen)

  const buttonId = `${baseId}-disclosure-button`
  const contentId = `${baseId}-disclosure-content`

  return (
    <div className="disclosure">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={contentId}
        className="disclosure-button"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {/* Decorative chevron: aria-hidden so it is not read aloud. */}
        <span className="disclosure-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {buttonLabel}
      </button>

      <div
        id={contentId}
        hidden={!open}
        className="disclosure-content"
      >
        {children}
      </div>
    </div>
  )
}
