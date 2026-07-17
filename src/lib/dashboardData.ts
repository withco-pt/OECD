import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────
   Camada de dados do Dashboard: carrega tudo o que a página
   precisa para a entidade selecionada e computa os agregados.
   Fonte: views públicas services_catalog / measurements_catalog
   + tabelas indicators / thematic_priorities.
   Convenção de agregação (igual ao resto da plataforma): a linha
   "agregada" de um serviço+indicador é a que não tem canal nem
   segmentação geográfica; pode existir 1 por mês.
   ───────────────────────────────────────────────────────────── */

export type IndicatorMeta = {
  id: string;
  description: string;
  etlKey: string | null;
  valueType: string;
  typeOfIndicator: "operational" | "user_experience" | "compliance";
  priorityId: string | null;
  scaleMin: number | null;
  scaleMax: number | null;
};

export type MeasurementRow = {
  service_id: string;
  indicator_id: string;
  year: number;
  month: number | null;
  channel: string | null;
  value: number | null;
  total_respondentes: number | null;
  category_counts: Record<string, number> | null;
  geo_level: string | null;
  geo_name: string | null;
};

export type ServiceMeta = {
  id: string;
  name: string;
  matriz: boolean;
  hasMeasurements: boolean;
};

export type PriorityMeta = { id: string; namePt: string; displayOrder: number };

export type DashboardData = {
  services: ServiceMeta[];
  indicators: IndicatorMeta[];
  priorities: PriorityMeta[];
  rows: MeasurementRow[];
};

const PAGE = 1000;

export async function fetchDashboardData(entityShort: string): Promise<DashboardData> {
  const [indRes, priRes, svcRes] = await Promise.all([
    supabase
      .from("indicators")
      .select("id, description, etl_column_key, value_type, type_of_indicator, thematic_priority_id, value_scale_min, value_scale_max"),
    supabase.from("thematic_priorities").select("id, name_pt, display_order").order("display_order"),
    supabase
      .from("services_catalog")
      .select("id, name, matriz_adotada, has_measurements")
      .eq("entity_short", entityShort)
      .order("name"),
  ]);
  if (indRes.error) throw indRes.error;
  if (priRes.error) throw priRes.error;
  if (svcRes.error) throw svcRes.error;

  // Medições da entidade — paginado (o PostgREST limita a 1000 linhas por pedido).
  const rows: MeasurementRow[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("measurements_catalog")
      .select("service_id, indicator_id, year, month, channel, value, total_respondentes, category_counts, geo_level, geo_name")
      .eq("entity_short", entityShort)
      .range(page * PAGE, (page + 1) * PAGE - 1);
    if (error) throw error;
    for (const r of data ?? []) {
      rows.push({
        service_id: r.service_id as string,
        indicator_id: r.indicator_id as string,
        year: r.year as number,
        month: (r.month as number | null) ?? null,
        channel: (r.channel as string | null) ?? null,
        value: r.value != null ? Number(r.value) : null,
        total_respondentes: (r.total_respondentes as number | null) ?? null,
        category_counts: (r.category_counts as Record<string, number> | null) ?? null,
        geo_level: (r.geo_level as string | null) ?? null,
        geo_name: (r.geo_name as string | null) ?? null,
      });
    }
    if (!data || data.length < PAGE) break;
  }

  return {
    services: (svcRes.data ?? []).map((s) => ({
      id: s.id as string,
      name: s.name as string,
      matriz: Boolean(s.matriz_adotada),
      hasMeasurements: Boolean(s.has_measurements),
    })),
    indicators: (indRes.data ?? []).map((i) => ({
      id: i.id as string,
      description: i.description as string,
      etlKey: (i.etl_column_key as string | null) ?? null,
      valueType: i.value_type as string,
      typeOfIndicator: i.type_of_indicator as IndicatorMeta["typeOfIndicator"],
      priorityId: (i.thematic_priority_id as string | null) ?? null,
      scaleMin: (i.value_scale_min as number | null) ?? null,
      scaleMax: (i.value_scale_max as number | null) ?? null,
    })),
    priorities: (priRes.data ?? []).map((p) => ({
      id: p.id as string,
      namePt: p.name_pt as string,
      displayOrder: p.display_order as number,
    })),
    rows,
  };
}

/* ── Helpers de agregação ───────────────────────────────────── */

/** Linha do canal ativo: sem canal nem geografia (agregado, quando `channel` é
 * null); ou, com um canal selecionado na dropdown global, a linha desse canal
 * específico (continua a excluir segmentação geográfica). */
export function isAggRow(r: MeasurementRow, channel: string | null = null): boolean {
  if (channel === null) return r.channel === null && r.geo_name === null;
  return r.channel === channel && r.geo_name === null;
}

function weight(r: MeasurementRow): number {
  return r.total_respondentes && r.total_respondentes > 0 ? r.total_respondentes : 1;
}

/** Média ponderada pelo nº de respondentes. */
export function wavg(rows: MeasurementRow[]): { avg: number; n: number } | null {
  const valid = rows.filter((r) => r.value != null);
  if (!valid.length) return null;
  let sum = 0;
  let n = 0;
  for (const r of valid) {
    const w = weight(r);
    sum += (r.value as number) * w;
    n += w;
  }
  return { avg: sum / n, n };
}

/** Soma de category_counts sobre um conjunto de linhas. */
export function sumCategories(rows: MeasurementRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (!r.category_counts) continue;
    for (const [k, v] of Object.entries(r.category_counts)) {
      out[k] = (out[k] ?? 0) + (typeof v === "number" ? v : 0);
    }
  }
  return out;
}

/** Normaliza um valor médio para 0–100 consoante o tipo de escala. */
export function normalizeScore(valueType: string, avg: number): number | null {
  switch (valueType) {
    case "likert_1_5":
      return ((avg - 1) / 4) * 100;
    case "scale_1_10":
      return ((avg - 1) / 9) * 100;
    case "nps":
      return (avg + 100) / 2;
    case "categorical_sim_nao":
      return avg; // já é percentagem de "Sim"
    default:
      return null; // contagens, tempos, texto — não são scores
  }
}

export function monthKey(r: MeasurementRow): string {
  return `${r.year}-${String(r.month ?? 0).padStart(2, "0")}`;
}

export const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function formatPeriod(year: number, month: number | null): string {
  if (!month) return String(year);
  return `${MONTHS_PT[month - 1]} ${year}`;
}
