"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSelectedEntity } from "@/context/SelectedEntityContext";

/* ─────────────────────────────────────────────────────────────
   Filtro global de canal (dropdown na barra de topo). Aplica-se em
   conjunto com o serviço selecionado (interseção): os indicadores
   mostrados passam a ser os do serviço ativo, fatiados pelo canal
   escolhido. null = "Todos os canais" (sem filtro de canal).
   ───────────────────────────────────────────────────────────── */

interface SelectedChannelContextValue {
  channels: string[];
  channelsLoading: boolean;
  /** null = "Todos os canais". */
  selectedChannel: string | null;
  setSelectedChannel: (c: string | null) => void;
}

const SelectedChannelContext = createContext<SelectedChannelContextValue | null>(null);

const channelKey = (entityId: string) => `ocde.selectedChannel.${entityId}`;

// Ordem canónica dos canais mais comuns; os restantes (específicos de entidade)
// aparecem a seguir por ordem alfabética.
export const CANONICAL_ORDER = [
  "Presencial",
  "Telefone",
  "Videochamada",
  "Digital/Online",
  "App",
  "Chatbox",
  "Outro",
];

function sortChannels(list: string[]): string[] {
  return [...list].sort((a, b) => {
    const ia = CANONICAL_ORDER.indexOf(a);
    const ib = CANONICAL_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function SelectedChannelProvider({ children }: { children: React.ReactNode }) {
  const { entity } = useSelectedEntity();

  const [channels, setChannels] = useState<string[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [selectedChannel, setSelectedChannelState] = useState<string | null>(null);

  // Carrega os canais disponíveis para a entidade ativa.
  useEffect(() => {
    if (!entity) {
      setChannels([]);
      setSelectedChannelState(null);
      return;
    }
    let active = true;
    (async () => {
      setChannelsLoading(true);
      const { data, error } = await supabase
        .from("measurements_catalog")
        .select("channel")
        .eq("entity_short", entity.id)
        .not("channel", "is", null);

      if (!active) return;
      if (error) {
        console.error("[canal] erro ao carregar canais:", error.message);
        setChannels([]);
        setSelectedChannelState(null);
        setChannelsLoading(false);
        return;
      }

      const distinct = sortChannels([...new Set((data ?? []).map((r) => r.channel as string))]);
      setChannels(distinct);

      // Canal memorizado para esta entidade (se ainda existir); senão "Todos os canais".
      let initial: string | null = null;
      try {
        const saved = localStorage.getItem(channelKey(entity.id));
        if (saved && distinct.includes(saved)) initial = saved;
      } catch {
        // ignora
      }
      setSelectedChannelState(initial);
      setChannelsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [entity]);

  const setSelectedChannel = useCallback(
    (c: string | null) => {
      setSelectedChannelState(c);
      if (entity) {
        try {
          if (c) localStorage.setItem(channelKey(entity.id), c);
          else localStorage.removeItem(channelKey(entity.id));
        } catch {
          // ignora
        }
      }
    },
    [entity]
  );

  const value = useMemo(
    () => ({
      channels,
      channelsLoading,
      selectedChannel,
      setSelectedChannel,
    }),
    [channels, channelsLoading, selectedChannel, setSelectedChannel]
  );

  return <SelectedChannelContext.Provider value={value}>{children}</SelectedChannelContext.Provider>;
}

export function useSelectedChannel() {
  const ctx = useContext(SelectedChannelContext);
  if (!ctx) {
    throw new Error("useSelectedChannel tem de ser usado dentro de SelectedChannelProvider");
  }
  return ctx;
}
