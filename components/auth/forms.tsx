"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
  type AuthResult,
} from "@/lib/auth/actions";
import { useT } from "@/components/i18n-provider";
import { authMessage } from "@/lib/auth/messages";
import { REFERRAL_DAYS } from "@/lib/retention/terms";
import { FieldLabel, inputClass, submitClass } from "./auth-shell";

const EMPTY: AuthResult = { error: null };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <button type="submit" disabled={pending} className={submitClass}>
      {pending ? t("auth.working") : label}
    </button>
  );
}

function Problem({ code }: { code: string | null }) {
  const t = useT();
  const message = authMessage(t, code);
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-redpen">
      {message}
    </p>
  );
}

export function SignUpForm({ referral }: { referral?: string }) {
  const t = useT();
  const [state, action] = useActionState(signUpAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <div>
        <FieldLabel htmlFor="name">
          {t("auth.name", { optional: t("common.optional") })}
        </FieldLabel>
        <input id="name" name="name" autoComplete="name" className={inputClass} />
      </div>
      <div>
        <FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-graphite">
          {t("auth.passwordHint")}
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="referral">
          {t("referral.fieldLabel", { optional: t("common.optional") })}
        </FieldLabel>
        <input
          id="referral"
          name="referral"
          defaultValue={referral ?? ""}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-graphite">
          {t("referral.fieldHint", { days: REFERRAL_DAYS })}
        </p>
      </div>
      <Problem code={state.error} />
      <Submit label={t("auth.signUp")} />
    </form>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const t = useT();
  const [state, action] = useActionState(signInAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <Problem code={state.error} />
      <Submit label={t("auth.signIn")} />
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action] = useActionState(requestPasswordResetAction, EMPTY);
  const submitted = state !== EMPTY && state.error === null;
  return (
    <form action={action} className="space-y-4">
      <div>
        <FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <Problem code={state.error} />
      {submitted && (
        <p className="text-sm text-ballpoint">{t("auth.forgotSent")}</p>
      )}
      <Submit label={t("auth.forgotSubmit")} />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT();
  const [state, action] = useActionState(resetPasswordAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <FieldLabel htmlFor="password">{t("auth.newPassword")}</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-graphite">
          {t("auth.passwordHint")}
        </p>
      </div>
      <Problem code={state.error} />
      <Submit label={t("auth.resetSubmit")} />
    </form>
  );
}
