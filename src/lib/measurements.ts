// Agregação de medições (measurements_catalog) por indicador + serviço.
// Fonte única de verdade partilhada entre a página de Dimensões e a página de detalhe
// de uma dimensão, para que "dados em falta" seja calculado sempre da mesma forma.

import { supabase } from "@/lib/supabase";

export type MeasRow = {
  channel: string | null;
  geo_level: string | null;
  value: number | string | null;
  category_counts: Record<string, number> | null;
};

export function aggregateValue(rows: MeasRow[]): number | null {
  // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por distrito
  // também têm channel=null, por isso é preciso excluir geo_level para não as confundir com
  // o total — mesmo critério da página de detalhe do indicador).
  const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source.map((r) => Number(r.value)).filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

export function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.geo_level === null && r.category_counts)
    ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

/** Indica se há pelo menos uma resposta real nas contagens categóricas — um objeto
 * com todas as categorias a 0 não conta como "ter dados" (indicador continua em falta). */
export function hasCategoryData(counts: Record<string, number> | null | undefined): boolean {
  return !!counts && Object.values(counts).some((v) => typeof v === "number" && v > 0);
}

/** Isola, de um conjunto de linhas de um indicador, as que correspondem a um canal
 * específico (excluindo sempre segmentação geográfica). channel = null devolve a
 * agregação normal do serviço (todos os canais, comportamento de sempre). */
export function rowsForChannel(rows: MeasRow[], channel: string | null): MeasRow[] {
  if (channel === null) return rows;
  const row = rows.find((r) => r.channel === channel && r.geo_level === null);
  return row ? [row] : [];
}
