"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import Breadcrumb from "@/components/Breadcrumb";
import ServiceCard from "@/components/ServiceCard";
import Pagination from "@/components/Pagination";
import { services } from "@/data/mock";

const ITEMS_PER_PAGE = 9;

const AREAS = [...new Set(services.map((s) => s.area))].sort();
const ENTITIES = [...new Set(services.map((s) => s.entity))].sort();
const DEPARTMENTS = [...new Set(services.map((s) => s.department))].sort();

export default function CatalogoPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterMatrix, setFilterMatrix] = useState(false);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedArea && s.area !== selectedArea) return false;
      if (selectedEntity && s.entity !== selectedEntity) return false;
      if (selectedDepartment && s.department !== selectedDepartment) return false;
      if (filterNonCompliance && !s.nonCompliance) return false;
      if (filterMissingData && !s.missingData) return false;
      if (filterMatrix && !s.matrixAdopted) return false;
      return true;
    });
  }, [search, selectedArea, selectedEntity, selectedDepartment, filterNonCompliance, filterMissingData, filterMatrix]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleServices = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: "Catálogo de Serviços", href: "/catalogo" },
          { label: "Todos os Serviços" },
        ]}
      />

      <div className="flex items-center gap-[8px] mb-[32px]">
        <h1 className="text-[40px] font-bold text-primary-900 leading-tight">
          Todos os Serviços
        </h1>
        <HelpTooltip size={24} label="Nesta plataforma, um serviço é toda e qualquer relação entre cidadãos, as empresas e entidades da sociedade civil com o Estado que tenham como interveniente uma ou mais entidades da Administração Pública e que pretenda endereçar os direitos, as obrigações, e/ou as necessidades derivadas de um determinado evento de vida, disponibilizada através de um modelo omnicanal em que a interação é suportada por plataformas digitais." />
      </div>

      {/* Search */}
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Procure um serviço pelo nome"
              className="w-full border border-primary-400 rounded-[8px] px-[16px] py-[12px] pr-[40px] text-[16px] text-primary-900 placeholder:text-neutral-700 focus:outline-none focus:border-primary-600"
            />
            {searchInput && (
              <button onClick={handleClearSearch} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-neutral-700 hover:text-primary-900 transition-colors" aria-label="Limpar pesquisa">
                <AgoraIcon name="x" className="size-[18px]" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-800 text-white px-[24px] py-[12px] rounded-[8px] flex items-center gap-[8px] font-medium text-[16px] hover:bg-primary-900 transition-colors"
          >
            Procurar <AgoraIcon name="search" className="size-[18px]" />
          </button>
        </div>
      </div>

      {/* Filtrar + Ordenar */}
      <div className="flex flex-col gap-[12px] mb-[24px]">
        <div className="flex items-end justify-between gap-[12px]">
          <div className="flex flex-col gap-[8px] flex-1">
            <p className="text-[14px] font-semibold text-primary-900">Filtrar</p>
            <div className="flex gap-[12px]">
              {/* Área Governamental */}
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => { setSelectedArea(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-primary-200 rounded-[8px] px-[12px] py-[8px] pr-[32px] text-[14px] text-primary-800 focus:outline-none min-w-[200px]"
                >
                  <option value="">Área Governamental ({AREAS.length})</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {/* Entidade */}
              <div className="relative">
                <select
                  value={selectedEntity}
                  onChange={(e) => { setSelectedEntity(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-primary-200 rounded-[8px] px-[12px] py-[8px] pr-[32px] text-[14px] text-primary-800 focus:outline-none min-w-[180px]"
                >
                  <option value="">Entidade ({ENTITIES.length})</option>
                  {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {/* Departamento */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-primary-200 rounded-[8px] px-[12px] py-[8px] pr-[32px] text-[14px] text-primary-800 focus:outline-none min-w-[180px]"
                >
                  <option value="">Departamento ({DEPARTMENTS.length})</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Ordenar */}
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

        {/* Radio filters */}
        <div className="flex gap-[12px] flex-wrap items-center">
          {[
            { label: "Incumprimento Legal", icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />, active: filterNonCompliance, toggle: () => { setFilterNonCompliance(!filterNonCompliance); setCurrentPage(1); } },
            { label: "Dados Incompletos", icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-500" />, active: filterMissingData, toggle: () => { setFilterMissingData(!filterMissingData); setCurrentPage(1); } },
            { label: "Matriz Adotada", icon: null, active: filterMatrix, toggle: () => { setFilterMatrix(!filterMatrix); setCurrentPage(1); } },
            { label: "Favoritos", icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />, active: false, toggle: () => {} },
          ].map((f) => (
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
          {(filterNonCompliance || filterMissingData || filterMatrix || selectedArea || selectedEntity || selectedDepartment) && (
            <button
              onClick={() => { setFilterNonCompliance(false); setFilterMissingData(false); setFilterMatrix(false); setSelectedArea(""); setSelectedEntity(""); setSelectedDepartment(""); setCurrentPage(1); }}
              className="flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] text-neutral-700 hover:text-primary-900 transition-colors underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <p className="text-[14px] text-primary-800 mb-[16px]">
        A mostrar{" "}
        <span className="font-semibold">{Math.min(visibleServices.length + startIndex, filtered.length) - startIndex}</span>{" "}
        de <span className="font-semibold">{filtered.length}</span> serviços
      </p>

      <div className="grid grid-cols-3 gap-[24px]">
        {visibleServices.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={service.name}
            entity={service.entity}
            area={service.area}
            department={service.department}
            missingData={service.missingData}
            nonCompliance={service.nonCompliance}
          />
        ))}
        {visibleServices.length === 0 && (
          <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
            Nenhum serviço encontrado.
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </AppLayout>
  );
}
