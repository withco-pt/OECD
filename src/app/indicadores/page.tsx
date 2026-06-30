"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import Pagination from "@/components/Pagination";
import { indicators } from "@/data/mock";

const ITEMS_PER_PAGE = 9;

const PRIORITIES = [...new Set(indicators.map((i) => i.priority))].sort();
const METRICS = [...new Set(indicators.map((i) => i.metric))].sort();

export default function IndicadoresPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  const filtered = useMemo(() => {
    return indicators.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedPriority && i.priority !== selectedPriority) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
  }, [search, selectedPriority, selectedMetric, filterMandatory, filterNonCompliance, filterMissingData, filterFavorites]);

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

        <p className="text-[14px] text-primary-600">
          A mostrar {paginatedIndicators.length} de {filtered.length} indicadores
        </p>

        <div className="grid grid-cols-3 gap-[20px]">
          {paginatedIndicators.map((indicator) => (
            <IndicatorCard
              key={indicator.id}
              id={indicator.id}
              name={indicator.name}
              priority={indicator.priority}
              metric={indicator.metric}
              value={indicator.value}
              missingData={indicator.missingData}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </div>
    </AppLayout>
  );
}
