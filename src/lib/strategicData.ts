import { supabase } from "@/lib/supabase";
import { normalizeScore } from "@/lib/dashboardData";
import { LOCAL_ENTITY_LOGOS } from "@/lib/entityLogos";

/* ─────────────────────────────────────────────────────────────
   Camada de dados do Panorama Estratégico (cross-entidade).
   Isolada da restante plataforma: só LÊ das mesmas views públicas
   (organizations, thematic_priorities, indicators, measurements_catalog)
   e reutiliza a normalização de score do dashboard por entidade para
   garantir números consistentes.

   Convenção (igual ao resto da plataforma): a linha "agregada" de um
   serviço+indicador é a que não tem canal nem segmentação geográfica.
   Aqui trabalhamos só ao nível agregado (channel null, geo null),
   somando/ponderando sobre todos os serviços de cada entidade.
   ───────────────────────────────────────────────────────────── */

export const SCORABLE_TYPES = ["likert_1_5", "scale_1_10", "nps", "categorical_sim_nao"];

export type StrategicEntity = { short: string; name: string; logo: string | null };
export type StrategicPriority = { id: string; namePt: string; displayOrder: number };
export type StrategicIndicator = {
  id: string;
  description: string;
  valueType: string;
  typeOfIndicator: "operational" | "user_experience" | "compliance";
  priorityId: string | null;
  /** Para indicadores de compliance: 'below' inverte a polaridade Sim/Não
   * (a resposta desejada é "Não") — ver migration 042 e lib/measurements.ts. */
  targetDirection: "above" | "below" | null;
};
export type StrategicRow = {
  entity_short: string;
  indicator_id: string;
  year: number;
  month: number | null;
  value: number | null;
  total_respondentes: number | null;
  category_counts: Record<string, number> | null;
};

export type StrategicData = {
  entities: StrategicEntity[];
  priorities: StrategicPriority[];
  indicators: StrategicIndicator[];
  rows: StrategicRow[];
};

const PAGE = 1000;

export async function fetchStrategicData(): Promise<StrategicData> {
  const [orgRes, priRes, indRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("short_name, name, logo_url, active")
      .eq("active", true)
      .order("name"),
    supabase.from("thematic_priorities").select("id, name_pt, display_order").order("display_order"),
    supabase
      .from("indicators")
      .select("id, description, value_type, type_of_indicator, thematic_priority_id, target_direction"),
  ]);
  if (orgRes.error) throw orgRes.error;
  if (priRes.error) throw priRes.error;
  if (indRes.error) throw indRes.error;

  // Linhas agregadas de TODAS as entidades — só nível agregado (sem canal nem
  // geografia). Paginado porque o PostgREST limita a 1000 linhas por pedido.
  const rows: StrategicRow[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("measurements_catalog")
      .select("entity_short, indicator_id, year, month, value, total_respondentes, category_counts")
      .is("channel", null)
      .is("geo_name", null)
      .range(page * PAGE, (page + 1) * PAGE - 1);
    if (error) throw error;
    for (const r of data ?? []) {
      rows.push({
        entity_short: r.entity_short as string,
        indicator_id: r.indicator_id as string,
        year: r.year as number,
        month: (r.month as number | null) ?? null,
        value: r.value != null ? Number(r.value) : null,
        total_respondentes: (r.total_respondentes as number | null) ?? null,
        category_counts: (r.category_counts as Record<string, number> | null) ?? null,
      });
    }
    if (!data || data.length < PAGE) break;
  }

  return {
    entities: (orgRes.data ?? []).map((o) => ({
      short: o.short_name as string,
      name: o.name as string,
      logo: (o.logo_url as string | null) ?? LOCAL_ENTITY_LOGOS[o.short_name as string] ?? null,
    })),
    priorities: (priRes.data ?? []).map((p) => ({
      id: p.id as string,
      namePt: p.name_pt as string,
      displayOrder: p.display_order as number,
    })),
    indicators: (indRes.data ?? []).map((i) => ({
      id: i.id as string,
      description: i.description as string,
      valueType: i.value_type as string,
      typeOfIndicator: i.type_of_indicator as StrategicIndicator["typeOfIndicator"],
      priorityId: (i.thematic_priority_id as string | null) ?? null,
      targetDirection: (i.target_direction as "above" | "below" | null) ?? null,
    })),
    rows,
  };
}

/* ── Helpers de agregação (mesma convenção do dashboard por entidade) ── */

type ValRow = { value: number | null; total_respondentes: number | null };

/** Média ponderada pelo nº de respondentes (idêntica a dashboardData.wavg). */
export function wavgLite(rows: ValRow[]): { avg: number; n: number } | null {
  const valid = rows.filter((r) => r.value != null);
  if (!valid.length) return null;
  let sum = 0;
  let n = 0;
  for (const r of valid) {
    const w = r.total_respondentes && r.total_respondentes > 0 ? r.total_respondentes : 1;
    sum += (r.value as number) * w;
    n += w;
  }
  return { avg: sum / n, n };
}

/** Uma linha "conta como recolha" se traz um valor numérico ou contagens. */
export function rowHasData(r: StrategicRow): boolean {
  return r.value != null || (r.category_counts != null && Object.keys(r.category_counts).length > 0);
}

export type DimScoreCell = { score: number | null; n: number };

/**
 * Score 0–100 por (entidade × dimensão) — mesma regra do radar por entidade:
 * média dos indicadores de experiência/conformidade normalizados à escala 0–100
 * e ponderados pelo nº de respostas. Chave do mapa: `${entityShort}::${priorityId}`.
 */
export function dimensionScoreMatrix(data: StrategicData): Map<string, DimScoreCell> {
  const scorable = data.indicators.filter(
    (i) =>
      (i.typeOfIndicator === "user_experience" || i.typeOfIndicator === "compliance") &&
      SCORABLE_TYPES.includes(i.valueType) &&
      i.priorityId
  );
  const indById = new Map(scorable.map((i) => [i.id, i]));

  // rows por (entidade, indicador)
  const byEntInd = new Map<string, StrategicRow[]>();
  for (const r of data.rows) {
    if (!indById.has(r.indicator_id)) continue;
    const k = `${r.entity_short}::${r.indicator_id}`;
    if (!byEntInd.has(k)) byEntInd.set(k, []);
    byEntInd.get(k)!.push(r);
  }

  const out = new Map<string, DimScoreCell>();
  for (const e of data.entities) {
    for (const p of data.priorities) {
      const inds = scorable.filter((i) => i.priorityId === p.id);
      let weighted = 0;
      let totalW = 0;
      for (const ind of inds) {
        const rows = byEntInd.get(`${e.short}::${ind.id}`) ?? [];
        const agg = wavgLite(rows);
        if (!agg) continue;
        // Polaridade (target_direction='below' inverte Sim/Não — ver migration 042).
        // A inversão só se aplica a categorical_sim_nao, onde agg.avg já é % de "Sim".
        const avg =
          ind.targetDirection === "below" && ind.valueType === "categorical_sim_nao" ? 100 - agg.avg : agg.avg;
        const score = normalizeScore(ind.valueType, avg);
        if (score == null) continue;
        weighted += score * agg.n;
        totalW += agg.n;
      }
      out.set(`${e.short}::${p.id}`, { score: totalW > 0 ? weighted / totalW : null, n: totalW });
    }
  }
  return out;
}

/** Uma entidade "recolhe" uma dimensão se tem ≥1 linha com dados num indicador dessa dimensão. */
export function coverageMatrix(data: StrategicData): Map<string, boolean> {
  const priByInd = new Map(data.indicators.map((i) => [i.id, i.priorityId]));
  const out = new Map<string, boolean>();
  for (const r of data.rows) {
    if (!rowHasData(r)) continue;
    const pri = priByInd.get(r.indicator_id);
    if (!pri) continue;
    out.set(`${r.entity_short}::${pri}`, true);
  }
  return out;
}

export type DimensionCompleteness = {
  id: string;
  name: string;
  /** Nº de indicadores definidos na Matriz para esta dimensão. */
  totalIndicators: number;
  /** Média, entre entidades, de indicadores da dimensão efetivamente reportados. */
  avgFilled: number;
  /** Completude 0–100 (avgFilled / totalIndicators). `null` quando não há indicadores. */
  pct: number | null;
  /** Entidades (short) com ≥1 indicador reportado nesta dimensão. */
  entitiesReporting: number;
};

/**
 * Completude da recolha por dimensão: que proporção dos indicadores definidos
 * para a dimensão é, em média, reportada pelas entidades. Revela sub-recolha
 * (denominador = todos os indicadores da dimensão). Dimensões sem indicadores
 * definidos na Matriz ficam com `pct = null`.
 */
export function dimensionCompleteness(data: StrategicData): DimensionCompleteness[] {
  // indicadores por dimensão
  const indsByPriority = new Map<string, string[]>();
  for (const i of data.indicators) {
    if (!i.priorityId) continue;
    if (!indsByPriority.has(i.priorityId)) indsByPriority.set(i.priorityId, []);
    indsByPriority.get(i.priorityId)!.push(i.id);
  }
  // indicadores com dados por entidade
  const filledByEntity = new Map<string, Set<string>>();
  for (const r of data.rows) {
    if (!rowHasData(r)) continue;
    if (!filledByEntity.has(r.entity_short)) filledByEntity.set(r.entity_short, new Set());
    filledByEntity.get(r.entity_short)!.add(r.indicator_id);
  }

  return data.priorities.map((p) => {
    const inds = indsByPriority.get(p.id) ?? [];
    const total = inds.length;
    let sumFilled = 0;
    let entitiesReporting = 0;
    for (const e of data.entities) {
      const filledSet = filledByEntity.get(e.short);
      const filled = filledSet ? inds.filter((id) => filledSet.has(id)).length : 0;
      sumFilled += filled;
      if (filled > 0) entitiesReporting += 1;
    }
    const avgFilled = data.entities.length ? sumFilled / data.entities.length : 0;
    return {
      id: p.id,
      name: p.namePt,
      totalIndicators: total,
      avgFilled,
      pct: total > 0 ? (avgFilled / total) * 100 : null,
      entitiesReporting,
    };
  });
}

export type SharedIndicator = {
  id: string;
  description: string;
  valueType: string;
  priorityName: string;
  scorable: boolean;
  entitiesReporting: number;
};

/** Indicadores reportados (com dados) por ≥2 entidades — base do comparador. */
export function sharedIndicators(data: StrategicData): SharedIndicator[] {
  const priName = new Map(data.priorities.map((p) => [p.id, p.namePt]));
  const entsByInd = new Map<string, Set<string>>();
  for (const r of data.rows) {
    if (!rowHasData(r)) continue;
    if (!entsByInd.has(r.indicator_id)) entsByInd.set(r.indicator_id, new Set());
    entsByInd.get(r.indicator_id)!.add(r.entity_short);
  }
  return data.indicators
    .map((i) => ({
      id: i.id,
      description: i.description,
      valueType: i.valueType,
      priorityName: (i.priorityId && priName.get(i.priorityId)) || "—",
      scorable: SCORABLE_TYPES.includes(i.valueType),
      entitiesReporting: entsByInd.get(i.id)?.size ?? 0,
    }))
    .filter((i) => i.entitiesReporting >= 2)
    .sort((a, b) => b.entitiesReporting - a.entitiesReporting || a.description.localeCompare(b.description, "pt"));
}

export type IndicatorEntityValue = {
  entityShort: string;
  /** Score 0–100 (indicadores normalizáveis) ou valor médio bruto (restantes). */
  value: number | null;
  n: number;
};

/** Valor por entidade para um indicador: score normalizado se aplicável, senão média bruta. */
export function indicatorAcrossEntities(
  data: StrategicData,
  indicatorId: string
): { scorable: boolean; values: IndicatorEntityValue[] } {
  const ind = data.indicators.find((i) => i.id === indicatorId);
  const scorable = ind ? SCORABLE_TYPES.includes(ind.valueType) : false;
  const values = data.entities.map((e) => {
    const rows = data.rows.filter((r) => r.indicator_id === indicatorId && r.entity_short === e.short);
    const agg = wavgLite(rows);
    if (!agg) return { entityShort: e.short, value: null, n: 0 };
    // Polaridade (target_direction='below' inverte Sim/Não — ver migration 042).
    // A inversão só se aplica a categorical_sim_nao, onde agg.avg já é % de "Sim".
    const avg =
      ind && ind.targetDirection === "below" && ind.valueType === "categorical_sim_nao" ? 100 - agg.avg : agg.avg;
    const v = scorable && ind ? normalizeScore(ind.valueType, avg) : agg.avg;
    return { entityShort: e.short, value: v, n: agg.n };
  });
  return { scorable, values };
}

export type EntityMaturity = {
  short: string;
  distinctPeriods: number;
  monthlyPeriods: number;
  cadence: "mensal" | "pontual" | "sem dados";
  indicatorsReported: number;
  dimensionsCovered: number;
  firstPeriod: string | null;
  lastPeriod: string | null;
};

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function periodLabel(year: number, month: number | null): string {
  return month ? `${MONTHS_PT[month - 1]} ${year}` : String(year);
}

/** Sinais de maturidade da recolha por entidade. */
export function maturityByEntity(data: StrategicData): EntityMaturity[] {
  const priByInd = new Map(data.indicators.map((i) => [i.id, i.priorityId]));
  return data.entities.map((e) => {
    const rows = data.rows.filter((r) => r.entity_short === e.short && rowHasData(r));
    const periods = new Set<number>();
    const monthly = new Set<number>();
    const inds = new Set<string>();
    const dims = new Set<string>();
    let minP = Infinity;
    let maxP = -Infinity;
    let minRow: StrategicRow | null = null;
    let maxRow: StrategicRow | null = null;
    for (const r of rows) {
      const key = r.year * 100 + (r.month ?? 0);
      periods.add(key);
      if (r.month != null) monthly.add(r.year * 100 + r.month);
      inds.add(r.indicator_id);
      const pri = priByInd.get(r.indicator_id);
      if (pri) dims.add(pri);
      if (key < minP) { minP = key; minRow = r; }
      if (key > maxP) { maxP = key; maxRow = r; }
    }
    return {
      short: e.short,
      distinctPeriods: periods.size,
      monthlyPeriods: monthly.size,
      cadence: monthly.size >= 2 ? "mensal" : periods.size >= 1 ? "pontual" : "sem dados",
      indicatorsReported: inds.size,
      dimensionsCovered: dims.size,
      firstPeriod: minRow ? periodLabel(minRow.year, minRow.month) : null,
      lastPeriod: maxRow ? periodLabel(maxRow.year, maxRow.month) : null,
    };
  });
}
