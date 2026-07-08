"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SelectedEntity = {
  id: string; // short_name (ex: 'at', 'iss', 'ec')
  name: string;
  area: string | null;
};

interface SelectedEntityContextValue {
  entity: SelectedEntity | null;
  setEntity: (e: SelectedEntity) => void;
  clearEntity: () => void;
  hydrated: boolean; // true após ler o localStorage no cliente
}

const STORAGE_KEY = "ocde.selectedEntity";

const SelectedEntityContext = createContext<SelectedEntityContextValue | null>(null);

export function SelectedEntityProvider({ children }: { children: React.ReactNode }) {
  // Inicia sempre a null para o render do servidor e o 1.º render do cliente
  // coincidirem (evita erros de hidratação). O localStorage é lido no efeito.
  const [entity, setEntityState] = useState<SelectedEntity | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntityState(JSON.parse(raw) as SelectedEntity);
    } catch {
      // ignora localStorage indisponível / JSON inválido
    }
    setHydrated(true);
  }, []);

  const setEntity = useCallback((e: SelectedEntity) => {
    setEntityState(e);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
    } catch {
      // ignora
    }
  }, []);

  const clearEntity = useCallback(() => {
    setEntityState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  const value = useMemo(
    () => ({ entity, setEntity, clearEntity, hydrated }),
    [entity, setEntity, clearEntity, hydrated]
  );

  return (
    <SelectedEntityContext.Provider value={value}>
      {children}
    </SelectedEntityContext.Provider>
  );
}

export function useSelectedEntity() {
  const ctx = useContext(SelectedEntityContext);
  if (!ctx) {
    throw new Error("useSelectedEntity tem de ser usado dentro de SelectedEntityProvider");
  }
  return ctx;
}
