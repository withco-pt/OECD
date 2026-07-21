"use client";

import { useMemo } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { type StrategicData, dimensionScoreMatrix } from "@/lib/strategicData";
import { scoreColor, scoreTextColor } from "./colors";

/* Bloco 1 — Matriz Entidades × Dimensões (heatmap de score 0–100).
   Linhas = dimensões, colunas = entidades. Célula vazia = sem dados. */

/** Sigla a mostrar por entidade (o short "ec" é a ARTE). */
function entityShortLabel(short: string): string {
  return short === "ec" ? "ARTE" : short.toUpperCase();
}

export default function DimensionHeatmap({ data }: { data: StrategicData }) {
  const { matrix, entityAvg } = useMemo(() => {
    const m = dimensionScoreMatrix(data);
    // média por entidade (sobre as dimensões com score)
    const entityAvg = new Map<string, number | null>();
    for (const e of data.entities) {
      let sum = 0;
      let w = 0;
      for (const p of data.priorities) {
        const cell = m.get(`${e.short}::${p.id}`);
        if (cell?.score != null) {
          sum += cell.score * cell.n;
          w += cell.n;
        }
      }
      entityAvg.set(e.short, w > 0 ? sum / w : null);
    }
    return { matrix: m, entityAvg };
  }, [data]);

  const hasAny = [...matrix.values()].some((c) => c.score != null);
  const cols = `minmax(150px, 1.4fr) repeat(${data.entities.length}, minmax(72px, 1fr))`;

  return (
    <DashboardCard
      title="Matriz Entidades × Dimensões"
      subtitle="Score 0–100 por dimensão (experiência e conformidade, normalizado e ponderado por respostas). Célula vazia = sem dados."
      help="Cada célula converte os indicadores de experiência do utilizador e de conformidade dessa dimensão para uma escala comum de 0 a 100 (ex.: 4 numa escala 1–5 = 75) e pondera-os pelo nº de respostas. Dimensões que só medem volumes (ex.: Procura) ou sem dados aparecem a cinzento."
    >
      {!hasAny ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyChartState title="Sem dados" description="Ainda não há medições de experiência ou conformidade nas entidades." />
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              {/* Cabeçalho — entidades */}
              <div className="grid items-end gap-[4px]" style={{ gridTemplateColumns: cols }}>
                <div />
                {data.entities.map((e) => (
                  <div key={e.short} className="flex flex-col items-center gap-[6px] pb-[8px]">
                    <div className="flex items-center justify-center h-[56px] w-[56px] rounded-[12px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
                      {e.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.logo} alt={e.name} title={e.name} className="h-[40px] w-[40px] object-contain" />
                      ) : (
                        <span className="text-[13px] font-bold text-primary-900">{entityShortLabel(e.short)}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-primary-900 uppercase tracking-wide" title={e.name}>
                      {entityShortLabel(e.short)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Linhas — dimensões */}
              <div className="flex flex-col gap-[4px]">
                {data.priorities.map((p) => (
                  <div key={p.id} className="grid items-stretch gap-[4px]" style={{ gridTemplateColumns: cols }}>
                    <div className="flex items-center pr-[8px] text-[13px] text-primary-900 leading-[15px]" title={p.namePt}>
                      {p.namePt}
                    </div>
                    {data.entities.map((e) => {
                      const cell = matrix.get(`${e.short}::${p.id}`);
                      const score = cell?.score ?? null;
                      return (
                        <div
                          key={e.short}
                          className="flex items-center justify-center rounded-[6px] h-[38px] text-[14px] font-bold"
                          style={{ background: scoreColor(score), color: scoreTextColor(score) }}
                          title={
                            score != null
                              ? `${e.name} · ${p.namePt}: ${Math.round(score)}/100 (${cell?.n ?? 0} respostas)`
                              : `${e.name} · ${p.namePt}: sem dados`
                          }
                        >
                          {score != null ? Math.round(score) : "—"}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Rodapé — média por entidade */}
                <div className="grid items-stretch gap-[4px] mt-[4px] pt-[6px] border-t-2 border-primary-300" style={{ gridTemplateColumns: cols }}>
                  <div className="flex items-center pr-[8px] text-[13px] font-bold text-primary-900">Média da entidade</div>
                  {data.entities.map((e) => {
                    const avg = entityAvg.get(e.short) ?? null;
                    return (
                      <div
                        key={e.short}
                        className="flex items-center justify-center rounded-[6px] h-[34px] text-[13px] font-extrabold"
                        style={{ background: scoreColor(avg), color: scoreTextColor(avg) }}
                        title={avg != null ? `${e.name}: média ${Math.round(avg)}/100` : `${e.name}: sem dados`}
                      >
                        {avg != null ? Math.round(avg) : "—"}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
