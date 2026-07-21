"use client";

import { useMemo } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { type StrategicData, maturityByEntity } from "@/lib/strategicData";
import { scoreColor } from "./colors";

/* Bloco 4 — Maturidade da recolha por entidade.
   Sinais que distinguem quem tem uma prática de recolha estabelecida
   (séries mensais, muitos indicadores, várias dimensões) de quem ainda
   está numa recolha pontual e limitada. */

export default function CollectionMaturity({ data }: { data: StrategicData }) {
  const rows = useMemo(() => {
    const mat = maturityByEntity(data);
    const byShort = new Map(mat.map((m) => [m.short, m]));
    const totalDims = data.priorities.length;
    return data.entities.map((e) => ({
      entity: e,
      m: byShort.get(e.short)!,
      totalDims,
    }));
  }, [data]);

  // Cadência dentro do sistema de cor único (azul): sólido = recolha regular,
  // pálido/contornado = recolha pontual (menor maturidade).
  const cadenceBadge = (c: string) => {
    if (c === "mensal") return "bg-primary-800 text-white";
    if (c === "pontual") return "bg-primary-100 text-primary-600 ring-1 ring-inset ring-primary-300";
    return "bg-neutral-100 text-neutral-500";
  };

  return (
    <DashboardCard
      title="Maturidade da Recolha por Entidade"
      subtitle="Regularidade e amplitude da recolha de dados de cada entidade."
      help="Resume a prática de recolha: cadência (recolha mensal vs. pontual), nº de períodos com dados, nº de indicadores reportados e quantas das dimensões da Matriz estão cobertas. Sinaliza quem tem uma recolha madura e quem ainda está a começar."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-primary-700 border-b-2 border-primary-300">
              <th className="py-[8px] pr-[8px] font-semibold">Entidade</th>
              <th className="py-[8px] px-[8px] font-semibold">Cadência</th>
              <th className="py-[8px] px-[8px] font-semibold text-right">Períodos</th>
              <th className="py-[8px] px-[8px] font-semibold text-right">Indicadores</th>
              <th className="py-[8px] px-[8px] font-semibold">Dimensões cobertas</th>
              <th className="py-[8px] pl-[8px] font-semibold">1.º registo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entity, m, totalDims }) => (
              <tr key={entity.short} className="border-b border-primary-200 last:border-0">
                <td className="py-[10px] pr-[8px]">
                  <span className="font-semibold text-primary-900">{entity.name}</span>
                </td>
                <td className="py-[10px] px-[8px]">
                  <span className={`inline-block rounded-full px-[8px] py-[2px] text-[11px] font-bold capitalize ${cadenceBadge(m.cadence)}`}>
                    {m.cadence}
                  </span>
                </td>
                <td className="py-[10px] px-[8px] text-right font-bold text-primary-900">
                  {m.distinctPeriods}
                  {m.monthlyPeriods > 0 && (
                    <span className="text-[11px] font-normal text-primary-600"> ({m.monthlyPeriods} mensais)</span>
                  )}
                </td>
                <td className="py-[10px] px-[8px] text-right font-bold text-primary-900">{m.indicatorsReported}</td>
                <td className="py-[10px] px-[8px]">
                  <span className="flex items-center gap-[8px]">
                    <span className="relative h-[8px] w-[84px] rounded-full bg-primary-200 overflow-hidden shrink-0">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${totalDims ? (m.dimensionsCovered / totalDims) * 100 : 0}%`,
                          background: scoreColor(totalDims ? (m.dimensionsCovered / totalDims) * 100 : 0),
                        }}
                      />
                    </span>
                    <span className="text-[12px] font-semibold text-primary-800">
                      {m.dimensionsCovered}/{totalDims}
                    </span>
                  </span>
                </td>
                <td className="py-[10px] pl-[8px] text-primary-800">{m.firstPeriod ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
