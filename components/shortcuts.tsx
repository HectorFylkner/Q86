"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The keyboard map, and the overlay that shows it.
 *
 * Bindings that exist but are undiscoverable are bindings nobody uses.
 * This is the single place the map is written down, and `?` opens it
 * from anywhere in the app — so "document the bindings somewhere the
 * user will find them" is satisfied by the app itself rather than by a
 * README they will not open mid-session.
 */

export type Binding = { keys: string[]; what: string };
export type ShortcutGroup = { title: string; note?: string; bindings: Binding[] };

export const SHORTCUTS: ShortcutGroup[] = [
  {
    title: "Anywhere",
    bindings: [
      { keys: ["?"], what: "Open or close this map" },
      { keys: ["Esc"], what: "Close this map, or leave a panel" },
    ],
  },
  {
    title: "Answering a question",
    note: "Drill, chapter tests, redo runs and timed sections.",
    bindings: [
      { keys: ["1", "–", "5"], what: "Select answer choice by position" },
      { keys: ["A", "–", "E"], what: "Select answer choice by letter" },
      { keys: ["G"], what: "Mark confidence: guess" },
      { keys: ["L"], what: "Mark confidence: lean" },
      { keys: ["K"], what: "Mark confidence: lock" },
      { keys: ["F"], what: "Flag the question for review" },
      { keys: ["Enter"], what: "Submit the answer" },
    ],
  },
  {
    title: "After the reveal",
    bindings: [
      { keys: ["Enter"], what: "Next question" },
      { keys: ["N"], what: "Next question" },
      { keys: ["P"], what: "Open the whiteboard post-mortem" },
      { keys: ["1", "–", "6"], what: "Tag the error type on a miss" },
    ],
  },
  {
    title: "Timed section",
    bindings: [
      { keys: ["1", "–", "5"], what: "Select answer choice" },
      { keys: ["B"], what: "Bookmark for Review & Edit" },
      { keys: ["Enter"], what: "Confirm and advance" },
    ],
  },
  {
    title: "Takeaway deck",
    bindings: [
      { keys: ["Space"], what: "Flip the card" },
      { keys: ["1"], what: "Grade: forgot" },
      { keys: ["2"], what: "Grade: hard" },
      { keys: ["3"], what: "Grade: good" },
    ],
  },
  {
    title: "Trainers",
    bindings: [
      { keys: ["Enter"], what: "Submit the answer" },
      { keys: ["Space"], what: "Start the next round" },
    ],
  },
];

function Key({ children }: { children: React.ReactNode }) {
  if (children === "–") {
    return <span className="px-0.5 text-graphite">–</span>;
  }
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-control border border-grid bg-paper px-1.5 py-0.5 font-mono text-micro font-medium text-ink shadow-[0_1px_0_var(--grid)]">
      {children}
    </kbd>
  );
}

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    // Focus goes back where it came from, never to the top of the page.
    openerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (e.key === "Escape" && open) {
        close();
        e.preventDefault();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        if (!open) openerRef.current = document.activeElement as HTMLElement;
        setOpen((v) => !v);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Focus lands inside the dialog on open, and stays trapped there.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    node?.focus();
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !node) return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Always present, so the binding is discoverable without knowing it. */}
      <button
        type="button"
        onClick={(e) => {
          openerRef.current = e.currentTarget;
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className="fixed bottom-[62px] right-3 z-30 hidden items-center gap-1.5 rounded-control border border-grid bg-surface px-2.5 py-1.5 text-micro text-graphite shadow-ambient transition-colors hover:border-ballpoint/50 hover:text-ink sm:bottom-3 sm:flex"
      >
        <kbd className="font-mono font-medium">?</kbd> shortcuts
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-3 sm:items-center"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-card border border-grid bg-surface p-5 shadow-ambient outline-none sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="shortcuts-title"
                  className="font-display text-title font-semibold"
                >
                  Keyboard map
                </h2>
                <p className="mt-0.5 text-caption text-graphite">
                  The whole daily loop — read, drill, answer, review, redo —
                  is completable without a mouse.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close the keyboard map"
                className="rounded-control border border-grid px-2 py-1 text-caption text-graphite hover:border-ballpoint/50 hover:text-ink"
              >
                Esc
              </button>
            </div>

            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {SHORTCUTS.map((group) => (
                <section key={group.title}>
                  <h3 className="font-mono text-micro font-semibold uppercase tracking-wider text-graphite">
                    {group.title}
                  </h3>
                  {group.note && (
                    <p className="mt-0.5 text-micro text-graphite">
                      {group.note}
                    </p>
                  )}
                  <dl className="mt-1.5 space-y-1">
                    {group.bindings.map((b) => (
                      <div
                        key={`${group.title}-${b.what}`}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <dd className="order-2 text-right text-caption text-graphite">
                          {b.what}
                        </dd>
                        <dt className="order-1 flex shrink-0 items-center gap-0.5">
                          {b.keys.map((k, i) => (
                            <Key key={i}>{k}</Key>
                          ))}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
