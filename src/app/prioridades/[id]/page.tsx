"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { AlertTriangle, Heart, Gauge, AlertCircle, XCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import { priorities, indicators } from "@/data/mock";

const METRICS = [...new Set(indicators.map((i) => i.metric))].sort();

export default function PriorityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [search, setSearch] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  const priority = priorities.find((p) => p.id === id);

  const priorityIndicators = useMemo(
    () => (priority ? indicators.filter((ind) => ind.priority === priority.title) : []),
    [priority]
  );

  const filteredIndicators = useMemo(() => {
    return priorityIndicators.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
  }, [search, selectedMetric, filterMandatory, filterNonCompliance, filterMissingData, filterFavorites, priorityIndicators]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => setter(!val);

  const filters = [
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : ""}`,
      isDropdown: true as const,
      icon: <Gauge className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => setSelectedMetric(v),
    },
    {
      label: "Obrigatórios",
      icon: <AlertCircle className="size-[14px]" />,
      active: filterMandatory,
      onToggle: () => toggle(setFilterMandatory, filterMandatory),
    },
    {
      label: "Incumprimento Legal",
      icon: <XCircle className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => toggle(setFilterNonCompliance, filterNonCompliance),
    },
    {
      label: "Dados Incompletos",
      icon: <AlertTriangle className="size-[14px] text-warning-500" />,
      active: filterMissingData,
      onToggle: () => toggle(setFilterMissingData, filterMissingData),
    },
    {
      label: "Favoritos",
      icon: <Heart className="size-[14px] text-primary-600" />,
      active: filterFavorites,
      onToggle: () => toggle(setFilterFavorites, filterFavorites),
    },
  ];

  if (!priority) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-[18px] text-primary-800">Prioridade não encontrada.</p>
        </div>
      </AppLayout>
    );
  }

  const missingDataCount = priorityIndicators.filter((ind) => ind.missingData).length;

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: "Prioridades Temáticas", href: "/" },
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
            <div className="inline-flex items-center gap-[8px] bg-warning-100 text-warning-700 rounded-full px-[12px] py-[5px] text-[14px] font-medium">
              <AlertTriangle className="size-[16px] text-warning-500" />
              {missingDataCount} Indicadores com Dados Incompletos
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-[32px] relative z-[1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={priority.icon} alt={priority.title} className="w-[100px] h-[100px] opacity-60" />
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
          onSearch={(v) => setSearch(v)}
        />

        <p className="text-[14px] text-primary-600 mt-[24px] mb-[16px]">
          A mostrar {filteredIndicators.length} de {priorityIndicators.length} indicadores
        </p>

        <div className="grid grid-cols-3 gap-[16px]">
          {filteredIndicators.map((indicator) => (
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

        {filteredIndicators.length === 0 && (
          <div className="text-center py-[64px] text-primary-400 text-[16px]">
            Nenhum indicador encontrado.
          </div>
        )}
      </section>
    </AppLayout>
  );
}
