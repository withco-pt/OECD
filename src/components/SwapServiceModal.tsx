"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useSelectedService } from "@/context/SelectedServiceContext";
import Pagination from "@/components/Pagination";
import Tooltip from "@/components/Tooltip";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 9;

type Tab = "meus" | "todos";

interface PopupServiceCardProps {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat?: number | null;
  nResponses?: number | null;
  missingData?: boolean;
  nonCompliance?: boolean;
  onSelect: () => void;
  onDetail: () => void;
}

function PopupServiceCard({
  name,
  entity,
  area,
  csat,
  nResponses,
  missingData,
  nonCompliance,
  onSelect,
  onDetail,
}: PopupServiceCardProps) {
  return (
    <div className="group relative rounded-[10px] p-[16px] h-[288px] w-full flex flex-col justify-between transition-colors bg-secondary-200 hover:bg-secondary-300">
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[12px]">
          <span className="text-[14px] font-medium text-secondary-900 leading-[20px]">
            {entity}
          </span>
          <h3 className="text-[20px] font-bold text-primary-900 leading-[27px]">
            {name}
          </h3>
        </div>
        <div className="flex flex-col gap-[10px]">
          <p className="text-[14px] text-primary-900 leading-[20px]">
            <span className="font-medium">Área Governamental: </span>
            <span className="font-normal">{area}</span>
          </p>
          <div className="flex flex-wrap gap-[6px]">
            <Tooltip label="Satisfação global média (escala 1–10)">
              <div className="bg-secondary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
                <AgoraIcon name="like" className="size-[16px] text-secondary-900" />
                <span className="text-[13px] font-medium text-primary-700">CSAT</span>
                <span className="text-[16px] font-bold text-primary-900">
                  {csat != null ? csat.toLocaleString("pt-PT") : "–"}
                </span>
              </div>
            </Tooltip>
            <Tooltip label="Número de respostas ao questionário">
              <div className="bg-secondary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
                <span className="text-[16px] font-bold text-primary-900">
                  {nResponses != null ? nResponses.toLocaleString("pt-PT") : "–"}
                </span>
                <span className="text-[13px] font-medium text-primary-700">respostas</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Rodapé: ícones de estado (default) / botões (hover) */}
      <div className="relative h-[36px]">
        <div className="absolute inset-0 flex items-center gap-[6px] group-hover:opacity-0 transition-opacity">
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
            className="flex-1 bg-secondary-800 hover:bg-secondary-900 text-white rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Alterar Serviço
            <AgoraIcon name="refresh-ccw" className="size-[16px]" />
          </button>
          <button
            onClick={onDetail}
            className="flex-1 bg-secondary-100 border border-secondary-800 text-secondary-800 hover:bg-white rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Ver Detalhe
            <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwapServiceModal() {
  const { isSwapOpen, closeSwap, setSelectedServiceId, services } = useSelectedService();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterMatrix, setFilterMatrix] = useState(false);

  // Bloqueia scroll do body e permite fechar com ESC enquanto o popup está aberto.
  useEffect(() => {
    if (!isSwapOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSwap();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isSwapOpen, closeSwap]);

  // "Os Meus Serviços" = serviços com matriz adotada; "Todos" = todos os da entidade.
  const tabServices = useMemo(
    () => (tab === "meus" ? services.filter((s) => s.matrixAdopted) : services),
    [tab, services]
  );

  const filtered = useMemo(() => {
    return tabServices.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterNonCompliance && !s.nonCompliance) return false;
      if (filterMissingData && !s.missingData) return false;
      if (filterMatrix && !s.matrixAdopted) return false;
      return true;
    });
  }, [tabServices, search, filterNonCompliance, filterMissingData, filterMatrix]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleServices = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  const handleSwitchTab = (next: Tab) => {
    setTab(next);
    resetPage();
  };

  const handleSelect = (id: string) => {
    setSelectedServiceId(id);
    closeSwap();
  };

  const handleDetail = (id: string) => {
    closeSwap();
    router.push(`/catalogo/${id}`);
  };

  const hasActiveFilters =
    filterNonCompliance || filterMissingData || filterMatrix || search;

  const clearFilters = () => {
    setFilterNonCompliance(false);
    setFilterMissingData(false);
    setFilterMatrix(false);
    setSearchInput("");
    setSearch("");
    resetPage();
  };

  const radioFilters = [
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      toggle: () => { setFilterNonCompliance((v) => !v); resetPage(); },
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      toggle: () => { setFilterMissingData((v) => !v); resetPage(); },
    },
    {
      label: "Matriz Adotada",
      icon: null,
      active: filterMatrix,
      toggle: () => { setFilterMatrix((v) => !v); resetPage(); },
    },
    {
      label: "Favoritos",
      icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />,
      active: false,
      toggle: () => {},
    },
  ];

  if (!isSwapOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-[24px] bg-[rgba(2,28,81,0.45)]"
      onClick={closeSwap}
      role="dialog"
      aria-modal="true"
      aria-label="Alterar Serviço Selecionado"
    >
      <div
        className="bg-secondary-50 rounded-[16px] w-[1257px] max-w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0px_10px_40px_rgba(2,28,81,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-secondary-200 px-[64px] pt-[16px] shrink-0">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold text-[20px] leading-[27px] text-primary-900">
              Alterar Serviço Selecionado
            </h2>
            <button
              onClick={closeSwap}
              aria-label="Fechar"
              className="text-primary-900 hover:text-primary-600 transition-colors mt-[1px]"
            >
              <AgoraIcon name="x" className="size-[24px]" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-[16px] mt-[16px]">
            {([
              { key: "meus" as Tab, label: "Os Meus Serviços", disabled: true },
              { key: "todos" as Tab, label: "Todos os Serviços", disabled: false },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => !t.disabled && handleSwitchTab(t.key)}
                disabled={t.disabled}
                aria-disabled={t.disabled}
                title={t.disabled ? "Disponível em breve" : undefined}
                className={`px-[20px] py-[10px] rounded-t-[10px] text-[16px] leading-[22px] transition-colors ${
                  t.disabled
                    ? "bg-transparent font-medium text-primary-400 cursor-not-allowed"
                    : tab === t.key
                    ? "bg-secondary-50 font-semibold text-primary-900"
                    : "bg-transparent font-medium text-primary-800 hover:text-primary-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Corpo (scroll) */}
        <div className="px-[64px] py-[32px] overflow-y-auto">
          {/* Procurar */}
          <div className="mb-[16px]">
            <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">
              Procurar Serviços
            </p>
            <div className="flex gap-[16px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); resetPage(); } }}
                  placeholder="Procure um serviço pelo nome"
                  className="w-full border border-primary-400 rounded-[8px] px-[16px] py-[12px] pr-[40px] text-[16px] text-primary-900 placeholder:text-neutral-700 focus:outline-none focus:border-primary-600 bg-white"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(""); setSearch(""); resetPage(); }}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-neutral-700 hover:text-primary-900 transition-colors"
                    aria-label="Limpar pesquisa"
                  >
                    <AgoraIcon name="x" className="size-[18px]" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { setSearch(searchInput); resetPage(); }}
                className="bg-primary-800 text-white px-[24px] py-[12px] rounded-[8px] flex items-center gap-[8px] font-medium text-[16px] hover:bg-primary-900 transition-colors whitespace-nowrap"
              >
                Procurar <AgoraIcon name="search" className="size-[18px]" />
              </button>
            </div>
          </div>

          {/* Filtrar + Ordenar */}
          <div className="flex items-end justify-between gap-[12px] mb-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[14px] font-semibold text-primary-900">Filtrar</p>
              <div className="flex gap-[12px] flex-wrap items-center">
                {radioFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.toggle}
                    className={`flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] border transition-colors ${
                      f.active
                        ? "bg-white border-primary-600 text-primary-600"
                        : "bg-neutral-100 border-neutral-100 text-primary-800 hover:bg-neutral-200"
                    }`}
                  >
                    {f.icon}
                    {f.label}
                    {f.active
                      ? <AgoraIcon name="check-circle" className="size-[16px] text-primary-600 shrink-0" />
                      : <span className="size-[16px] border border-neutral-800 rounded-full inline-block shrink-0" />
                    }
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] text-neutral-700 hover:text-primary-900 transition-colors underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[14px] font-semibold text-primary-900">Ordenar</p>
              <div className="relative">
                <AgoraIcon name="sort-alpha-down" className="size-[14px] text-primary-800 absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
                <select className="appearance-none bg-primary-200 rounded-[8px] pl-[30px] pr-[32px] py-[8px] text-[14px] text-primary-800 focus:outline-none min-w-[180px]">
                  <option>Alfabeticamente</option>
                </select>
                <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <p className="text-[14px] text-primary-800 mb-[16px]">
            A mostrar{" "}
            <span className="font-semibold">{visibleServices.length}</span>{" "}
            de <span className="font-semibold">{filtered.length}</span> serviços
          </p>

          <div className="grid grid-cols-3 gap-[32px]">
            {visibleServices.map((service) => (
              <PopupServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                entity={service.entity}
                area={service.area}
                csat={service.csat}
                nResponses={service.nResponses}
                missingData={service.missingData}
                nonCompliance={service.nonCompliance}
                onSelect={() => handleSelect(service.id)}
                onDetail={() => handleDetail(service.id)}
              />
            ))}
            {visibleServices.length === 0 && (
              <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
                Nenhum serviço encontrado.
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
