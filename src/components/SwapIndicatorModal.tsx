"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { indicators } from "@/data/mock";
import SearchAndFilters from "@/components/SearchAndFilters";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 9;

const PRIORITIES = [...new Set(indicators.map((i) => i.priority))].sort();
const METRICS = [...new Set(indicators.map((i) => i.metric))].sort();

interface PopupIndicatorCardProps {
  priority: string;
  name: string;
  metric: string;
  value: number | null;
  missingData?: boolean;
  nonCompliance?: boolean;
  onSelect: () => void;
  onDetail: () => void;
}

function PopupIndicatorCard({
  priority,
  name,
  metric,
  value,
  missingData,
  nonCompliance,
  onSelect,
  onDetail,
}: PopupIndicatorCardProps) {
  return (
    <div className="group relative rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[16px] flex flex-col justify-between h-[224px] w-full transition-colors bg-primary-200 hover:bg-[#d6e3ff]">
      <div className="flex flex-col gap-[6px] w-full">
        <div className="flex flex-col gap-[12px]">
          <div className="flex gap-[4px] items-start w-full">
            <div className="flex items-center pt-[3px]">
              <img src="/icons/icon-pt.svg" alt="" className="size-[14px]" />
            </div>
            <span className="text-[14px] font-medium text-primary-700 leading-[20px] flex-1 min-w-0">
              {priority}
            </span>
          </div>
          <h3 className="text-[16px] font-bold text-primary-900 leading-[23px]">
            {name}
          </h3>
        </div>
        <p className="text-[14px] font-medium text-primary-900 leading-[20px]">
          Métrica: {metric}
        </p>
      </div>

      {/* Rodapé: pills de estado (default) / botões (hover) */}
      <div className="relative h-[36px]">
        <div className="absolute inset-0 flex gap-[6px] items-center group-hover:opacity-0 transition-opacity">
          {value !== null && (
            <div className="bg-primary-100 flex gap-[8px] items-center justify-center h-[30px] px-[12px] rounded-full">
              <img src="/icons/icon-score.svg" alt="" className="w-[25px] h-[14px]" />
              <span className="text-[16px] font-bold text-primary-800">{value}</span>
            </div>
          )}
          {nonCompliance && (
            <div className="bg-danger-100 flex items-center p-[5px] rounded-full">
              <AgoraIcon name="x-circle" className="size-[20px] text-danger-800" />
            </div>
          )}
          {missingData && (
            <div className="bg-warning-100 flex items-center p-[5px] rounded-full">
              <AgoraIcon name="alert-triangle" className="size-[20px] text-warning-900" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-stretch gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onSelect}
            className="flex-1 bg-primary-800 hover:bg-primary-900 text-white rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Alterar Indicador
            <AgoraIcon name="refresh-ccw" className="size-[16px]" />
          </button>
          <button
            onClick={onDetail}
            className="flex-1 bg-white border border-primary-800 text-primary-800 hover:bg-primary-100 rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Ver Detalhe
            <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwapIndicatorModal() {
  const { isIndicatorSwapOpen, closeIndicatorSwap } = useSelectedService();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Bloqueia scroll do body e permite fechar com ESC enquanto o popup está aberto.
  useEffect(() => {
    if (!isIndicatorSwapOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeIndicatorSwap();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isIndicatorSwapOpen, closeIndicatorSwap]);

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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleIndicators = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  const handleSelect = (id: string) => {
    closeIndicatorSwap();
    router.push(`/indicadores/${id}`);
  };

  const clearFilters = () => {
    setSelectedPriority("");
    setSelectedMetric("");
    setFilterMandatory(false);
    setFilterNonCompliance(false);
    setFilterMissingData(false);
    setFilterFavorites(false);
    setSearch("");
    resetPage();
  };

  const filters = [
    {
      label: `Prioridades Temáticas${selectedPriority ? ` (${selectedPriority})` : " (0)"}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="layers-menu" className="size-[14px]" />,
      value: selectedPriority,
      options: PRIORITIES,
      onChange: (v: string) => { setSelectedPriority(v); resetPage(); },
    },
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : " (0)"}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="bar-chart" className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => { setSelectedMetric(v); resetPage(); },
    },
    {
      label: "Obrigatórios",
      icon: <AgoraIcon name="alert-circle" className="size-[14px]" />,
      active: filterMandatory,
      onToggle: () => { setFilterMandatory((v) => !v); resetPage(); },
    },
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => { setFilterNonCompliance((v) => !v); resetPage(); },
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      onToggle: () => { setFilterMissingData((v) => !v); resetPage(); },
    },
    {
      label: "Favoritos",
      icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />,
      active: filterFavorites,
      onToggle: () => { setFilterFavorites((v) => !v); resetPage(); },
    },
  ];

  if (!isIndicatorSwapOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-[24px] bg-[rgba(2,28,81,0.45)]"
      onClick={closeIndicatorSwap}
      role="dialog"
      aria-modal="true"
      aria-label="Alterar Indicador Selecionado"
    >
      <div
        className="bg-primary-50 rounded-[16px] w-[1257px] max-w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0px_10px_40px_rgba(2,28,81,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-primary-200 flex items-center justify-between px-[64px] pt-[16px] pb-[12px] shrink-0">
          <h2 className="font-semibold text-[20px] leading-[27px] text-primary-900">
            Alterar Indicador Selecionado
          </h2>
          <button
            onClick={closeIndicatorSwap}
            aria-label="Fechar"
            className="text-primary-900 hover:text-primary-600 transition-colors"
          >
            <AgoraIcon name="x" className="size-[24px]" />
          </button>
        </div>

        {/* Corpo (scroll) */}
        <div className="px-[64px] py-[32px] overflow-y-auto">
          <h3 className="font-semibold text-[24px] leading-[32px] text-primary-900 mb-[16px]">
            Indicadores
          </h3>

          <SearchAndFilters
            searchLabel="Procurar Indicadores"
            searchPlaceholder="Procure um indicador pelo nome"
            filters={filters}
            onSearch={(v) => { setSearch(v); resetPage(); }}
            onClearFilters={clearFilters}
          />

          <p className="text-[14px] text-primary-800 mt-[24px] mb-[16px]">
            A mostrar{" "}
            <span className="font-semibold">{visibleIndicators.length}</span> de{" "}
            <span className="font-semibold">{filtered.length}</span> indicadores
          </p>

          <div className="grid grid-cols-3 gap-[32px]">
            {visibleIndicators.map((indicator) => (
              <PopupIndicatorCard
                key={indicator.id}
                priority={indicator.priority}
                name={indicator.name}
                metric={indicator.metric}
                value={indicator.value}
                missingData={indicator.missingData}
                nonCompliance={indicator.nonCompliance}
                onSelect={() => handleSelect(indicator.id)}
                onDetail={() => handleSelect(indicator.id)}
              />
            ))}
            {visibleIndicators.length === 0 && (
              <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
                Nenhum indicador encontrado.
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
