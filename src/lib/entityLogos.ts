// Logótipos locais por entidade (short_name), usados enquanto logo_url não
// estiver preenchido na tabela organizations. Fonte única para toda a app.
export const LOCAL_ENTITY_LOGOS: Record<string, string> = {
  at: "/logo-at.jpeg",
  iss: "/logo-iss.jpg",
  ec: "/logo-arte-entity.svg",
  cml: "/logo-cml.png",
  adc: "/logo-adc.png",
};

/** Devolve o caminho do logótipo de uma entidade pelo short_name, ou null. */
export function entityLogo(shortName: string | null | undefined): string | null {
  if (!shortName) return null;
  return LOCAL_ENTITY_LOGOS[shortName] ?? null;
}
