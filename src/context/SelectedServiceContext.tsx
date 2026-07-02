"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { services, type Service } from "@/data/mock";
import SwapServiceModal from "@/components/SwapServiceModal";

interface SelectedServiceContextValue {
  selectedService: Service;
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  isSwapOpen: boolean;
  openSwap: () => void;
  closeSwap: () => void;
}

// Serviço selecionado por defeito — corresponde ao banner do Figma ("Alteração de Morada").
const DEFAULT_SERVICE_ID = "alteracao-morada";

const SelectedServiceContext = createContext<SelectedServiceContextValue | null>(null);

export function SelectedServiceProvider({ children }: { children: React.ReactNode }) {
  const [selectedServiceId, setSelectedServiceId] = useState(DEFAULT_SERVICE_ID);
  const [isSwapOpen, setIsSwapOpen] = useState(false);

  const openSwap = useCallback(() => setIsSwapOpen(true), []);
  const closeSwap = useCallback(() => setIsSwapOpen(false), []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0],
    [selectedServiceId]
  );

  const value = useMemo(
    () => ({
      selectedService,
      selectedServiceId,
      setSelectedServiceId,
      isSwapOpen,
      openSwap,
      closeSwap,
    }),
    [selectedService, selectedServiceId, isSwapOpen, openSwap, closeSwap]
  );

  return (
    <SelectedServiceContext.Provider value={value}>
      {children}
      <SwapServiceModal />
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
