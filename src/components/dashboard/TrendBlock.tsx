"use client";

import { useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { useRevealed } from "./Reveal";
import { type DashboardData, isAggRow, MONTHS_PT } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 5 — Evolução temporal dos indicadores operacionais.
   Série mensal agregada entre serviços: somada para contagens
   ("Número de…"), média para tempos/rácios. Só aparecem
   indicadores com pelo menos 3 meses de dados.
   ───────────────────────────────────────────────────────────── */

type SeriesPoint = { year: number; month: number; value: number };
type Series = { indicatorId: string; label: string; isSum: boolean; points: SeriesPoint[] };

function computeSeries(data: DashboardData, channel: string | null): Series[] {
  const out: Series[] = [];
  for (const ind of data.indicators.filter((i) => i.typeOfIndicator === "operational")) {
    const rows = data.rows.filter((r) => r.indicator_id === ind.id && isAggRow(r, channel) && r.month != null && r.value != null);
    if (!rows.length) continue;
    const isSum = /^(número|nº|n\.?º)/i.test(ind.description.trim());
    const byMonth = new Map<string, { year: number; month: number; sum: number; count: number }>();
    for (const r of rows) {
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      if (!byMonth.has(key)) byMonth.set(key, { year: r.year, month: r.month as number, sum: 0, count: 0 });
      const e = byMonth.get(key)!;
      e.sum += r.value as number;
      e.count += 1;
    }
    const points = [...byMonth.values()]
      .map((e) => ({ year: e.year, month: e.month, value: isSum ? e.sum : e.sum / e.count }))
      .sort((a, b) => a.year - b.year || a.month - b.month);
    if (points.length >= 3) out.push({ indicatorId: ind.id, label: ind.description, isSum, points });
  }
  // Séries mais longas primeiro — a primeira é a pré-selecionada.
  out.sort((a, b) => b.points.length - a.points.length);
  return out;
}

function niceCeil(n: number): number {
  if (n <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / mag) * mag;
}

function formatValue(v: number): string {
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

function LineChart({ points }: { points: SeriesPoint[] }) {
  const revealed = useRevealed();
  const W = 680;
  const H = 260;
  const padL = 48;
  const padR = 20;
  const padT = 24;
  const padB = 36;
  const max = niceCeil(Math.max(...points.map((p) => p.value)));
  const xFor = (i: number) => padL + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - padL - padR));
  const yFor = (v: number) => H - padB - (v / max) * (H - padT - padB);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.value).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);
  // Labels diretos seletivos: todos se poucos pontos; senão primeiro, último e máximo.
  const maxIdx = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const showLabel = (i: number) => points.length <= 8 || i === 0 || i === points.length - 1 || i === maxIdx;
  // Labels do eixo X: salta meses quando são muitos.
  const xStep = Math.ceil(points.length / 12);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Evolução mensal do indicador">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#e5eeff" strokeWidth="1" />
          <text x={padL - 8} y={yFor(t) + 4} textAnchor="end" fontSize="11" fill="#002b82">{formatValue(t)}</text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#bbd1fd" strokeWidth="1.5" />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#bbd1fd" strokeWidth="1.5" />
      {points.map((p, i) =>
        i % xStep === 0 || i === points.length - 1 ? (
          <text key={i} x={xFor(i)} y={H - padB + 18} textAnchor="middle" fontSize="11" fill="#021c51">
            {MONTHS_PT[p.month - 1]} {String(p.year).slice(2)}
          </text>
        ) : null
      )}
      {/* Linha desenhada da esquerda para a direita quando o cartão fica visível */}
      <path
        d={path}
        fill="none"
        stroke="#0338a2"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: revealed ? 0 : 1,
          transition: "stroke-dashoffset 1100ms ease-in-out",
        }}
      />
      {points.map((p, i) => (
        <g
          key={i}
          style={{
            opacity: revealed ? 1 : 0,
            transition: "opacity 300ms ease-out",
            transitionDelay: `${(i / points.length) * 1100}ms`,
          }}
        >
          <circle cx={xFor(i)} cy={yFor(p.value)} r="4" fill="#0338a2" stroke="#f2f6ff" strokeWidth="1.5">
            <title>{`${MONTHS_PT[p.month - 1]} ${p.year}: ${formatValue(p.value)}`}</title>
          </circle>
          {showLabel(i) && (
            <text x={xFor(i)} y={yFor(p.value) - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#002b82">
              {formatValue(p.value)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function TrendBlock({ data, selectedChannel }: { data: DashboardData; selectedChannel: string | null }) {
  const series = useMemo(() => computeSeries(data, selectedChannel), [data, selectedChannel]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current = series.find((s) => s.indicatorId === selectedId) ?? series[0];

  return (
    <DashboardCard
      title="Evolução Mensal — Indicadores Operacionais"
      subtitle={current ? (current.isSum ? "Total mensal, somado entre serviços" : "Média mensal entre serviços") : undefined}
      help="Séries mensais dos indicadores operacionais da entidade (procura, atendimentos, tempos de resposta). Contagens são somadas entre serviços; tempos e rácios são médias."
    >
      {!series.length ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyChartState
            title="Sem séries mensais"
            description="Esta entidade ainda não tem indicadores operacionais com dados mensais suficientes (mínimo 3 meses)."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[4px] max-w-[680px]">
            <label htmlFor="trend-indicator" className="text-[14px] font-medium text-primary-800">
              Indicador
            </label>
            <div className="relative">
              <select
                id="trend-indicator"
                value={current.indicatorId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none bg-primary-200 rounded-[8px] px-[12px] py-[8px] pr-[36px] text-[14px] font-medium text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
              >
                {series.map((s) => (
                  <option key={s.indicatorId} value={s.indicatorId}>
                    {s.label.length > 90 ? s.label.slice(0, 90) + "…" : s.label}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 20 20" className="size-[16px] absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none">
                <path d="M5 7.5 10 12.5 15 7.5" stroke="#002b82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <LineChart points={current.points} />
        </div>
      )}
    </DashboardCard>
  );
}
