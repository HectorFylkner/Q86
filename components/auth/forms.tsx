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
import { authMessage } from "./messages";
import { FieldLabel, inputClass, submitClass } from "./auth-shell";

const EMPTY: AuthResult = { error: null };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={submitClass}>
      {pending ? "Ett ögonblick…" : label}
    </button>
  );
}

function Problem({ code }: { code: string | null }) {
  const message = authMessage(code);
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-redpen">
      {message}
    </p>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <div>
        <FieldLabel htmlFor="name">Namn (valfritt)</FieldLabel>
        <input id="name" name="name" autoComplete="name" className={inputClass} />
      </div>
      <div>
        <FieldLabel htmlFor="email">E-post</FieldLabel>
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
        <FieldLabel htmlFor="password">Lösenord</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-graphite">Minst 10 tecken.</p>
      </div>
      <Problem code={state.error} />
      <Submit label="Skapa konto" />
    </form>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signInAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <FieldLabel htmlFor="email">E-post</FieldLabel>
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
        <FieldLabel htmlFor="password">Lösenord</FieldLabel>
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
      <Submit label="Logga in" />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, EMPTY);
  const submitted = state !== EMPTY && state.error === null;
  return (
    <form action={action} className="space-y-4">
      <div>
        <FieldLabel htmlFor="email">E-post</FieldLabel>
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
        <p className="text-sm text-ballpoint">
          Om adressen har ett konto är ett mejl med en återställningslänk på
          väg. Länken gäller i 30 minuter.
        </p>
      )}
      <Submit label="Skicka återställningslänk" />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <FieldLabel htmlFor="password">Nytt lösenord</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-graphite">Minst 10 tecken.</p>
      </div>
      <Problem code={state.error} />
      <Submit label="Spara nytt lösenord" />
    </form>
  );
}
