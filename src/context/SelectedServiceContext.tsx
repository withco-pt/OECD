"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import SwapServiceModal from "@/components/SwapServiceModal";
import SwapIndicatorModal from "@/components/SwapIndicatorModal";
import { supabase } from "@/lib/supabase";
import { useSelectedEntity } from "@/context/SelectedEntityContext";

export type ServiceOption = {
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

interface SelectedServiceContextValue {
  services: ServiceOption[];
  servicesLoading: boolean;
  selectedService: ServiceOption | null;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string) => void;
  isSwapOpen: boolean;
  openSwap: () => void;
  closeSwap: () => void;
  isIndicatorSwapOpen: boolean;
  openIndicatorSwap: () => void;
  closeIndicatorSwap: () => void;
}

const SelectedServiceContext = createContext<SelectedServiceContextValue | null>(null);

const storageKey = (entityId: string) => `ocde.selectedService.${entityId}`;

export function SelectedServiceProvider({ children }: { children: React.ReactNode }) {
  const { entity } = useSelectedEntity();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceIdState] = useState<string | null>(null);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isIndicatorSwapOpen, setIsIndicatorSwapOpen] = useState(false);

  // Carrega os serviços da entidade ativa sempre que a entidade muda.
  useEffect(() => {
    if (!entity) {
      setServices([]);
      setSelectedServiceIdState(null);
      return;
    }
    let active = true;
    (async () => {
      setServicesLoading(true);
      const { data, error } = await supabase
        .from("services_catalog")
        .select("id, name, entity, area, matriz_adotada, has_measurements")
        .eq("entity_short", entity.id)
        .order("name");

      if (!active) return;
      if (error) {
        console.error("[serviço selecionado] erro ao carregar serviços:", error.message);
        setServices([]);
        setSelectedServiceIdState(null);
        setServicesLoading(false);
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

      const list: ServiceOption[] = (data ?? []).map((s) => {
        const agg = byService.get(s.id as string);
        return {
          id: s.id as string,
          name: s.name as string,
          entity: (s.entity as string) ?? "",
          area: (s.area as string) ?? "—",
          csat: agg?.csat ?? null,
          nResponses: agg?.n ?? null,
          missingData: !s.has_measurements,
          nonCompliance: false,
          matrixAdopted: Boolean(s.matriz_adotada),
        };
      });
      setServices(list);

      // Serviço ativo: o memorizado para esta entidade (se ainda existir) ou o primeiro.
      let initial: string | null = null;
      try {
        const saved = localStorage.getItem(storageKey(entity.id));
        if (saved && list.some((s) => s.id === saved)) initial = saved;
      } catch {
        // ignora
      }
      if (!initial) initial = list[0]?.id ?? null;
      setSelectedServiceIdState(initial);
      setServicesLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [entity]);

  const setSelectedServiceId = useCallback(
    (id: string) => {
      setSelectedServiceIdState(id);
      if (entity) {
        try {
          localStorage.setItem(storageKey(entity.id), id);
        } catch {
          // ignora
        }
      }
    },
    [entity]
  );

  const openSwap = useCallback(() => setIsSwapOpen(true), []);
  const closeSwap = useCallback(() => setIsSwapOpen(false), []);
  const openIndicatorSwap = useCallback(() => setIsIndicatorSwapOpen(true), []);
  const closeIndicatorSwap = useCallback(() => setIsIndicatorSwapOpen(false), []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  const value = useMemo(
    () => ({
      services,
      servicesLoading,
      selectedService,
      selectedServiceId,
      setSelectedServiceId,
      isSwapOpen,
      openSwap,
      closeSwap,
      isIndicatorSwapOpen,
      openIndicatorSwap,
      closeIndicatorSwap,
    }),
    [services, servicesLoading, selectedService, selectedServiceId, setSelectedServiceId, isSwapOpen, openSwap, closeSwap, isIndicatorSwapOpen, openIndicatorSwap, closeIndicatorSwap]
  );

  return (
    <SelectedServiceContext.Provider value={value}>
      {children}
      <SwapServiceModal />
      <SwapIndicatorModal />
    </SelectedServiceContext.Provider>
  );
}

export function useSelectedService() {
  const ctx = useContext(SelectedServiceContext);
  if (!ctx) {
    throw new Error("useSelectedService tem de ser usado dentro de SelectedServiceProvider");
  }
  return ctx;
}
