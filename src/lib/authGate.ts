// Gate de acesso simples (1 password partilhada, sem contas de utilizador).
// O cookie nunca guarda a password em claro — guarda o hash da password
// correta, para que o proxy possa validar sem repetir o segredo no cliente.
import { createHash } from "crypto";

export const AUTH_COOKIE = "app_gate";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export function gateToken(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
