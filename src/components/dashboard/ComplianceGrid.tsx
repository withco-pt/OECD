"use client";

import { useMemo } from "react";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import DashboardCard from "./DashboardCard";
import EmptyChartState from "@/components/EmptyChartState";
import { type DashboardData } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 7 — Scorecard de conformidade.
   Grelha serviços × critérios de compliance (Sim/Não/sem dados),
   com % de conformidade por serviço. Estado transmitido por
   ícone + cor (nunca só cor).
   ───────────────────────────────────────────────────────────── */

type Cell = boolean | null; // true=Sim, false=Não, null=sem dados

export default function ComplianceGrid({ data }: { data: DashboardData }) {
  const grid = useMemo(() => {
    const priOrder = new Map(data.priorities.map((p) => [p.id, p.displayOrder]));
    const criteria = data.indicators
      .filter((i) => i.typeOfIndicator === "compliance")
      .sort((a, b) => (priOrder.get(a.priorityId ?? "") ?? 99) - (priOrder.get(b.priorityId ?? "") ?? 99));
    if (!criteria.length) return null;

    const compIds = new Set(criteria.map((c) => c.id));
    const compRows = data.rows.filter((r) => compIds.has(r.indicator_id));
    if (!compRows.length) return null;

    // Última medição por (serviço, critério): ordenar por ano/mês e ficar com a mais recente.
    const latest = new Map<string, { value: number; y: number; m: number }>();
    for (const r of compRows) {
      if (r.value == null) continue;
      const key = `${r.service_id}|${r.indicator_id}`;
      const cur = latest.get(key);
      const y = r.year;
      const m = r.month ?? 0;
      if (!cur || y > cur.y || (y === cur.y && m > cur.m)) latest.set(key, { value: r.value, y, m });
    }

    const services = data.services.map((s) => {
      const cells: Cell[] = criteria.map((c) => {
        const e = latest.get(`${s.id}|${c.id}`);
        return e ? e.value >= 50 : null;
      });
      const answered = cells.filter((c) => c != null);
      const pct = answered.length ? Math.round((cells.filter((c) => c === true).length / answered.length) * 100) : null;
      return { id: s.id, name: s.name, cells, pct };
    });
    // Serviços com dados primeiro
    services.sort((a, b) => (b.pct != null ? 1 : 0) - (a.pct != null ? 1 : 0));

    return { criteria, services };
  }, [data]);

  return (
    <DashboardCard
      title="Conformidade por Serviço"
      subtitle="Última avaliação de cada critério de conformidade, por serviço"
      help="Cada coluna é um critério de conformidade da matriz (Ágora Design System, disponibilidade em inglês, interoperabilidade, omnicanalidade, …). Passe o rato sobre C1, C2, … para ver o critério completo."
      className="flex-1 min-w-0"
      revealDelay={120}
    >
      {!grid ? (
        <div className="h-[340px] flex items-center justify-center">
          <EmptyChartState
            title="Sem dados de conformidade"
            description="Ainda não há avaliações de conformidade registadas para os serviços desta entidade."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="text-left font-semibold text-primary-900 px-[8px] py-[6px] border-b-2 border-primary-300">
                    Serviço
                  </th>
                  {grid.criteria.map((c, i) => (
                    <th
                      key={c.id}
                      className="font-semibold text-primary-800 px-[4px] py-[6px] border-b-2 border-primary-300 text-center cursor-help w-[36px]"
                      title={c.description}
                    >
                      C{i + 1}
                    </th>
                  ))}
                  <th className="font-semibold text-primary-900 px-[8px] py-[6px] border-b-2 border-primary-300 text-right w-[52px]">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {grid.services.map((s, si) => (
                  <tr key={s.id} className={si % 2 === 1 ? "bg-primary-50" : ""}>
                    <td className="px-[8px] py-[6px] text-primary-900 border-b border-primary-200 max-w-[220px]">
                      <span className="block truncate" title={s.name}>{s.name}</span>
                    </td>
                    {s.cells.map((cell, ci) => (
                      <td key={ci} className="px-[4px] py-[6px] border-b border-primary-200 text-center">
                        {cell === true && (
                          <AgoraIcon name="check-circle" className="size-[16px] text-success-500 inline-block" aria-label="Sim" />
                        )}
                        {cell === false && (
                          <AgoraIcon name="x-circle" className="size-[16px] text-danger-800 inline-block" aria-label="Não" />
                        )}
                        {cell === null && <span className="text-neutral-400" aria-label="Sem dados">—</span>}
                      </td>
                    ))}
                    <td className="px-[8px] py-[6px] border-b border-primary-200 text-right font-bold text-primary-900">
                      {s.pct != null ? `${s.pct}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legenda de estados + critérios */}
          <div className="flex items-center gap-[16px] text-[12px] text-primary-900">
            <span className="flex items-center gap-[4px]">
              <AgoraIcon name="check-circle" className="size-[14px] text-success-500" /> Conforme
            </span>
            <span className="flex items-center gap-[4px]">
              <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" /> Não conforme
            </span>
            <span className="flex items-center gap-[4px] text-neutral-700">— Sem dados</span>
          </div>
          <details className="text-[12px] text-primary-800">
            <summary className="cursor-pointer font-semibold text-primary-900 hover:underline">
              Ver lista de critérios (C1–C{grid.criteria.length})
            </summary>
            <ol className="mt-[6px] flex flex-col gap-[4px] list-none">
              {grid.criteria.map((c, i) => (
                <li key={c.id} className="leading-[16px]">
                  <span className="font-semibold">C{i + 1}.</span> {c.description}
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </DashboardCard>
  );
}
