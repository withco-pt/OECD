"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";

const ITEMS_PER_PAGE = 9;

type MeasRow = { channel: string | null; value: number | string | null; category_counts: Record<string, number> | null };

type IndicatorItem = {
  id: string;
  name: string;
  priority: string;
  priorityOrder: number;
  metric: string;
  valueType: string | null;
  value: number | null;
  scaleMax: number | null;
  categoryCounts: Record<string, number> | null;
  missingData: boolean;
  nonCompliance: boolean;
  mandatory: boolean;
};

function aggregateValue(rows: MeasRow[]): number | null {
  const nullRow = rows.find((r) => r.channel === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source.map((r) => Number(r.value)).filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

// Contagens categóricas: preferir a linha sem canal (agregado do serviço).
function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.category_counts) ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

export default function IndicadoresPage() {
  const { selectedService } = useSelectedService();

  const [items, setItems] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Catálogo completo de indicadores + valores para o serviço ativo.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setLoadError(false);
      const { data: inds, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, value_scale_max, escala_descricao, thematic_priorities(name_pt, display_order)");
      if (!active) return;
      if (indErr) { console.error("[indicadores] erro:", indErr.message); setLoadError(true); setItems([]); setLoading(false); return; }

      const byIndicator = new Map<string, MeasRow[]>();
      if (selectedService) {
        const { data: meas } = await supabase
          .from("measurements_catalog")
          .select("indicator_id, channel, value, category_counts")
          .eq("service_id", selectedService.id);
        if (!active) return;
        for (const m of meas ?? []) {
          const key = m.indicator_id as string;
          if (!byIndicator.has(key)) byIndicator.set(key, []);
          byIndicator.get(key)!.push({
            channel: (m.channel as string | null) ?? null,
            value: m.value as number | string | null,
            category_counts: (m.category_counts as Record<string, number> | null) ?? null,
          });
        }
      }

      const list: IndicatorItem[] = (inds ?? []).map((i) => {
        const tp = (i.thematic_priorities ?? {}) as { name_pt?: string; display_order?: number };
        const rows = byIndicator.get(i.id as string) ?? [];
        const value = aggregateValue(rows);
        const categoryCounts = pickCategoryCounts(rows);
        const hasData = value !== null || categoryCounts !== null;
        return {
          id: i.id as string,
          name: i.description as string,
          priority: tp.name_pt ?? "—",
          priorityOrder: tp.display_order ?? 99,
          metric: (i.escala_descricao as string) ?? "—",
          valueType: (i.value_type as string) ?? null,
          value,
          scaleMax: (i.value_scale_max as number | null) ?? null,
          categoryCounts,
          missingData: !hasData,
          nonCompliance: false,
          mandatory: Boolean(i.is_mandatory),
        };
      });
      list.sort((a, b) => a.priorityOrder - b.priorityOrder || a.name.localeCompare(b.name));
      setItems(list);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [selectedService]);

  const PRIORITIES = useMemo(() => [...new Set(items.map((i) => i.priority))].sort(), [items]);
  const METRICS = useMemo(() => [...new Set(items.map((i) => i.metric))].sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedPriority && i.priority !== selectedPriority) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (filterMandatory && !i.mandatory) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
  }, [items, search, selectedPriority, selectedMetric, filterMandatory, filterNonCompliance, filterMissingData]);

  const handleSearch = (value: string) => { setSearch(value); setCurrentPage(1); };
  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    setter(!val); setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIndicators = filtered.slice(start, start + ITEMS_PER_PAGE);

  const filters = [
    {
      label: `Prioridades Temáticas${selectedPriority ? ` (${selectedPriority})` : " (0)"}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="layers-menu" className="size-[14px]" />,
      value: selectedPriority,
      options: PRIORITIES,
      onChange: (v: string) => { setSelectedPriority(v); setCurrentPage(1); },
    },
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : " (0)"}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="bar-chart" className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => { setSelectedMetric(v); setCurrentPage(1); },
    },
    {
      label: "Obrigatórios",
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
    {
      label: "Favoritos",
      icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />,
      active: filterFavorites,
      onToggle: () => toggle(setFilterFavorites, filterFavorites),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h1 className="text-[40px] font-bold text-primary-900">Indicadores</h1>
          <HelpTooltip size={24} label="Os Indicadores permitem medir o desempenho dos serviços públicos. Baseiam-se em normas legais, padrões de qualidade e boas práticas" />
        </div>

        <SearchAndFilters
          searchLabel="Procurar Indicadores"
          searchPlaceholder="Procure um indicador pelo nome"
          filters={filters}
          onSearch={handleSearch}
          onClearFilters={() => { setSelectedPriority(""); setSelectedMetric(""); setFilterMandatory(false); setFilterNonCompliance(false); setFilterMissingData(false); setFilterFavorites(false); setCurrentPage(1); }}
        />

        {loading ? (
          <div className="text-center py-[64px] text-primary-400 text-[16px]">A carregar indicadores…</div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-[8px] py-[64px] text-danger-800">
            <AgoraIcon name="alert-triangle" className="size-[24px]" />
            <span className="text-[16px] font-semibold">Não foi possível carregar os indicadores.</span>
          </div>
        ) : (
          <>
            <p className="text-[14px] text-primary-600">
              A mostrar {paginatedIndicators.length} de {filtered.length} indicadores
              {selectedService && <> · serviço: <span className="font-semibold">{selectedService.name}</span></>}
            </p>

            <div className="grid grid-cols-3 gap-[20px]">
              {paginatedIndicators.map((indicator) => (
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
              {paginatedIndicators.length === 0 && (
                <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
                  Nenhum indicador encontrado.
                </div>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
