import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, gateToken } from "@/lib/authGate";

// Gate de acesso simples: 1 password partilhada (APP_PASSWORD), sem contas de
// utilizador. Protege toda a app, incluindo /panorama — só /login fica de fora.
export function proxy(request: NextRequest) {
  const expectedPassword = process.env.APP_PASSWORD;

  if (!expectedPassword) {
    // Sem password configurada não há forma válida de autenticar — falhar
    // fechado (bloquear tudo) em vez de deixar a app aberta por omissão.
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === gateToken(expectedPassword)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)).*)",
  ],
};
