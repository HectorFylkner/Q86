"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";

/** Hands the customer to Stripe's portal for cards, invoices and cancelling. */
export function PortalButton() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string };
      if (!res.ok || !body.url) {
        setError(t("billing.portalFailed"));
        return;
      }
      window.location.href = body.url;
    } catch {
      setError(t("billing.portalUnreachable"));
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
        {busy ? t("billing.portalOpening") : t("billing.portalButton")}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-redpen">
          {error}
        </p>
      )}
    </div>
  );
}
