"use client";

import { useState } from "react";

/** Hands the customer to Stripe's portal for cards, invoices and cancelling. */
export function PortalButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string };
      if (!res.ok || !body.url) {
        setError("Det gick inte att öppna betalportalen just nu.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Det gick inte att nå betalportalen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={busy}
        className="rounded-control border border-grid bg-surface px-4 py-2 text-sm transition-colors hover:border-graphite/50 disabled:opacity-60"
      >
        {busy ? "Öppnar…" : "Hantera prenumeration, kort och kvitton"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-redpen">
          {error}
        </p>
      )}
    </div>
  );
}
