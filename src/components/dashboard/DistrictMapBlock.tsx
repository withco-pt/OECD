"use client";

import { useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { useRevealed } from "./Reveal";
import { DISTRICT_PATHS, ISLAND_BOXES } from "./portugal-districts";
import { type DashboardData, wavg } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 6 — Mapa de Portugal por distrito (choropleth).
   Métrica alternável: nº de respostas ao questionário ou
   satisfação global média (1–10), por distrito de residência.
   Rampa sequencial de um só tom (primary, claro → escuro).
   ───────────────────────────────────────────────────────────── */

// Escala amarelo → verde (pior → melhor), ancorada nos tokens warning/success do Ágora.
const RAMP = ["#ffd966", "#cde388", "#8fd06c", "#1f9970", "#005539"];
const NO_DATA_FILL = "#cdd2dc";
const FOREIGN = "Residência fora de Portugal";

type Metric = "respostas" | "csat";
type DistrictValue = { respostas: number; csat: number | null };

function computeDistricts(data: DashboardData): { values: Map<string, DistrictValue>; foreign: number } | null {
  // Indicador canónico: satisfação global; fallback: o indicador UX com mais linhas por distrito.
  const geoRows = data.rows.filter((r) => r.geo_level === "distrito" && r.geo_name);
  if (!geoRows.length) return null;
  const csatInd = data.indicators.find((i) => i.etlKey === "ux_csat");
  let rows = csatInd ? geoRows.filter((r) => r.indicator_id === csatInd.id) : [];
  if (!rows.length) {
    const counts = new Map<string, number>();
    for (const r of geoRows) counts.set(r.indicator_id, (counts.get(r.indicator_id) ?? 0) + 1);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    rows = geoRows.filter((r) => r.indicator_id === best);
  }
  if (!rows.length) return null;

  const values = new Map<string, DistrictValue>();
  let foreign = 0;
  const byDistrict = new Map<string, typeof rows>();
  for (const r of rows) {
    const name = r.geo_name as string;
    if (name === FOREIGN) {
      foreign += r.total_respondentes ?? 0;
      continue;
    }
    if (!byDistrict.has(name)) byDistrict.set(name, []);
    byDistrict.get(name)!.push(r);
  }
  for (const [name, dRows] of byDistrict) {
    const agg = wavg(dRows);
    values.set(name, {
      respostas: dRows.reduce((a, r) => a + (r.total_respondentes ?? 0), 0),
      csat: agg ? agg.avg : null,
    });
  }
  return { values, foreign };
}

function binIndex(v: number, min: number, max: number): number {
  if (max <= min) return RAMP.length - 1;
  return Math.min(RAMP.length - 1, Math.floor(((v - min) / (max - min)) * RAMP.length));
}

/** SVG do mapa — componente próprio para ler o RevealContext do cartão.
 *  Os distritos aparecem em cascata; a cor transita ao mudar de métrica. */
function MapSvg({
  fills,
  valueFor,
  fmtValue,
  badgeFor,
}: {
  fills: Map<string, string>;
  valueFor: (name: string) => number | undefined;
  fmtValue: (v: number) => string;
  /** Texto do badge circular no centro do distrito (null → sem badge). */
  badgeFor: (name: string) => string | null;
}) {
  const revealed = useRevealed();
  return (
    <svg viewBox="0 0 458 605" className="w-[46%] max-w-[300px] shrink-0" role="img" aria-label="Mapa de Portugal por distrito">
      {ISLAND_BOXES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#bbd1fd" strokeWidth="2" style={{ opacity: revealed ? 1 : 0, transition: "opacity 500ms ease-out" }} />
      ))}
      {DISTRICT_PATHS.map((p, i) => {
        const fill = fills.get(p.name) ?? NO_DATA_FILL;
        const val = valueFor(p.name);
        return (
          <path
            key={p.name}
            d={p.d}
            fill={fill}
            stroke="#ffffff"
            strokeWidth="1.2"
            className="hover:opacity-80"
            style={{
              // undefined depois de revelado para o hover:opacity-80 voltar a funcionar
              opacity: revealed ? undefined : 0,
              transition: "opacity 400ms ease-out, fill 400ms ease-out",
              transitionDelay: revealed ? `${i * 35}ms` : "0ms",
            }}
          >
            <title>{val != null ? `${p.name}: ${fmtValue(val)}` : `${p.name}: sem dados`}</title>
          </path>
        );
      })}
      {/* Badges com o valor por distrito — aparecem depois dos distritos */}
      {DISTRICT_PATHS.map((p, i) => {
        const badge = badgeFor(p.name);
        if (badge == null) return null;
        const val = valueFor(p.name);
        return (
          <g
            key={`badge-${p.name}`}
            style={{
              opacity: revealed ? 1 : 0,
              transition: "opacity 300ms ease-out",
              transitionDelay: revealed ? `${250 + i * 35}ms` : "0ms",
            }}
            pointerEvents="none"
          >
            <circle cx={p.cx} cy={p.cy} r="14" fill="#ffffff" stroke="#e1e4ea" strokeWidth="1" />
            <text
              x={p.cx}
              y={p.cy + 4}
              textAnchor="middle"
              fontSize={badge.length > 2 ? 10 : 12}
              fontWeight="700"
              fill="#002b82"
            >
              {badge}
            </text>
            <title>{val != null ? `${p.name}: ${fmtValue(val)}` : p.name}</title>
          </g>
        );
      })}
    </svg>
  );
}

export default function DistrictMapBlock({ data }: { data: DashboardData }) {
  const result = useMemo(() => computeDistricts(data), [data]);
  const [metric, setMetric] = useState<Metric>("respostas");

  const view = useMemo(() => {
    if (!result) return null;
    const entries = [...result.values.entries()]
      .map(([name, v]) => ({ name, value: metric === "respostas" ? v.respostas : v.csat }))
      .filter((e): e is { name: string; value: number } => e.value != null && (metric === "csat" || e.value > 0));
    if (!entries.length) return null;
    const min = metric === "respostas" ? 0 : Math.min(...entries.map((e) => e.value));
    const max = Math.max(...entries.map((e) => e.value));
    const fills = new Map(entries.map((e) => [e.name, RAMP[binIndex(e.value, min, max)]]));
    const top = [...entries].sort((a, b) => b.value - a.value).slice(0, 5);
    // Limites dos intervalos da legenda
    const legend = RAMP.map((color, i) => {
      const lo = min + ((max - min) / RAMP.length) * i;
      const hi = min + ((max - min) / RAMP.length) * (i + 1);
      const fmt = (n: number) => (metric === "csat" ? n.toFixed(1) : String(Math.round(n)));
      return { color, label: `${fmt(lo)} – ${fmt(hi)}` };
    });
    return { entries, fills, top, legend };
  }, [result, metric]);

  const fmtValue = (v: number) => (metric === "csat" ? v.toFixed(1) : String(Math.round(v)));

  return (
    <DashboardCard
      title="Distribuição Geográfica"
      subtitle="Por distrito de residência dos respondentes ao questionário"
      help="Mostra de onde vêm as respostas ao questionário de satisfação e como varia a satisfação média entre distritos. Distritos a cinzento não têm dados."
      className="flex-1 min-w-0"
    >
      {!result || !view ? (
        <div className="h-[340px] flex items-center justify-center">
          <EmptyChartState
            title="Sem dados por distrito"
            description="Ainda não há medições com segmentação geográfica para esta entidade."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {/* Toggle de métrica */}
          <div className="bg-primary-200 flex gap-[4px] items-center px-[5px] py-[4px] rounded-[12px] self-start">
            {(
              [
                { key: "respostas", label: "Respostas" },
                { key: "csat", label: "Satisfação (1–10)" },
              ] as { key: Metric; label: string }[]
            ).map((o) => (
              <button
                key={o.key}
                onClick={() => setMetric(o.key)}
                className={`h-[30px] px-[12px] rounded-[12px] text-[14px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  metric === o.key ? "bg-primary-600 text-white" : "text-primary-900 hover:bg-primary-300/60"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="flex gap-[20px] items-start">
            {/* Mapa */}
            <MapSvg
              fills={view.fills}
              valueFor={(name) => view.entries.find((e) => e.name === name)?.value}
              fmtValue={fmtValue}
              badgeFor={(name) => {
                const v = view.entries.find((e) => e.name === name)?.value;
                // Como no modelo de referência: satisfação arredondada ao inteiro; contagens tal e qual.
                return v != null ? String(Math.round(v)) : null;
              }}
            />

            {/* Legenda + top 5 */}
            <div className="flex-1 min-w-0 flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[4px]">
                <p className="text-[13px] font-semibold text-primary-900">
                  {metric === "respostas" ? "Respostas" : "Satisfação média"}
                </p>
                {view.legend.map((l) => (
                  <div key={l.label} className="flex items-center gap-[8px]">
                    <span className="size-[14px] rounded-[3px] shrink-0 border border-primary-300/50" style={{ background: l.color }} />
                    <span className="text-[12px] text-primary-900">{l.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-[8px]">
                  <span className="size-[14px] rounded-[3px] shrink-0 border border-neutral-300" style={{ background: NO_DATA_FILL }} />
                  <span className="text-[12px] text-neutral-700">Sem dados</span>
                </div>
              </div>

              <div className="flex flex-col gap-[4px]">
                <p className="text-[13px] font-semibold text-primary-900">Top 5 distritos</p>
                {view.top.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between gap-[8px]">
                    <span className="text-[13px] text-primary-900 truncate">
                      {i + 1}. {t.name}
                    </span>
                    <span className="text-[13px] font-bold text-primary-800 shrink-0">{fmtValue(t.value)}</span>
                  </div>
                ))}
              </div>

              {result.foreign > 0 && metric === "respostas" && (
                <p className="text-[12px] text-primary-700">
                  + {result.foreign} respostas de residentes fora de Portugal
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
