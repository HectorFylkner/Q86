"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { QUICK_GROUPS } from "@/components/navigation";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function QuickLauncher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredGroups = QUICK_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!normalizedQuery) return true;
      return [item.label, item.description, ...item.keywords]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    }),
  })).filter((group) => group.items.length > 0);
  const resultCount = filteredGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  function openLauncher() {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current;
    setOpen(true);
  }

  function closeLauncher() {
    setOpen(false);
    setQuery("");
  }

  function resultElements(): HTMLElement[] {
    return Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "[data-launcher-item]",
      ) ?? [],
    );
  }

  function moveResultFocus(current: HTMLElement, direction: 1 | -1) {
    const items = resultElements();
    const index = items.indexOf(current);
    if (index < 0 || items.length === 0) return;
    items[(index + direction + items.length) % items.length]?.focus();
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      const commandK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash =
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTypingTarget(event.target);

      if (commandK || slash) {
        event.preventDefault();
        if (open) closeLauncher();
        else openLauncher();
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        closeLauncher();
      }
    }

    document.addEventListener("keydown", onGlobalKeyDown);
    return () => document.removeEventListener("keydown", onGlobalKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [open]);

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/35 px-3 pt-[max(4.5rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:px-6 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLauncher();
          }}
        >
          <motion.div
            ref={dialogRef}
            id="quick-launcher"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-launcher-title"
            className="flex max-h-[min(82dvh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-[14px] border border-grid bg-surface shadow-[0_28px_90px_-42px_rgba(23,24,26,0.75)]"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="flex items-center gap-3 border-b border-grid px-3 py-3 sm:px-4">
              <MagnifyingGlass
                size={20}
                weight="regular"
                className="shrink-0 text-graphite"
                aria-hidden
              />
              <label htmlFor="quick-launcher-search" className="sr-only">
                Search Q86 destinations and quick starts
              </label>
              <input
                ref={inputRef}
                id="quick-launcher-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    resultElements()[0]?.focus();
                  } else if (event.key === "Enter") {
                    const first = resultElements()[0] as
                      | HTMLAnchorElement
                      | undefined;
                    if (first) {
                      event.preventDefault();
                      first.click();
                    }
                  }
                }}
                placeholder="Where do you want to go?"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-base outline-none placeholder:text-graphite/70 focus:border-0 focus:shadow-none"
              />
              <button
                type="button"
                onClick={closeLauncher}
                aria-label="Close quick launcher"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-graphite transition-colors hover:bg-highlight hover:text-ink"
              >
                <X size={18} weight="regular" aria-hidden />
              </button>
            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {resultCount === 1
                ? "1 destination found"
                : `${resultCount} destinations found`}
            </div>

            <div className="overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
              <h2 id="quick-launcher-title" className="sr-only">
                Quick launcher
              </h2>
              {resultCount === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-grid bg-paper text-graphite">
                    <MagnifyingGlass size={22} weight="regular" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-base font-semibold">
                    No matching destination
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-graphite">
                    Try a skill, activity, or action such as timed, review, or
                    analytics.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroups.map((group) => (
                    <section
                      key={group.id}
                      aria-labelledby={`quick-launcher-${group.id}`}
                    >
                      <h3
                        id={`quick-launcher-${group.id}`}
                        className="px-2 pb-1 pt-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-graphite"
                      >
                        {group.label}
                      </h3>
                      <div className="divide-y divide-grid/70">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={`${group.id}-${item.href}-${item.label}`}
                              href={item.href}
                              data-launcher-item
                              onClick={closeLauncher}
                              onKeyDown={(event) => {
                                if (event.key === "ArrowDown") {
                                  event.preventDefault();
                                  moveResultFocus(event.currentTarget, 1);
                                } else if (event.key === "ArrowUp") {
                                  event.preventDefault();
                                  moveResultFocus(event.currentTarget, -1);
                                }
                              }}
                              className="group flex min-h-[58px] items-center gap-3 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-highlight/70 focus-visible:bg-highlight"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-grid bg-paper text-graphite transition-colors group-hover:border-ballpoint/30 group-hover:text-ballpoint">
                                <Icon size={18} weight="regular" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-ink">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-graphite">
                                  {item.description}
                                </span>
                              </span>
                              <ArrowRight
                                size={16}
                                weight="regular"
                                className="shrink-0 -translate-x-1 text-graphite/60 opacity-0 transition-[transform,opacity,color] group-hover:translate-x-0 group-hover:text-ballpoint group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                                aria-hidden
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center justify-between border-t border-grid bg-paper/70 px-4 py-2 text-[11px] text-graphite sm:flex">
              <span>Arrow keys move through results</span>
              <span className="flex items-center gap-3 font-mono">
                <span>Enter opens</span>
                <span>Esc closes</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openLauncher}
        aria-haspopup="dialog"
        aria-controls="quick-launcher"
        aria-expanded={open}
        aria-label="Open quick launcher (Command or Control K)"
        aria-keyshortcuts="Meta+K Control+K /"
        className="flex h-9 shrink-0 items-center gap-2 rounded-control border border-grid bg-surface/80 px-2.5 text-sm text-graphite transition-colors hover:border-graphite/50 hover:text-ink sm:px-3"
      >
        <MagnifyingGlass size={16} weight="regular" aria-hidden />
        <span className="hidden xl:inline">Jump to</span>
        <span className="hidden items-center gap-1 font-mono text-[10px] text-graphite/80 md:flex">
          <Command size={11} weight="regular" aria-hidden />K
        </span>
      </button>
      {mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}
