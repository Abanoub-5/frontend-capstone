import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import './tabs.css'

export interface TabItem {
  /** Text rendered inside the tab button (part of its accessible name). */
  label: ReactNode
  /** Content rendered inside the tab panel. */
  content: ReactNode
}

export interface TabsProps {
  /**
   * Accessible name for the tablist. Required: `role="tablist"` has no native
   * name, so screen readers announce the group using this label
   * (e.g. "Fruits, tab list").
   */
  label: string
  /** Tab definitions, rendered in the order given. */
  tabs: readonly TabItem[]
  /** Index of the tab selected on first render. Defaults to 0. */
  defaultIndex?: number
  /** Called whenever the selected tab changes (click or Enter/Space). */
  onChange?: (index: number) => void
}

/**
 * WAI-ARIA Tabs pattern (manual activation).
 *
 * Accessibility decisions:
 * - `role="tablist"` on the container, `role="tab"` on each button and
 *   `role="tabpanel"` on each panel.
 * - `aria-selected` marks the active tab; only the active panel is rendered
 *   visible (others get the native `hidden` attribute, which also removes
 *   them from the accessibility tree and the Tab order).
 * - `aria-controls` on each tab points to its panel; `aria-labelledby` on each
 *   panel points back to its tab, so a screen reader announces the panel's
 *   name when it gains focus.
 * - Roving tabindex: exactly one tab has `tabIndex={0}` (the focused one);
 *   all others are `-1`. Arrow navigation moves the `0` around and focuses
 *   the target, so pressing Tab once enters the list at the right place and
 *   a second Tab moves on to the panels.
 * - ArrowRight/ArrowLeft/Home/End move focus; Enter/Space activate the focused
 *   tab. This is the APG *manual activation* variant: focus and selection are
 *   decoupled, which is recommended when panels are heavy/complex. Because
 *   activation requires an explicit key, Space is preventDefault-ed to keep
 *   the page from scrolling while the tablist is focused.
 */
export function Tabs({ label, tabs, defaultIndex = 0, onChange }: TabsProps) {
  // useId produces a unique, SSR-safe base id for all ARIA wiring.
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  const [focusedIndex, setFocusedIndex] = useState(defaultIndex)

  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  // Callback ref: keeps each button's DOM node at its index. React calls it
  // with null on unmount, so stale references never survive.
  function setTabRef(index: number) {
    return (element: HTMLButtonElement | null) => {
      tabRefs.current[index] = element
    }
  }

  function selectTab(index: number) {
    setActiveIndex(index)
    onChange?.(index)
  }

  function focusTab(index: number) {
    tabRefs.current[index]?.focus()
    setFocusedIndex(index)
  }

  /**
   * Keyboard support lives on the tablist container so a single handler
   * covers every tab (event delegation). Manual activation: arrows only move
   * focus; Enter/Space commit the selection.
   */
  function handleTablistKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const count = tabs.length
    if (count === 0) return

    let nextIndex: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (focusedIndex + 1) % count
        break
      case 'ArrowLeft':
        nextIndex = (focusedIndex - 1 + count) % count
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = count - 1
        break
      case 'Enter':
      case ' ':
        // Manual activation: select the focused tab. preventDefault stops the
        // native button click AND stops Space from scrolling the page.
        event.preventDefault()
        selectTab(focusedIndex)
        return
      default:
        return
    }

    // Focus-tracking keys: move focus (roving tabindex) but do NOT select.
    event.preventDefault()
    focusTab(nextIndex)
  }

  return (
    <div className="tabs">
      <div
        role="tablist"
        aria-label={label}
        className="tabs-tablist"
        onKeyDown={handleTablistKeyDown}
      >
        {tabs.map((item, index) => (
          <button
            key={`${baseId}-${index}`}
            ref={setTabRef(index)}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-controls={panelId(index)}
            aria-selected={index === activeIndex}
            tabIndex={index === focusedIndex ? 0 : -1}
            className={`tabs-tab${index === activeIndex ? ' tabs-tab--active' : ''}`}
            onClick={() => {
              selectTab(index)
              setFocusedIndex(index)
            }}
            onFocus={() => setFocusedIndex(index)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tabs.map((item, index) => (
        <div
          key={`${baseId}-panel-${index}`}
          role="tabpanel"
          id={panelId(index)}
          aria-labelledby={tabId(index)}
          // tabIndex=0 lets keyboard users scroll long panels; the hidden
          // attribute removes inactive panels from the tab order entirely.
          tabIndex={0}
          hidden={index !== activeIndex}
          className="tabs-panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
