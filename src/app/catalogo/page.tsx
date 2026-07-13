"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import Breadcrumb from "@/components/Breadcrumb";
import ServiceCard from "@/components/ServiceCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";
import { useSelectedEntity } from "@/context/SelectedEntityContext";

const ITEMS_PER_PAGE = 9;

type Service = {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat: number | null;
  nResponses: number | null;
  missingData: boolean;
  nonCompliance: boolean;
  matrixAdopted: boolean;
};

export default function CatalogoPage() {
  const { entity } = useSelectedEntity();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterMatrix, setFilterMatrix] = useState(false);
  const [sortOrder, setSortOrder] = useState("Alfabeticamente");

  // Carrega apenas os serviços da entidade selecionada.
  // (o AppLayout garante que existe uma entidade antes de renderizar esta página)
  useEffect(() => {
    if (!entity) return;
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await supabase
        .from("services_catalog")
        .select("id, name, entity, area, matriz_adotada, has_measurements")
        .eq("entity_short", entity.id)
        .order("name");

      if (!active) return;
      if (error) {
        console.error("[catalogo] erro ao carregar services_catalog:", error.message);
        setLoadError(true);
        setServices([]);
        setLoading(false);
        return;
      }

      // Métricas de cabeçalho por serviço: CSAT (ux_csat) e nº de respostas.
      const ids = (data ?? []).map((s) => s.id as string);
      const byService = new Map<string, { csat: number | null; n: number | null }>();
      if (ids.length) {
        const { data: csatInd } = await supabase
          .from("indicators").select("id").eq("etl_column_key", "ux_csat").maybeSingle();
        const csatId = csatInd?.id as string | undefined;
        if (csatId) {
          const { data: meas } = await supabase
            .from("measurements_catalog")
            .select("service_id, value, total_inquiridos, channel, geo_level")
            .eq("indicator_id", csatId)
            .in("service_id", ids);
          if (!active) return;
          // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por
          // distrito também têm channel=null — mesmo critério da página de detalhe).
          const bySvcRows = new Map<string, { value: number | string | null; total_inquiridos: number | null; channel: string | null; geo_level: string | null }[]>();
          for (const m of meas ?? []) {
            const key = m.service_id as string;
            if (!bySvcRows.has(key)) bySvcRows.set(key, []);
            bySvcRows.get(key)!.push({
              value: m.value as number | string | null,
              total_inquiridos: (m.total_inquiridos as number | null) ?? null,
              channel: (m.channel as string | null) ?? null,
              geo_level: (m.geo_level as string | null) ?? null,
            });
          }
          for (const [serviceId, rows] of bySvcRows) {
            const nullRow = rows.find((r) => r.channel === null && r.geo_level === null) ?? rows[0];
            byService.set(serviceId, {
              csat: nullRow.value != null ? Number(nullRow.value) : null,
              n: nullRow.total_inquiridos,
            });
          }
        }
      }

      setServices(
        (data ?? []).map((s) => {
          const agg = byService.get(s.id as string);
          return {
            id: s.id as string,
            name: s.name as string,
            entity: (s.entity as string) ?? "",
            area: (s.area as string) ?? "—",
            csat: agg?.csat ?? null,
            nResponses: agg?.n ?? null,
            missingData: !s.has_measurements,
            nonCompliance: false, // sem dados de conformidade recolhidos ainda
            matrixAdopted: Boolean(s.matriz_adotada),
          };
        })
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [entity]);

  const filtered = useMemo(() => {
    const result = services.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterNonCompliance && !s.nonCompliance) return false;
      if (filterMissingData && !s.missingData) return false;
      if (filterMatrix && !s.matrixAdopted) return false;
      return true;
    });
    // Ordenação por CSAT — serviços sem CSAT (dados incompletos) ficam sempre no fim.
    if (sortOrder === "CSAT: maior → menor" || sortOrder === "CSAT: menor → maior") {
      const dir = sortOrder === "CSAT: maior → menor" ? -1 : 1;
      return [...result].sort((a, b) => {
        if (a.csat == null && b.csat == null) return 0;
        if (a.csat == null) return 1;
        if (b.csat == null) return -1;
        return (a.csat - b.csat) * dir;
      });
    }
    return result;
  }, [services, search, filterNonCompliance, filterMissingData, filterMatrix, sortOrder]);

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

      <div className="flex items-center gap-[8px] mb-[8px]">
        <h1 className="text-[40px] font-bold text-primary-900 leading-tight">
          Todos os Serviços
        </h1>
        <HelpTooltip size={24} label="Nesta plataforma, um serviço é toda e qualquer relação entre cidadãos, as empresas e entidades da sociedade civil com o Estado que tenham como interveniente uma ou mais entidades da Administração Pública e que pretenda endereçar os direitos, as obrigações, e/ou as necessidades derivadas de um determinado evento de vida, disponibilizada através de um modelo omnicanal em que a interação é suportada por plataformas digitais." />
      </div>
      {entity && (
        <p className="text-[15px] text-primary-700 mb-[32px]">
          Serviços de <span className="font-semibold">{entity.name}</span>
        </p>
      )}

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
          </div>
          {/* Ordenar */}
          <div className="flex flex-col gap-[8px]">
            <p className="text-[14px] font-semibold text-primary-900">Ordenar</p>
            <div className="relative">
              <AgoraIcon name="sort-alpha-down" className="size-[14px] text-primary-800 absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-primary-200 rounded-[8px] pl-[30px] pr-[32px] py-[8px] text-[14px] text-primary-800 focus:outline-none min-w-[180px]"
              >
                <option value="Alfabeticamente">Alfabeticamente</option>
                <option value="CSAT: maior → menor">CSAT: maior → menor</option>
                <option value="CSAT: menor → maior">CSAT: menor → maior</option>
              </select>
              <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Radio filters */}
        <div className="flex gap-[12px] flex-wrap items-center">
          {[
            { label: "Incumprimento Legal", icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />, active: filterNonCompliance, toggle: () => { setFilterNonCompliance(!filterNonCompliance); setCurrentPage(1); } },
            { label: "Dados Incompletos", icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />, active: filterMissingData, toggle: () => { setFilterMissingData(!filterMissingData); setCurrentPage(1); } },
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
          {(filterNonCompliance || filterMissingData || filterMatrix) && (
            <button
              onClick={() => { setFilterNonCompliance(false); setFilterMissingData(false); setFilterMatrix(false); setCurrentPage(1); }}
              className="flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] text-neutral-700 hover:text-primary-900 transition-colors underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Estados: loading / erro / conteúdo */}
      {loading ? (
        <div className="text-center py-[64px] text-primary-400 text-[16px]">
          A carregar serviços…
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-[8px] py-[64px] text-danger-800">
          <AgoraIcon name="alert-triangle" className="size-[24px]" />
          <span className="text-[16px] font-semibold">Não foi possível carregar os serviços.</span>
          <span className="text-[14px] text-neutral-700">Verifique a ligação à base de dados e tente novamente.</span>
        </div>
      ) : (
        <>
          <p className="text-[14px] text-primary-800 mb-[16px]">
            A mostrar{" "}
            <span className="font-semibold">{Math.max(Math.min(visibleServices.length + startIndex, filtered.length) - startIndex, 0)}</span>{" "}
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
                csat={service.csat}
                nResponses={service.nResponses}
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
        </>
      )}
    </AppLayout>
  );
}
