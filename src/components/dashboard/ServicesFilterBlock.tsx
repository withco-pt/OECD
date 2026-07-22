"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { type DashboardData } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Serviços com Medições — estatística de cobertura por serviço +
   dropdown para filtrar todo o dashboard a um único serviço.
   Filtro local a esta página (não afeta o "serviço selecionado"
   global usado noutras páginas).
   ───────────────────────────────────────────────────────────── */

export default function ServicesFilterBlock({
  data,
  selectedServiceId,
  onSelectService,
}: {
  data: DashboardData;
  selectedServiceId: string | null;
  onSelectService: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const servicesWithData = useMemo(
    () => new Set(data.rows.map((r) => r.service_id)).size,
    [data.rows]
  );
  const selected = data.services.find((s) => s.id === selectedServiceId) ?? null;

  return (
    <section className="bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] px-[16px] py-[12px] flex-1 min-w-0">
      <h2 className="text-[14px] font-bold text-primary-900">Serviços com Medições</h2>
      <div className="flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[8px] mt-[8px]">
        <div className="flex items-center gap-[8px] shrink-0">
          <AgoraIcon name="book-open" className="size-[16px] text-primary-600 shrink-0" />
          <span className="text-[13px] text-primary-800">Serviços com dados:</span>
          <span className="text-[13px] font-bold text-primary-900">
            {servicesWithData} de {data.services.length}
          </span>
        </div>

        <div className="relative min-w-[220px]" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center justify-between gap-[8px] w-full h-[32px] bg-white border border-primary-300 rounded-[8px] px-[10px] hover:border-primary-500 transition-colors"
          >
            <span className="text-[13px] text-primary-900 truncate">
              {selected ? selected.name : "Todos os Serviços"}
            </span>
            <AgoraIcon
              name="chevron-down"
              className={`size-[16px] text-primary-600 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute right-0 top-full mt-[6px] bg-white rounded-[10px] shadow-lg border border-neutral-200 py-[6px] min-w-full w-max max-w-[320px] max-h-[280px] overflow-y-auto z-50"
            >
              <button
                role="option"
                aria-selected={selectedServiceId === null}
                onClick={() => { onSelectService(null); setOpen(false); }}
                className={`w-full text-left px-[14px] py-[8px] text-[13px] transition-colors ${
                  selectedServiceId === null
                    ? "bg-secondary-100 text-secondary-900 font-semibold"
                    : "text-primary-900 hover:bg-neutral-50"
                }`}
              >
                Todos os Serviços
              </button>
              {data.services.map((s) => (
                <button
                  key={s.id}
                  role="option"
                  aria-selected={selectedServiceId === s.id}
                  onClick={() => { onSelectService(s.id); setOpen(false); }}
                  className={`w-full text-left px-[14px] py-[8px] text-[13px] transition-colors ${
                    selectedServiceId === s.id
                      ? "bg-secondary-100 text-secondary-900 font-semibold"
                      : "text-primary-900 hover:bg-neutral-50"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
