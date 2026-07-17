"use client";

import { useEffect, useRef, useState } from "react";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useSelectedChannel, CANONICAL_ORDER } from "@/context/SelectedChannelContext";

// Filtro global de canal, sempre visível na barra de topo. Filtra os indicadores
// em conjunto com o serviço selecionado (interseção), em vez de o substituir.
export default function HeaderChannelDropdown() {
  const { channels, channelsLoading, selectedChannel, setSelectedChannel } = useSelectedChannel();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const extra = channels.filter((c) => !CANONICAL_ORDER.includes(c)).sort((a, b) => a.localeCompare(b));
  const allChannels = [...CANONICAL_ORDER.filter((c) => channels.includes(c)), ...extra];

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={channelsLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center w-full h-[42px] bg-primary-700 rounded-[12px] overflow-hidden hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="h-full flex items-center bg-primary-800 px-[16px] text-[14px] font-bold text-white whitespace-nowrap shrink-0">
          Canal selecionado
        </span>
        <span className="flex-1 min-w-0 px-[16px] text-left text-[15px] font-normal text-white truncate">
          {selectedChannel ?? "Todos os canais"}
        </span>
        <AgoraIcon
          name="chevron-down"
          className={`size-[18px] text-white shrink-0 mr-[16px] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-[8px] bg-white rounded-[10px] shadow-lg border border-neutral-200 py-[6px] min-w-[240px] max-h-[320px] overflow-y-auto z-50"
        >
          <button
            role="option"
            aria-selected={selectedChannel === null}
            onClick={() => { setSelectedChannel(null); setOpen(false); }}
            className={`w-full text-left px-[14px] py-[8px] text-[14px] transition-colors ${
              selectedChannel === null
                ? "bg-secondary-100 text-secondary-900 font-semibold"
                : "text-primary-900 hover:bg-neutral-50"
            }`}
          >
            Todos os canais
          </button>
          {allChannels.map((c) => (
            <button
              key={c}
              role="option"
              aria-selected={selectedChannel === c}
              onClick={() => { setSelectedChannel(c); setOpen(false); }}
              className={`w-full text-left px-[14px] py-[8px] text-[14px] transition-colors ${
                selectedChannel === c
                  ? "bg-secondary-100 text-secondary-900 font-semibold"
                  : "text-primary-900 hover:bg-neutral-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
