"use client";

import { useMemo } from "react";
import Link from "next/link";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { useRevealed } from "./Reveal";
import { type DashboardData, isAggRow, wavg, normalizeScore } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 2 — Perfil da entidade por dimensão (radar).
   Score 0–100 por dimensão: média dos indicadores de experiência
   do utilizador e de conformidade, normalizados à escala 0–100 e
   ponderados pelo nº de respondentes. A dimensão "Procura" mede
   volumes (não é um score) e fica de fora do radar.
   ───────────────────────────────────────────────────────────── */

type DimScore = { id: string; name: string; score: number | null; n: number };

function computeScores(data: DashboardData, channel: string | null): DimScore[] {
  const scorable = data.indicators.filter(
    (i) =>
      (i.typeOfIndicator === "user_experience" || i.typeOfIndicator === "compliance") &&
      ["likert_1_5", "scale_1_10", "nps", "categorical_sim_nao"].includes(i.valueType)
  );
  const byPriority = new Map<string, typeof scorable>();
  for (const ind of scorable) {
    if (!ind.priorityId) continue;
    if (!byPriority.has(ind.priorityId)) byPriority.set(ind.priorityId, []);
    byPriority.get(ind.priorityId)!.push(ind);
  }

  // Mostra sempre as 9 dimensões oficiais da Matriz — as sem indicadores de
  // score (ex.: Procura, que mede volumes) ou sem dados ficam marcadas como
  // "sem dados" em vez de desaparecerem do radar.
  return data.priorities.map((p) => {
    const inds = byPriority.get(p.id) ?? [];
    let weighted = 0;
    let totalW = 0;
    for (const ind of inds) {
      const rows = data.rows.filter((r) => r.indicator_id === ind.id && isAggRow(r, channel));
      const agg = wavg(rows);
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
    return {
      id: p.id,
      name: p.namePt,
      score: totalW > 0 ? weighted / totalW : null,
      n: totalW,
    };
  });
}

/** Parte o nome da dimensão em ≤3 linhas para caber junto ao eixo. */
function wrapLabel(name: string): string[] {
  if (name.length <= 16) return [name];
  const words = name.split(" ");
  const lines: string[] = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if ((cur + " " + w).trim().length > 15 && cur !== "") lines.push(w);
    else lines[lines.length - 1] = (cur + " " + w).trim();
  }
  return lines.slice(0, 3);
}

/** SVG do radar — componente próprio para poder ler o RevealContext do cartão. */
function Radar({ dims }: { dims: DimScore[] }) {
  const revealed = useRevealed();

  const CX = 210;
  const CY = 170;
  const R = 108;
  const N = dims.length;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const pointFor = (i: number, radius: number) => ({
    x: CX + radius * Math.cos(angleFor(i)),
    y: CY + radius * Math.sin(angleFor(i)),
  });

  const available = dims
    .map((d, i) => ({ ...d, i }))
    .filter((d): d is DimScore & { i: number; score: number } => d.score != null);
  const polygon = available
    .map((d) => {
      const p = pointFor(d.i, (d.score / 100) * R);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 420 340" className="w-full max-w-[460px] self-center" role="img" aria-label="Radar de scores por dimensão">
            {/* Anéis de grelha (25/50/75/100) */}
            {[25, 50, 75, 100].map((lvl) => (
              <polygon
                key={lvl}
                points={dims.map((_, i) => { const p = pointFor(i, (lvl / 100) * R); return `${p.x},${p.y}`; }).join(" ")}
                fill="none"
                stroke="#e5eeff"
                strokeWidth={lvl === 100 ? 1.5 : 1}
              />
            ))}
            {/* Eixos + labels */}
            {dims.map((d, i) => {
              const tip = pointFor(i, R);
              const lab = pointFor(i, R + 16);
              const lines = wrapLabel(d.name);
              const anchor = Math.abs(Math.cos(angleFor(i))) < 0.3 ? "middle" : Math.cos(angleFor(i)) > 0 ? "start" : "end";
              const missing = d.score == null;
              // Labels acima do centro crescem para cima para não invadirem o gráfico.
              const sin = Math.sin(angleFor(i));
              const yShift = sin < -0.5 ? -(lines.length - 1) * 12 - 4 : sin > 0.5 ? 8 : -((lines.length - 1) * 12) / 2;
              return (
                <g key={d.id}>
                  <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="#bbd1fd" strokeWidth="1" />
                  <text
                    x={lab.x}
                    y={lab.y + yShift}
                    textAnchor={anchor}
                    fontSize="11"
                    fontWeight="600"
                    fill={missing ? "#9ca6b8" : "#021c51"}
                  >
                    {lines.map((ln, li) => (
                      <tspan key={li} x={lab.x} dy={li === 0 ? 0 : 12}>{ln}</tspan>
                    ))}
                    {missing && <tspan x={lab.x} dy={12} fontWeight="400" fill="#9ca6b8">(sem dados)</tspan>}
                  </text>
                </g>
              );
            })}
            {/* Labels dos anéis */}
            <text x={CX + 4} y={CY - (50 / 100) * R - 2} fontSize="9" fill="#64718b">50</text>
            <text x={CX + 4} y={CY - R - 2} fontSize="9" fill="#64718b">100</text>
      {/* Polígono de scores — expande do centro quando o cartão fica visível */}
      {available.length >= 3 && (
        <polygon
          points={polygon}
          fill="#5f93fc"
          fillOpacity="0.25"
          stroke="#0338a2"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: revealed ? "scale(1)" : "scale(0.4)",
            opacity: revealed ? 1 : 0,
            transition: "transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease-out",
          }}
        />
      )}
      {available.length === 2 && (
        <line
          x1={pointFor(available[0].i, (available[0].score / 100) * R).x}
          y1={pointFor(available[0].i, (available[0].score / 100) * R).y}
          x2={pointFor(available[1].i, (available[1].score / 100) * R).x}
          y2={pointFor(available[1].i, (available[1].score / 100) * R).y}
          stroke="#0338a2"
          strokeWidth="2"
          style={{ opacity: revealed ? 1 : 0, transition: "opacity 600ms ease-out" }}
        />
      )}
      {/* Pontos + valores — aparecem em cascata */}
      {available.map((d, order) => {
        const p = pointFor(d.i, (d.score / 100) * R);
        const labelOut = pointFor(d.i, (d.score / 100) * R + 13);
        return (
          <g
            key={d.id}
            style={{
              opacity: revealed ? 1 : 0,
              transition: "opacity 400ms ease-out",
              transitionDelay: `${300 + order * 80}ms`,
            }}
          >
            <circle cx={p.x} cy={p.y} r="4.5" fill="#0338a2" stroke="#f2f6ff" strokeWidth="1.5">
              <title>{`${d.name}: ${Math.round(d.score)} / 100 (${d.n} respostas)`}</title>
            </circle>
            <text x={labelOut.x} y={labelOut.y + 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="#002b82">
              {Math.round(d.score)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DimensionProfile({ data, selectedChannel }: { data: DashboardData; selectedChannel: string | null }) {
  const dims = useMemo(() => computeScores(data, selectedChannel), [data, selectedChannel]);
  const hasAny = dims.some((d) => d.score != null);

  return (
    <DashboardCard
      title="Perfil por Dimensão"
      subtitle="Score 0–100: indicadores de experiência e conformidade, normalizados e ponderados por respostas"
      help="Cada dimensão agrega os seus indicadores de experiência do utilizador e de conformidade, convertidos para uma escala comum de 0 a 100 (ex.: 4 numa escala de 1–5 equivale a 75). A dimensão Procura mede volumes de atendimento e por isso não tem score."
      className="flex-1 min-w-0"
    >
      {!hasAny ? (
        <div className="h-[340px] flex items-center justify-center">
          <EmptyChartState
            title="Sem dados de score"
            description="Ainda não há medições de experiência ou conformidade para esta entidade."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          <Radar dims={dims} />

          {/* Lista compacta com ligação às páginas de dimensão — sem score (sem dados
              de experiência/conformidade para esta entidade) fica inativa em vez de
              parecer uma ligação normal para uma página sem indicadores relevantes. */}
          <div className="grid grid-cols-2 gap-x-[16px] gap-y-[6px]">
            {dims.map((d) =>
              d.score == null ? (
                <span
                  key={d.id}
                  title={`${d.name}: sem dados`}
                  className="flex items-center justify-between gap-[8px] rounded-[6px] px-[8px] py-[4px] cursor-not-allowed"
                >
                  <span className="text-[13px] text-neutral-400 truncate">{d.name}</span>
                  <span className="text-[13px] font-bold shrink-0 text-neutral-400">—</span>
                </span>
              ) : (
                <Link
                  key={d.id}
                  href={`/prioridades/${d.id}`}
                  className="flex items-center justify-between gap-[8px] rounded-[6px] px-[8px] py-[4px] hover:bg-primary-200/60 transition-colors"
                >
                  <span className="text-[13px] text-primary-900 truncate" title={d.name}>{d.name}</span>
                  <span className="text-[13px] font-bold shrink-0 text-primary-800">
                    {Math.round(d.score)}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
