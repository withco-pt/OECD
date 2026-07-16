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

/* ── Modo Canal (lente por canal) ──────────────────────────────
   Agrega as medições de TODA a entidade por indicador, para um dado
   canal (null = "Todos os canais"), excluindo segmentação geográfica.
   Usado quando a lente ativa é "canal" (o serviço fica desligado): os
   valores passam a ser da entidade inteira, fatiados pelo canal.
   Valor = média ponderada pelo nº de respondentes de cada serviço
   (mesmo critério do dashboard; peso 1 quando não há respondentes);
   category_counts = soma. */

export type ChannelAgg = { value: number | null; categoryCounts: Record<string, number> | null };

export async function fetchEntityChannelAggregates(
  entityShort: string,
  channel: string | null
): Promise<Map<string, ChannelAgg>> {
  const PAGE = 1000;
  const acc = new Map<string, { sum: number; weight: number; hasValue: boolean; cats: Record<string, number> | null }>();

  for (let page = 0; ; page++) {
    let q = supabase
      .from("measurements_catalog")
      .select("indicator_id, value, category_counts, total_respondentes")
      .eq("entity_short", entityShort)
      .is("geo_level", null);
    q = channel === null ? q.is("channel", null) : q.eq("channel", channel);

    const { data, error } = await q.range(page * PAGE, (page + 1) * PAGE - 1);
    if (error) throw error;

    for (const r of data ?? []) {
      const id = r.indicator_id as string;
      if (!acc.has(id)) acc.set(id, { sum: 0, weight: 0, hasValue: false, cats: null });
      const e = acc.get(id)!;
      const n = Number(r.value);
      if (r.value !== null && !Number.isNaN(n)) {
        const resp = r.total_respondentes as number | null;
        const w = resp && resp > 0 ? resp : 1;
        e.sum += n * w;
        e.weight += w;
        e.hasValue = true;
      }
      const cc = (r.category_counts as Record<string, number> | null) ?? null;
      if (cc) {
        e.cats = e.cats ?? {};
        for (const [k, v] of Object.entries(cc)) {
          e.cats[k] = (e.cats[k] ?? 0) + (typeof v === "number" ? v : 0);
        }
      }
    }
    if (!data || data.length < PAGE) break;
  }

  const out = new Map<string, ChannelAgg>();
  for (const [id, e] of acc) {
    const value = e.hasValue && e.weight > 0
      ? Math.round((e.sum / e.weight) * 100) / 100
      : null;
    out.set(id, { value, categoryCounts: e.cats });
  }
  return out;
}
