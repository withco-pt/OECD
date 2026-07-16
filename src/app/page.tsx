"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import ThematicPriorityCard, { type DimensionCounts } from "@/components/ThematicPriorityCard";
import HelpTooltip from "@/components/HelpTooltip";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { aggregateValue, pickCategoryCounts, type MeasRow } from "@/lib/measurements";

type PriorityRow = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  counts: DimensionCounts;
  hasData: boolean;
};

function PriorityIcon({ src, alt, size = 50 }: { src: string | null; alt: string; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={size} height={size} />;
  }
  // Fallback para prioridades sem ícone dedicado (ex.: "Procura") — glifo genérico.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label={alt}>
      <rect x="3" y="13" width="4" height="8" rx="1" fill="#B0C8F5" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="#B0C8F5" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#B0C8F5" />
    </svg>
  );
}

export default function PrioridadesTematicas() {
  const { selectedService } = useSelectedService();
  const [priorityData, setPriorityData] = useState<PriorityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);

      const { data: priorities, error: priErr } = await supabase
        .from("thematic_priorities")
        .select("id, name_pt, description, icon_name, display_order")
        .order("display_order");
      if (!active) return;
      if (priErr || !priorities) {
        console.error("[prioridades] erro ao carregar:", priErr?.message);
        setLoadError(true);
        setLoading(false);
        return;
      }

      const { data: indicators, error: indErr } = await supabase
        .from("indicators")
        .select("id, thematic_priority_id, type_of_indicator, target_value, target_direction, is_mandatory");
      if (!active) return;
      if (indErr || !indicators) {
        console.error("[prioridades] erro ao carregar indicadores:", indErr?.message);
        setLoadError(true);
        setLoading(false);
        return;
      }

      const indicatorIds = indicators.map((i) => i.id as string);
      const byIndicator = new Map<string, MeasRow[]>();
      if (selectedService && indicatorIds.length) {
        const { data: meas } = await supabase
          .from("measurements_catalog")
          .select("indicator_id, channel, geo_level, value, category_counts")
          .eq("service_id", selectedService.id)
          .in("indicator_id", indicatorIds);
        if (!active) return;
        for (const m of meas ?? []) {
          const key = m.indicator_id as string;
          if (!byIndicator.has(key)) byIndicator.set(key, []);
          byIndicator.get(key)!.push({
            channel: (m.channel as string | null) ?? null,
            geo_level: (m.geo_level as string | null) ?? null,
            value: m.value as number | string | null,
            category_counts: (m.category_counts as Record<string, number> | null) ?? null,
          });
        }
      }

      const countsByPriority = new Map<string, DimensionCounts>();
      // Nº de indicadores que realmente aparecem na página desta dimensão para o
      // serviço selecionado (obrigatórios sempre + não-obrigatórios só com dados reais
      // — mesmo critério de "relevant" usado em /prioridades/[id]). Uma dimensão com 0
      // indicadores obrigatórios (ex.: "Procura") pode ficar com a lista completamente
      // vazia para um serviço sem dados; nesse caso o card deve aparecer inativo em vez
      // de convidar a um clique que leva a uma página sem nada.
      const visibleByPriority = new Map<string, number>();
      for (const i of indicators) {
        const priorityId = i.thematic_priority_id as string;
        if (!countsByPriority.has(priorityId)) {
          countsByPriority.set(priorityId, {
            missingData: 0,
            nonCompliance: 0,
            underperformingOperational: 0,
            underperformingUx: 0,
          });
        }
        const counts = countsByPriority.get(priorityId)!;

        const rows = byIndicator.get(i.id as string) ?? [];
        const value = aggregateValue(rows);
        const categoryCounts = pickCategoryCounts(rows);
        const type = i.type_of_indicator as string | null;
        const hasData = value !== null || categoryCounts !== null;

        if (i.is_mandatory || hasData) {
          visibleByPriority.set(priorityId, (visibleByPriority.get(priorityId) ?? 0) + 1);
        }

        if (!hasData) {
          // Indicadores não-obrigatórios sem dados para este serviço não entram na
          // contagem — vários descrevem um único procedimento de uma entidade
          // específica e nunca terão dados nos serviços de outras entidades.
          if (i.is_mandatory) counts.missingData += 1;
          continue;
        }

        if (type === "compliance" && value !== null && value < 50) {
          counts.nonCompliance += 1;
        }

        const targetValue = i.target_value as number | null;
        const targetDirection = i.target_direction as "above" | "below" | null;
        if (value !== null && targetValue !== null && targetDirection) {
          const underperforming =
            targetDirection === "above" ? value < targetValue : value > targetValue;
          if (underperforming) {
            if (type === "operational") counts.underperformingOperational += 1;
            if (type === "user_experience") counts.underperformingUx += 1;
          }
        }
      }

      setPriorityData(
        priorities.map((p) => ({
          id: p.id as string,
          title: p.name_pt as string,
          description: (p.description as string) ?? "",
          icon: p.icon_name ? `/icons/${p.icon_name}` : null,
          counts: countsByPriority.get(p.id as string) ?? {
            missingData: 0,
            nonCompliance: 0,
            underperformingOperational: 0,
            underperformingUx: 0,
          },
          hasData: (visibleByPriority.get(p.id as string) ?? 0) > 0,
        }))
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [selectedService]);

  const featured = priorityData[0];
  const rest = priorityData.slice(1);

  return (
    <AppLayout>
      <div className="flex gap-[16px] items-center">
        <h1 className="font-bold text-[40px] leading-[55px] text-primary-900">
          Dimensões
        </h1>
        <div className="mt-[11px]"><HelpTooltip size={30} label="As Dimensões são as áreas prioritárias a que os serviços públicos devem responder. Cada uma agrega um conjunto de indicadores." /></div>
      </div>

      <p className="text-[16px] leading-[23px] text-primary-900 mt-[8px] max-w-[742px]">
        Explore as categorias de indicadores abaixo que ajudam a identificar
        desafios para o serviço.
      </p>

      {loading ? (
        <div className="mt-[32px] text-center py-[48px] text-primary-400 text-[16px]">A carregar dimensões…</div>
      ) : loadError || priorityData.length === 0 ? (
        <div className="mt-[32px] text-center py-[48px] text-primary-400 text-[16px]">
          Não foi possível carregar as dimensões.
        </div>
      ) : (
        <div className="mt-[16px] flex flex-col gap-[32px]">
          <ThematicPriorityCard
            title={featured.title}
            description={featured.description}
            icon={<PriorityIcon src={featured.icon} alt={featured.title} size={85} />}
            variant="large"
            counts={featured.counts}
            href={`/prioridades/${featured.id}`}
            disabled={!featured.hasData}
          />

          <div className="grid grid-cols-3 gap-[32px]">
            {rest.map((p) => (
              <ThematicPriorityCard
                key={p.id}
                title={p.title}
                description={p.description}
                icon={<PriorityIcon src={p.icon} alt={p.title} />}
                counts={p.counts}
                href={`/prioridades/${p.id}`}
                disabled={!p.hasData}
              />
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
