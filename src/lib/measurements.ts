// Agregação de medições (measurements_catalog) por indicador + serviço.
// Fonte única de verdade partilhada entre a página de Dimensões e a página de detalhe
// de uma dimensão, para que "dados em falta" seja calculado sempre da mesma forma.

export type MeasRow = {
  channel: string | null;
  geo_level: string | null;
  month: number | null;
  value: number | string | null;
  category_counts: Record<string, number> | null;
};

/** Indicadores "Número de…"/"Nº…" somam entre geografias/serviços; os restantes
 * (tempos, rácios, scores) fazem média — mesmo critério usado em TrendBlock. */
export function isSumIndicator(description: string): boolean {
  return /^(número|nº|n\.?º)/i.test(description.trim());
}

/** Canais que são um caso particular de um canal mais amplo: filtrar pelo canal amplo
 * inclui também os específicos. O atendimento em Loja de Cidadão é, na prática,
 * atendimento presencial (decisão da cliente, 2026-07-28: procurava estes indicadores
 * no filtro "Presencial" e não os encontrava). "Loja de Cidadão" mantém-se como opção
 * própria no filtro, para quem quiser isolar só as lojas. */
export const CHANNEL_INCLUDES: Record<string, string[]> = {
  Presencial: ["Loja de Cidadão"],
};

/** O canal de uma linha corresponde ao canal filtrado? Inclui os canais mais
 * específicos que caem dentro do filtrado (ver CHANNEL_INCLUDES). */
export function channelMatches(rowChannel: string | null, selected: string): boolean {
  if (rowChannel === selected) return true;
  if (rowChannel === null) return false;
  return (CHANNEL_INCLUDES[selected] ?? []).includes(rowChannel);
}

export function aggregateValue(rows: MeasRow[], isSum = false): number | null {
  // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por distrito
  // também têm channel=null, por isso é preciso excluir geo_level para não as confundir com
  // o total — mesmo critério da página de detalhe do indicador).
  const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
  let source = nullRow ? [nullRow] : rows;
  if (!nullRow) {
    // Indicadores só com quebra geográfica (ex.: Lojas de Cidadão, migration 058) nunca
    // têm linha sem geo_level — usar a linha-snapshot (month=null) de cada geografia,
    // mesma convenção já usada para os indicadores sem geo, agregando entre geografias.
    const snapshot = rows.filter((r) => r.geo_level !== null && (r.month ?? null) === null);
    if (snapshot.length) source = snapshot;
  }
  const nums = source
    .filter((r) => r.value !== null && r.value !== undefined)
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  return Math.round((isSum ? total : total / nums.length) * 100) / 100;
}

/** Indicadores de compliance: por defeito "Sim" (value=100) é a resposta desejada e
 * "Não" (value=0) é incumprimento. target_direction='below' inverte esta polaridade
 * para indicadores cuja resposta desejada é "Não" — ver migration 042. */
export function isNonCompliant(
  typeOfIndicator: string | null,
  value: number | null,
  targetValue: number | null,
  targetDirection: "above" | "below" | null,
): boolean {
  if (typeOfIndicator !== "compliance" || value === null) return false;
  const threshold = targetValue ?? 50;
  return targetDirection === "below" ? value > threshold : value < threshold;
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
export function rowsForChannel(
  rows: MeasRow[],
  channel: string | null,
  /** indicators.channel_scope — o âmbito declarado do indicador (ver abaixo). */
  channelScope?: string | null,
): MeasRow[] {
  if (channel === null) return rows;
  const row = rows.find((r) => channelMatches(r.channel, channel) && r.geo_level === null);
  if (row) return [row];
  // Indicadores só com quebra geográfica (ex.: Lojas de Cidadão, migration 062) guardam
  // um único channel-etiqueta (ex. "Loja de Cidadão") em todas as suas linhas — isso não é
  // uma quebra por vários canais reais, por isso não deve cair no "sem dados para este
  // canal" que se aplica a indicadores com quebra por canal genuína.
  const geoOnly = rows.filter((r) => r.geo_level !== null);
  const otherRealChannels = rows.some(
    (r) => r.geo_level === null && r.channel !== null && !channelMatches(r.channel, channel),
  );
  if (!otherRealChannels && geoOnly.length && geoOnly.every((r) => channelMatches(r.channel, channel))) return geoOnly;
  // Indicador cujos dados não têm canal nenhum atribuído, mas cujo âmbito declarado é
  // exatamente este canal (ex.: "Número de atendimentos presenciais por serviço", âmbito
  // "Presencial"): o valor agregado É o valor deste canal, logo deve aparecer no filtro.
  // Só se aplica quando o âmbito nomeia um único canal igual ao filtrado — nunca com
  // "Todos os canais", onde seria atribuir dados multicanal a um canal só.
  const hasAnyChannel = rows.some((r) => r.channel !== null);
  if (!hasAnyChannel && channelScope && channelScope === channel) return rows;
  return [];
}
