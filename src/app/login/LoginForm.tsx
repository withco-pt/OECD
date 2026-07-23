"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-[16px]">
      <div className="w-full max-w-[380px] bg-white rounded-[16px] shadow-[0px_8px_32px_rgba(2,28,81,0.12)] border border-primary-200 p-[32px] flex flex-col items-center gap-[24px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-arte-entity.svg"
          alt="Agência para a Reforma Tecnológica do Estado"
          style={{ height: 40, width: "auto" }}
        />
        <div className="flex flex-col items-center gap-[4px] text-center">
          <h1 className="text-[20px] font-bold text-primary-900">Acesso Reservado</h1>
          <p className="text-[14px] text-neutral-700">
            Introduza a password para aceder à plataforma.
          </p>
        </div>
        <form action={formAction} className="w-full flex flex-col gap-[16px]">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            autoComplete="current-password"
            className="w-full h-[44px] px-[14px] rounded-[8px] border border-neutral-300 text-[15px] text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {state.error && (
            <p role="alert" className="text-[13px] text-danger-700 -mt-[8px]">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-[44px] rounded-[8px] bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-[15px] font-semibold transition-colors"
          >
            {pending ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
