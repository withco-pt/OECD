import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Acesso Reservado" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-neutral-50" />}>
      <LoginForm />
    </Suspense>
  );
}
