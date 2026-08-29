"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import {
  issueReferralCodeAction,
  issueShareCodeAction,
  revokeShareCodeAction,
} from "@/lib/retention/actions";

/** Copy that degrades: an insecure context or a denied permission leaves
 *  the text selectable rather than showing a button that does nothing. */
function CopyField({ value, label }: { value: string; label: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="select-all rounded-control border border-grid bg-surface px-3 py-2 font-mono text-sm">
        {value}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            ?.writeText(value)
            .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => undefined);
        }}
        aria-label={label}
        className="rounded-control border border-grid px-3 py-2 text-sm transition-colors hover:border-graphite"
      >
        {copied ? t("referral.copied") : t("referral.copy")}
      </button>
    </div>
  );
}

export function ReferralPanel({
  initialCode,
  count,
  days,
  origin,
}: {
  initialCode: string | null;
  count: number;
  days: number;
  origin: string;
}) {
  const t = useT();
  const [code, setCode] = useState(initialCode);
  const [pending, start] = useTransition();

  return (
    <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
      <h2 className="font-display text-base font-semibold">
        {t("referral.title")}
      </h2>
      <p className="mt-1 text-sm text-graphite">{t("referral.lede", { days })}</p>

      {code ? (
        <>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-graphite">
            {t("referral.yourCode")}
          </p>
          <CopyField value={code} label={t("referral.copy")} />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-graphite">
            {t("referral.yourLink")}
          </p>
          <CopyField
            value={`${origin}/signup?kod=${code}`}
            label={t("referral.copy")}
          />
          <p className="mt-4 text-sm text-graphite">
            {count > 0
              ? t("referral.count", { count })
              : t("referral.countNone")}
          </p>
        </>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setCode(await issueReferralCodeAction());
            })
          }
          className="mt-4 rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
        >
          {t("referral.title")}
        </button>
      )}

      <p className="mt-5 border-t border-grid pt-4 text-[11px] leading-relaxed text-graphite">
        {t("referral.honesty")}
      </p>
    </section>
  );
}

export function ProgressCardPanel({
  initialCode,
  origin,
}: {
  initialCode: string | null;
  origin: string;
}) {
  const t = useT();
  const [code, setCode] = useState(initialCode);
  const [pending, start] = useTransition();

  return (
    <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
      <h2 className="font-display text-base font-semibold">
        {t("progressCard.title")}
      </h2>
      <p className="mt-1 text-sm text-graphite">{t("progressCard.lede")}</p>

      {code ? (
        <>
          <CopyField value={`${origin}/kort/${code}`} label={t("progressCard.copy")} />
          <p className="mt-3 text-[11px] text-graphite">
            {t("progressCard.shareNote")}
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await revokeShareCodeAction();
                setCode(null);
              })
            }
            className="mt-4 rounded-control border border-grid px-4 py-2.5 text-sm transition-colors hover:border-redpen hover:text-redpen disabled:opacity-60"
          >
            {t("progressCard.revoke")}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setCode(await issueShareCodeAction());
            })
          }
          className="mt-4 rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
        >
          {t("progressCard.create")}
        </button>
      )}
    </section>
  );
}
