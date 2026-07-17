"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { useSelectedChannel } from "@/context/SelectedChannelContext";
import { aggregateValue, pickCategoryCounts, hasCategoryData, rowsForChannel, type MeasRow } from "@/lib/measurements";
import { indicatorTypeLabel, INDICATOR_TYPE_OPTIONS } from "@/lib/metricPill";

type PriorityMeta = { id: string; title: string; description: string; icon: string | null };
type IndicatorItem = {
  id: string;
  name: string;
  priority: string;
  metric: string;
  valueType: string | null;
  value: number | null;
  scaleMax: number | null;
  categoryCounts: Record<string, number> | null;
  missingData: boolean;
  nonCompliance: boolean;
  mandatory: boolean;
  typeLabel: string | null;
};

export default function PriorityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedService } = useSelectedService();
  const { selectedChannel } = useSelectedChannel();

  const [priority, setPriority] = useState<PriorityMeta | null>(null);
  const [items, setItems] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [sortOrder, setSortOrder] = useState("Alfabeticamente");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setNotFound(false); setLoadError(false);

      const { data: pri, error: priErr } = await supabase
        .from("thematic_priorities")
        .select("id, name_pt, description, icon_name")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (priErr) { console.error("[prioridade] erro:", priErr.message); setLoadError(true); setLoading(false); return; }
      if (!pri) { setNotFound(true); setLoading(false); return; }
      setPriority({
        id: pri.id as string,
        title: pri.name_pt as string,
        description: (pri.description as string) ?? "",
        icon: pri.icon_name ? `/icons/${pri.icon_name}` : null,
      });

      // Todos os indicadores desta dimensão (catálogo)
      const { data: inds, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, type_of_indicator, value_scale_max, escala_descricao")
        .eq("thematic_priority_id", id)
        .order("description");
      if (!active) return;
      if (indErr) { console.error("[prioridade] erro:", indErr.message); setLoadError(true); setLoading(false); return; }

      const ids = (inds ?? []).map((i) => i.id as string);

      // Medições do serviço ativo, fatiadas pelo canal escolhido na dropdown global
      // (interseção serviço + canal; canal null = todos os canais, comportamento de sempre).
      const byIndicator = new Map<string, MeasRow[]>();
      if (selectedService && ids.length) {
        const { data: meas } = await supabase
          .from("measurements_catalog")
          .select("indicator_id, channel, geo_level, value, category_counts")
          .eq("service_id", selectedService.id)
          .in("indicator_id", ids);
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

      const list: IndicatorItem[] = (inds ?? []).map((i) => {
        const rows = rowsForChannel(byIndicator.get(i.id as string) ?? [], selectedChannel);
        const value = aggregateValue(rows);
        const categoryCounts = pickCategoryCounts(rows);
        const typeOfIndicator = (i.type_of_indicator as string | null) ?? null;
        return {
          id: i.id as string,
          name: i.description as string,
          priority: (pri.name_pt as string) ?? "",
          metric: (i.escala_descricao as string) ?? "—",
          valueType: (i.value_type as string) ?? null,
          value,
          scaleMax: (i.value_scale_max as number | null) ?? null,
          categoryCounts,
          missingData: value === null && !hasCategoryData(categoryCounts), // sem dados para o serviço/canal ativo
          nonCompliance: typeOfIndicator === "compliance" && value !== null && value < 50,
          mandatory: Boolean(i.is_mandatory),
          typeLabel: indicatorTypeLabel(typeOfIndicator),
        };
      });
      // Indicadores não-obrigatórios só fazem sentido com dados reais para o serviço/canal
      // em análise (alguns descrevem um único procedimento de uma entidade específica e
      // não devem aparecer nos serviços de outras entidades). Os obrigatórios continuam
      // sempre visíveis, mesmo sem dados, para sinalizar "Dados Incompletos"/"Fora da Matriz".
      const relevant = list.filter((i) => i.mandatory || !i.missingData);
      relevant.sort((a, b) => a.name.localeCompare(b.name));
      setItems(relevant);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, selectedService, selectedChannel]);

  const METRICS = useMemo(() => [...new Set(items.map((i) => i.metric))].sort(), [items]);

  const filteredIndicators = useMemo(() => {
    const result = items.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (selectedType && i.typeLabel !== selectedType) return false;
      if (filterMandatory && !i.mandatory) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
    // Ordenação por valor — indicadores sem valor (dados incompletos) ficam sempre no fim.
    if (sortOrder === "Valor: maior → menor" || sortOrder === "Valor: menor → maior") {
      const dir = sortOrder === "Valor: maior → menor" ? -1 : 1;
      return [...result].sort((a, b) => {
        if (a.value == null && b.value == null) return 0;
        if (a.value == null) return 1;
        if (b.value == null) return -1;
        return (a.value - b.value) * dir;
      });
    }
    return result;
  }, [items, search, selectedMetric, selectedType, filterMandatory, filterNonCompliance, filterMissingData, sortOrder]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => setter(!val);

  const filters = [
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="bar-chart" className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => setSelectedMetric(v),
    },
    {
      label: `Tipo de Indicador${selectedType ? ` (${selectedType})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="list" className="size-[14px]" />,
      value: selectedType,
      options: INDICATOR_TYPE_OPTIONS,
      onChange: (v: string) => setSelectedType(v),
    },
    {
      label: "Indicador da Matriz",
      icon: <AgoraIcon name="alert-circle" className="size-[14px]" />,
      active: filterMandatory,
      onToggle: () => toggle(setFilterMandatory, filterMandatory),
    },
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => toggle(setFilterNonCompliance, filterNonCompliance),
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      onToggle: () => toggle(setFilterMissingData, filterMissingData),
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[400px] text-primary-400 text-[16px]">A carregar dimensão…</div>
      </AppLayout>
    );
  }
  if (loadError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-[8px] justify-center h-[400px] text-danger-800">
          <AgoraIcon name="alert-triangle" className="size-[24px]" />
          <p className="text-[16px] font-semibold">Não foi possível carregar a dimensão.</p>
        </div>
      </AppLayout>
    );
  }
  if (notFound || !priority) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-[18px] text-primary-800">Dimensão não encontrada.</p>
        </div>
      </AppLayout>
    );
  }

  const missingDataCount = items.filter((i) => i.missingData).length;

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: "Dimensões", href: "/" },
          { label: priority.title },
        ]}
      />

      <div
        className="rounded-[10px] p-[18px] mb-[32px] flex items-start justify-between relative overflow-hidden"
        style={{ backgroundImage: "linear-gradient(144deg, #D6E3FF 0%, #E5EEFF 100%)" }}
      >
        <div className="flex-1 relative z-[1]">
          <h1 className="text-[32px] font-bold text-primary-900 leading-[48px] mb-[8px]">
            {priority.title}
          </h1>
          <p className="text-[16px] leading-[23px] text-primary-900 mb-[16px] max-w-[600px]">
            {priority.description}
          </p>
          {missingDataCount > 0 && (
            <div className="inline-flex items-center gap-[8px] bg-warning-100 text-warning-900 rounded-full px-[12px] py-[5px] text-[14px] font-medium">
              <AgoraIcon name="alert-triangle" className="size-[16px] text-warning-900" />
              {missingDataCount} {missingDataCount === 1 ? "Indicador" : "Indicadores"} com Dados Incompletos
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-[32px] relative z-[1]">
          {priority.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={priority.icon} alt={priority.title} className="w-[100px] h-[100px] opacity-60" />
          ) : (
            <svg width={100} height={100} viewBox="0 0 24 24" fill="none" role="img" aria-label={priority.title} className="opacity-60">
              <rect x="3" y="13" width="4" height="8" rx="1" fill="rgb(3,74,216)" />
              <rect x="10" y="8" width="4" height="13" rx="1" fill="rgb(3,74,216)" />
              <rect x="17" y="3" width="4" height="18" rx="1" fill="rgb(3,74,216)" />
            </svg>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-[24px] font-bold text-primary-900 mb-[24px]">
          Indicadores de {priority.title}
        </h2>

        <SearchAndFilters
          searchLabel="Pesquisar indicador"
          searchPlaceholder="Nome do indicador..."
          filters={filters}
          orderOptions={["Valor: maior → menor", "Valor: menor → maior"]}
          orderValue={sortOrder}
          onOrderChange={setSortOrder}
          onSearch={(v) => setSearch(v)}
        />

        <p className="text-[14px] text-primary-600 mt-[24px] mb-[16px]">
          A mostrar {filteredIndicators.length} de {items.length} indicadores
          {selectedService && (
            <> · serviço: <span className="font-semibold">{selectedService.name}</span></>
          )}
          {selectedChannel && (
            <> · canal: <span className="font-semibold">{selectedChannel}</span></>
          )}
        </p>

        <div className="grid grid-cols-3 gap-[16px]">
          {filteredIndicators.map((indicator) => (
            <IndicatorCard
              key={indicator.id}
              id={indicator.id}
              name={indicator.name}
              priority={indicator.priority}
              metric={indicator.metric}
              valueType={indicator.valueType}
              value={indicator.value}
              scaleMax={indicator.scaleMax}
              categoryCounts={indicator.categoryCounts}
              missingData={indicator.missingData}
              nonCompliance={indicator.nonCompliance}
              mandatory={indicator.mandatory}
            />
          ))}
        </div>

        {filteredIndicators.length === 0 && (
          <div className="text-center py-[64px] text-primary-400 text-[16px]">
            Nenhum indicador encontrado.
          </div>
        )}
      </section>
    </AppLayout>
  );
}
