"use client";

import { useMemo } from "react";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { useRevealed } from "./Reveal";
import { type DashboardData, type MeasurementRow, wavg } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 4 — Canais de atendimento.
   Volume: nº de respondentes que avaliaram cada canal (pergunta
   "facilidade de utilização deste canal" — é a única com
   contagens reais por canal).
   Avaliação: satisfação global (1–10) por canal quando existe;
   senão, a própria facilidade de utilização (1–5).
   ───────────────────────────────────────────────────────────── */

type VolumeStat = { channel: string; volume: number };
type RatingStat = { channel: string; rating: number };

type ChannelView = {
  volumes: VolumeStat[] | null;
  ratings: RatingStat[];
  scaleMax: number;
  metricLabel: string;
};

function computeChannels(data: DashboardData): ChannelView | null {
  const channelRows = (indId: string | undefined): MeasurementRow[] =>
    indId ? data.rows.filter((r) => r.indicator_id === indId && r.channel !== null && r.geo_name === null) : [];

  const csat = data.indicators.find((i) => i.etlKey === "ux_csat");
  const ease = data.indicators.find((i) => i.etlKey === "ux_channel_ease");
  const easeRows = channelRows(ease?.id);
  const csatRows = channelRows(csat?.id);

  // Volume real por canal: respondentes da pergunta específica do canal.
  let volumes: VolumeStat[] | null = null;
  if (easeRows.length) {
    const byChannel = new Map<string, number>();
    for (const r of easeRows) {
      byChannel.set(r.channel as string, (byChannel.get(r.channel as string) ?? 0) + (r.total_respondentes ?? 0));
    }
    volumes = [...byChannel.entries()]
      .map(([channel, volume]) => ({ channel, volume }))
      .filter((v) => v.volume > 0)
      .sort((a, b) => b.volume - a.volume);
    if (!volumes.length) volumes = null;
  }

  // Avaliação por canal: preferir a satisfação global (1–10); senão facilidade (1–5).
  let ratingRows = csatRows;
  let scaleMax = 10;
  let metricLabel = "Satisfação global (1–10)";
  if (new Set(ratingRows.map((r) => r.channel)).size < 2) {
    ratingRows = easeRows;
    scaleMax = 5;
    metricLabel = "Facilidade de utilização do canal (1–5)";
  }
  const byChannel = new Map<string, MeasurementRow[]>();
  for (const r of ratingRows) {
    const key = r.channel as string;
    if (!byChannel.has(key)) byChannel.set(key, []);
    byChannel.get(key)!.push(r);
  }
  const ratings: RatingStat[] = [...byChannel.entries()]
    .map(([channel, chRows]) => {
      const agg = wavg(chRows);
      return agg ? { channel, rating: agg.avg } : null;
    })
    .filter((r): r is RatingStat => r !== null)
    .sort((a, b) => b.rating - a.rating);

  if (!volumes && !ratings.length) return null;
  return { volumes, ratings, scaleMax, metricLabel };
}

function Bar({ pct, order = 0, className = "bg-primary-600" }: { pct: number; order?: number; className?: string }) {
  const revealed = useRevealed();
  return (
    <div className="h-[10px] bg-primary-200 rounded-[4px] overflow-hidden flex-1">
      <div
        className={`h-full rounded-[4px] transition-[width] duration-700 ease-out motion-reduce:transition-none ${className}`}
        style={{ width: revealed ? `${Math.max(2, pct)}%` : "0%", transitionDelay: `${order * 60}ms` }}
      />
    </div>
  );
}

export default function ChannelBlock({ data }: { data: DashboardData }) {
  const view = useMemo(() => computeChannels(data), [data]);

  return (
    <DashboardCard
      title="Canais de Atendimento"
      subtitle={view ? `Métrica de avaliação: ${view.metricLabel}` : undefined}
      help="Compara os canais de atendimento da entidade: quantos respondentes avaliaram cada canal e qual a avaliação média que lhe deram. Diferenças grandes entre canais são um sinal clássico de oportunidade de inovação."
    >
      {!view ? (
        <div className="h-[220px] flex items-center justify-center">
          <EmptyChartState
            title="Sem dados por canal"
            description="Ainda não há medições segmentadas por canal para esta entidade."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] gap-y-[24px]">
          {/* Volume por canal */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[14px] font-semibold text-primary-900">Respondentes por canal</h3>
            {view.volumes ? (
              (() => {
                const total = view.volumes.reduce((a, s) => a + s.volume, 0) || 1;
                const max = Math.max(...view.volumes.map((s) => s.volume)) || 1;
                return view.volumes.map((s, i) => (
                  <div key={s.channel} className="flex items-center gap-[10px]">
                    <span className="text-[13px] text-primary-900 w-[150px] shrink-0 truncate" title={s.channel}>
                      {s.channel}
                    </span>
                    <Bar pct={(s.volume / max) * 100} order={i} />
                    <span className="text-[13px] font-bold text-primary-900 w-[46px] text-right shrink-0">{s.volume}</span>
                    <span className="text-[12px] text-primary-700 w-[40px] text-right shrink-0">
                      {Math.round((s.volume / total) * 100)}%
                    </span>
                  </div>
                ));
              })()
            ) : (
              <p className="text-[13px] text-neutral-700 py-[8px]">
                Sem contagens de respondentes por canal para esta entidade.
              </p>
            )}
          </div>

          {/* Avaliação por canal */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[14px] font-semibold text-primary-900">Avaliação média por canal</h3>
            {view.ratings.map((s, i) => (
              <div key={s.channel} className="flex items-center gap-[10px]">
                <span className="text-[13px] text-primary-900 w-[150px] shrink-0 truncate" title={s.channel}>
                  {s.channel}
                </span>
                <Bar pct={((s.rating - 1) / (view.scaleMax - 1)) * 100} order={i} className="bg-primary-800" />
                <span className="text-[13px] font-bold text-primary-900 w-[46px] text-right shrink-0">
                  {s.rating.toFixed(1)}
                </span>
                <span className="text-[12px] text-primary-700 w-[40px] text-right shrink-0">/{view.scaleMax}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
