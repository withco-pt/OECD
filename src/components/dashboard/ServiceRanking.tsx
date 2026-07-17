"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { useRevealed } from "./Reveal";
import { type DashboardData, isAggRow, wavg } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 3 — Ranking de serviços por satisfação global (1–10).
   Serviços com menos de 5 respostas ficam num grupo separado
   ("amostra reduzida") para não distorcerem o ranking. Os
   últimos 3 do ranking principal são assinalados como "a
   precisar de atenção". Cada linha liga ao detalhe do serviço.
   ───────────────────────────────────────────────────────────── */

const MIN_SAMPLE = 5;

type Ranked = { id: string; name: string; csat: number; n: number };

function Row({
  service,
  index,
  attention,
  muted,
  order = 0,
}: {
  service: Ranked;
  index: number | null;
  attention: boolean;
  muted?: boolean;
  /** Posição na lista — usada para o stagger da animação da barra. */
  order?: number;
}) {
  const revealed = useRevealed();
  return (
    <Link
      href={`/catalogo/${service.id}`}
      className={`flex items-center gap-[10px] rounded-[6px] px-[8px] py-[5px] transition-colors ${
        attention ? "bg-warning-50 hover:bg-warning-100" : "hover:bg-primary-200/60"
      }`}
    >
      <span className="text-[12px] font-semibold text-primary-700 w-[18px] shrink-0 text-right">
        {index != null ? `${index}.` : ""}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
        <div className="flex items-center gap-[6px] min-w-0">
          {attention && <AgoraIcon name="alert-triangle" className="size-[13px] text-warning-900 shrink-0" />}
          <span className="text-[13px] text-primary-900 truncate leading-[16px]" title={service.name}>
            {service.name}
          </span>
        </div>
        <div className="h-[8px] bg-primary-200 rounded-[4px] overflow-hidden">
          <div
            className={`h-full rounded-[4px] transition-[width] duration-700 ease-out motion-reduce:transition-none ${muted ? "bg-primary-400" : "bg-primary-600"}`}
            style={{
              width: revealed ? `${Math.max(3, ((service.csat - 1) / 9) * 100)}%` : "0%",
              transitionDelay: `${Math.min(order, 10) * 50}ms`,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 w-[64px]">
        <span className={`text-[15px] font-bold leading-[18px] ${muted ? "text-primary-700" : "text-primary-900"}`}>
          {service.csat.toFixed(1)}
        </span>
        <span className="text-[11px] text-primary-700 leading-[13px]">{service.n} resp.</span>
      </div>
    </Link>
  );
}

export default function ServiceRanking({ data, selectedChannel }: { data: DashboardData; selectedChannel: string | null }) {
  const { ranked, lowSample, semDados } = useMemo(() => {
    const csatInd = data.indicators.find((i) => i.etlKey === "ux_csat");
    const all: Ranked[] = [];
    const semDados: { id: string; name: string }[] = [];
    for (const s of data.services) {
      const rows = csatInd
        ? data.rows.filter((r) => r.service_id === s.id && r.indicator_id === csatInd.id && isAggRow(r, selectedChannel))
        : [];
      const agg = wavg(rows);
      if (agg) all.push({ id: s.id, name: s.name, csat: agg.avg, n: agg.n });
      else semDados.push({ id: s.id, name: s.name });
    }
    all.sort((a, b) => b.csat - a.csat);
    return {
      ranked: all.filter((s) => s.n >= MIN_SAMPLE),
      lowSample: all.filter((s) => s.n < MIN_SAMPLE),
      semDados,
    };
  }, [data, selectedChannel]);

  const attentionFrom = ranked.length > 5 ? ranked.length - 3 : ranked.length;

  return (
    <DashboardCard
      title="Satisfação por Serviço"
      subtitle="Satisfação global média (1–10) por serviço, ordenada do melhor para o pior"
      help={`Média ponderada das respostas à pergunta de satisfação global do questionário (escala de 1 a 10), por serviço. Serviços com menos de ${MIN_SAMPLE} respostas aparecem à parte, porque a média de amostras tão pequenas não é comparável. Os últimos lugares do ranking indicam onde atuar primeiro.`}
      className="flex-1 min-w-0"
      revealDelay={120}
    >
      {!ranked.length && !lowSample.length ? (
        <div className="h-[340px] flex items-center justify-center">
          <EmptyChartState
            title="Sem dados de satisfação"
            description="Ainda não há respostas ao questionário de satisfação para os serviços desta entidade."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[6px] max-h-[400px] overflow-y-auto pr-[4px]">
            {ranked.map((s, i) => (
              <Row key={s.id} service={s} index={i + 1} attention={i >= attentionFrom} order={i} />
            ))}
            {!ranked.length && (
              <p className="text-[13px] text-neutral-700 px-[8px] py-[4px]">
                Nenhum serviço tem ainda {MIN_SAMPLE} ou mais respostas — ranking disponível abaixo, a título indicativo.
              </p>
            )}

            {lowSample.length > 0 && (
              <>
                <p className="text-[12px] font-semibold text-neutral-700 mt-[8px] px-[8px]">
                  Amostra reduzida (menos de {MIN_SAMPLE} respostas)
                </p>
                {lowSample.map((s, i) => (
                  <Row key={s.id} service={s} index={null} attention={false} muted order={ranked.length + i} />
                ))}
              </>
            )}
          </div>

          {ranked.length > 5 && (
            <p className="text-[12px] text-primary-700 flex items-center gap-[6px]">
              <AgoraIcon name="alert-triangle" className="size-[13px] text-warning-900" />
              Últimos 3 lugares do ranking — candidatos a intervenção prioritária.
            </p>
          )}

          {semDados.length > 0 && (
            <p className="text-[12px] text-neutral-700">
              Sem dados de satisfação: {semDados.length} serviço{semDados.length === 1 ? "" : "s"}{" "}
              <span title={semDados.map((s) => s.name).join(" · ")} className="underline decoration-dotted cursor-help">
                (ver quais)
              </span>
            </p>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
