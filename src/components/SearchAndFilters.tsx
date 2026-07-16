"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState } from "react";

interface RadioFilter {
  label: string;
  icon?: React.ReactNode;
  isDropdown?: false;
  active: boolean;
  onToggle: () => void;
}

interface DropdownFilter {
  label: string;
  icon?: React.ReactNode;
  isDropdown: true;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export type FilterOption = RadioFilter | DropdownFilter;

interface SearchAndFiltersProps {
  searchLabel: string;
  searchPlaceholder: string;
  filters: FilterOption[];
  orderLabel?: string;
  orderOptions?: string[];
  orderValue?: string;
  onOrderChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClearFilters?: () => void;
}

export default function SearchAndFilters({
  searchLabel,
  searchPlaceholder,
  filters,
  orderLabel = "Alfabeticamente",
  orderOptions = [],
  orderValue,
  onOrderChange,
  onSearch,
  onClearFilters,
}: SearchAndFiltersProps) {
  const [input, setInput] = useState("");

  const handleSearch = () => onSearch?.(input);

  const handleClear = () => {
    setInput("");
    onSearch?.("");
  };

  const dropdownFilters = filters.filter((f): f is DropdownFilter => f.isDropdown === true);
  const radioFilters = filters.filter((f): f is RadioFilter => !f.isDropdown);

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Search row */}
      <div>
        <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">
          {searchLabel}
        </p>
        <div className="flex gap-[16px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchPlaceholder}
              className="w-full border border-primary-400 rounded-[8px] px-[16px] py-[12px] pr-[40px] text-[16px] text-primary-900 placeholder:text-neutral-700 focus:outline-none focus:border-primary-600"
            />
            {input && (
              <button
                onClick={handleClear}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 text-neutral-700 hover:text-primary-900 transition-colors"
                aria-label="Limpar pesquisa"
              >
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

      {/* Filters + Ordenar row */}
      <div className="flex items-start justify-between gap-[16px]">
        <div>
          <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">
            Filtrar
          </p>
          <div className="flex flex-wrap items-center gap-[8px]">
            {/* Dropdown filters */}
            {dropdownFilters.map((f) => (
              <div key={f.label} className="relative">
                <select
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className="appearance-none flex items-center gap-[6px] bg-primary-200 rounded-[8px] pl-[10px] pr-[28px] py-[8px] text-[14px] text-primary-800 hover:bg-primary-300 focus:outline-none transition-colors"
                >
                  <option value="">{f.label}</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}

            {/* Radio filters */}
            {radioFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.onToggle}
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
            {onClearFilters && (radioFilters.some(f => f.active) || dropdownFilters.some(f => f.value !== "")) && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] text-neutral-700 hover:text-primary-900 transition-colors underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Ordenar — só quando há opções de ordenação */}
        {orderOptions.length > 0 && (
          <div>
            <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">
              Ordenar
            </p>
            <div className="relative">
              <AgoraIcon name="sort-alpha-down" className="size-[14px] text-primary-800 absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={orderValue ?? orderLabel}
                onChange={(e) => onOrderChange?.(e.target.value)}
                className="appearance-none bg-primary-200 rounded-[8px] pl-[30px] pr-[32px] py-[8px] text-[14px] text-primary-800 focus:outline-none min-w-[180px]"
              >
                <option value={orderLabel}>{orderLabel}</option>
                {orderOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <AgoraIcon name="chevron-down" className="size-[14px] text-primary-600 absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
