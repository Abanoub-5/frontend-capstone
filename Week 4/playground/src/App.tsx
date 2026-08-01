import { useState } from 'react'
import { Dialog } from '../components/Dialog/Dialog'
import { Tabs, type TabItem } from '../components/Tabs/Tabs'
import { Disclosure } from '../components/Disclosure/Disclosure'
import { Button } from '@/components/ui/button'
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import './index.css'

const tabs: TabItem[] = [
  {
    label: 'Apples',
    content: (
      <>
        <p>Apples are crisp, sweet fruits rich in fiber and vitamin C.</p>
        <p>Try the tab keys: ArrowRight / ArrowLeft move focus, Enter selects.</p>
      </>
    ),
  },
  {
    label: 'Oranges',
    content: (
      <p>Oranges are citrus fruits packed with vitamin C and juicy segments.</p>
    ),
  },
  {
    label: 'Grapes',
    content: <p>Grapes grow in clusters and come in seeded and seedless varieties.</p>,
  },
]

function App() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="app">
      <h1>Accessibility Playground</h1>
      <p className="lede">
        Three components built from scratch against the W3C WAI-ARIA Authoring
        Practices: a <strong>Modal Dialog</strong>, <strong>Tabs</strong>, and a{' '}
        <strong>Disclosure</strong>.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. MODAL DIALOG                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="demo" aria-labelledby="demo-dialog-heading">
        <h2 id="demo-dialog-heading">Modal Dialog</h2>

        <button type="button" className="button" onClick={() => setDialogOpen(true)}>
          Open dialog
        </button>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          labelledBy="demo-dialog-title"
          describedBy="demo-dialog-description"
        >
          <button
            type="button"
            className="dialog-close"
            aria-label="Close dialog"
            onClick={() => setDialogOpen(false)}
          >
            ×
          </button>

          <h2 id="demo-dialog-title" className="dialog-title">
            Confirm action
          </h2>
          <p id="demo-dialog-description">
            This dialog traps focus and blocks the page behind it. Press Escape
            or click the backdrop to dismiss it.
          </p>

          <div className="dialog-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setDialogOpen(false)}
            >
              Confirm
            </button>
          </div>
        </Dialog>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. TABS                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="demo" aria-labelledby="demo-tabs-heading">
        <h2 id="demo-tabs-heading">Tabs</h2>
        <Tabs label="Fruit information" tabs={tabs} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. DISCLOSURE                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="demo" aria-labelledby="demo-disclosure-heading">
        <h2 id="demo-disclosure-heading">Disclosure</h2>
        <Disclosure buttonLabel="How do I test with only a keyboard?">
          <p>
            Tab and Shift+Tab move between interactive elements. Enter or Space
            activate buttons. Use the arrow keys inside the tab list. Press
            Escape to close the modal. Focus always returns where you started.
          </p>
        </Disclosure>
        <Disclosure buttonLabel="Why the `hidden` attribute?">
          <p>
            The <code>hidden</code> attribute removes collapsed content from
            both the Tab order and the accessibility tree, so screen readers
            never announce content that isn't visible.
          </p>
        </Disclosure>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* shadcn/ui REFERENCE (generated, not touched)                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="demo" aria-labelledby="shadcn-heading">
        <h2 id="shadcn-heading">
          shadcn/ui reference (for comparison)
        </h2>
        <p className="lede">
          The generated <code>@/components/ui</code> Dialog and Tabs (Radix
          primitives + Tailwind). See <code>NOTES.md</code> for the comparison
          against the hand-rolled components above.
        </p>

        <ShadcnDialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open shadcn dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>shadcn/ui Dialog</DialogTitle>
              <DialogDescription>
                Powered by Radix UI. Same WAI-ARIA dialog contract: focus trap,
                Escape to close, scroll lock, focus return.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </ShadcnDialog>

        <div className="shadcn-tabs">
          <ShadcnTabs defaultValue="apples">
            <TabsList>
              <TabsTrigger value="apples">Apples</TabsTrigger>
              <TabsTrigger value="oranges">Oranges</TabsTrigger>
              <TabsTrigger value="grapes">Grapes</TabsTrigger>
            </TabsList>
            <TabsContent value="apples">
              <p>shadcn/ui Tabs backed by Radix UI.</p>
            </TabsContent>
            <TabsContent value="oranges">
              <p>Arrow keys move focus; the selected tab is activated on focus.</p>
            </TabsContent>
            <TabsContent value="grapes">
              <p>Only the active panel is exposed to the accessibility tree.</p>
            </TabsContent>
          </ShadcnTabs>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* KEYBOARD TEST GUIDE                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="demo" aria-labelledby="test-guide-heading">
        <h2 id="test-guide-heading">Keyboard-only test guide</h2>

        <p>
          Disconnect your mouse and verify every interaction with the keyboard:
        </p>

        <h3>Modal Dialog</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> to <em>Open dialog</em> and press <kbd>Enter</kbd>.
          </li>
          <li>Focus should move inside the dialog automatically.</li>
          <li>
            Hold <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>: focus cycles
            and never escapes to the page behind.
          </li>
          <li>
            Press <kbd>Escape</kbd> or <kbd>Enter</kbd> on <em>Cancel</em>.
          </li>
          <li>
            Focus must return to the <em>Open dialog</em> button.
          </li>
        </ul>

        <h3>Tabs</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> once to enter the tab list; the active tab is focused.
          </li>
          <li>
            <kbd>ArrowRight</kbd> / <kbd>ArrowLeft</kbd> move focus between tabs.
          </li>
          <li>
            <kbd>Home</kbd> goes to the first tab, <kbd>End</kbd> to the last.
          </li>
          <li>
            <kbd>Enter</kbd> or <kbd>Space</kbd> activates the focused tab.
          </li>
          <li>
            Only the active panel is visible; a screen reader announces the
            panel name via <code>aria-labelledby</code>.
          </li>
        </ul>

        <h3>Disclosure</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> to a disclosure button and press{' '}
            <kbd>Enter</kbd> or <kbd>Space</kbd> to expand / collapse it.
          </li>
          <li>
            <code>aria-expanded</code> flips with each activation; collapsed
            content is removed from the tab order with <code>hidden</code>.
          </li>
        </ul>
      </section>
    </div>
  )
}

export default App
