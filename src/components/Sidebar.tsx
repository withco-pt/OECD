"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  List,
  Layers,
  BookOpen,
  Copy,
  Search,
  Heart,
  Info,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { priorities } from "@/data/mock";

const prioritySubItems = priorities.map((p) => ({
  label: p.title,
  href: `/prioridades/${p.id}`,
}));

export default function Sidebar() {
  const pathname = usePathname();
  const [ptOpen, setPtOpen] = useState(pathname === "/" || pathname.startsWith("/prioridades"));
  const [catOpen, setCatOpen] = useState(pathname.startsWith("/catalogo"));

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const ptActive = pathname === "/" || isActive("/prioridades");
  const catActive = isActive("/catalogo");

  return (
    <aside className="bg-primary-200 drop-shadow-[2px_0px_2px_rgba(0,0,0,0.05)] flex flex-col w-[316px] fixed top-[72px] bottom-0 left-0 z-40 pt-[50px] pb-[32px] px-[16px] overflow-y-auto">
      <div className="flex flex-col flex-1 justify-between">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            {/* Prioridades Temáticas */}
            <div className="flex flex-col rounded-[4px]">
              <div
                className={`flex items-center justify-between px-[16px] py-[8px] rounded-[4px] ${
                  ptActive ? "bg-primary-600" : "bg-primary-300/50 hover:bg-primary-300/70 transition-colors"
                }`}
              >
                <Link
                  href="/"
                  className="flex gap-[8px] items-center flex-1 min-w-0"
                >
                  <Layers
                    className={`size-[20px] shrink-0 ${
                      ptActive ? "text-primary-50" : "text-primary-800"
                    }`}
                  />
                  <span
                    className={`font-semibold text-[16px] leading-[23px] ${
                      ptActive ? "text-primary-50" : "text-primary-800"
                    }`}
                  >
                    Prioridades Temáticas
                  </span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPtOpen(!ptOpen);
                  }}
                  className="p-[4px] cursor-pointer"
                  aria-label={ptOpen ? "Recolher sub-itens" : "Expandir sub-itens"}
                >
                  {ptOpen ? (
                    <ChevronUp className={`size-[14px] ${ptActive ? "text-primary-50" : "text-primary-800"}`} />
                  ) : (
                    <ChevronDown className={`size-[14px] ${ptActive ? "text-primary-50" : "text-primary-800"}`} />
                  )}
                </button>
              </div>
              {ptOpen && (
                <div className="flex flex-col mt-[2px] rounded-[4px] overflow-hidden">
                  <Link
                    href="/"
                    className={`text-[14px] px-[16px] py-[6px] ${
                      pathname === "/" ? "font-semibold text-primary-900 bg-primary-300" : "text-primary-800 bg-primary-200 hover:bg-primary-300/50 transition-colors"
                    }`}
                  >
                    Todas as Temáticas
                  </Link>
                  {prioritySubItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-[14px] px-[16px] py-[6px] ${
                        pathname === item.href ? "font-semibold text-primary-900 bg-primary-300" : "text-primary-800 bg-primary-200 hover:bg-primary-300/50 transition-colors"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Indicadores */}
            <Link
              href="/indicadores"
              className={`flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer ${
                isActive("/indicadores") ? "bg-primary-600" : "hover:bg-primary-300/30 transition-colors"
              }`}
            >
              <List className={`size-[20px] ${isActive("/indicadores") ? "text-primary-50" : "text-primary-800"}`} />
              <span className={`font-medium text-[16px] leading-[23px] ${isActive("/indicadores") ? "text-primary-50 font-semibold" : "text-primary-800"}`}>
                Indicadores
              </span>
            </Link>

            {/* Catálogo de Serviços */}
            <div className="flex flex-col rounded-[4px]">
              <div
                className={`flex items-center justify-between px-[16px] py-[8px] rounded-[4px] ${
                  catActive ? "bg-primary-600" : "hover:bg-primary-300/30 transition-colors"
                }`}
              >
                <Link
                  href="/catalogo"
                  className="flex gap-[8px] items-center flex-1 min-w-0"
                >
                  <BookOpen className={`size-[20px] shrink-0 ${catActive ? "text-primary-50" : "text-primary-800"}`} />
                  <span className={`font-medium text-[16px] leading-[23px] ${catActive ? "text-primary-50 font-semibold" : "text-primary-800"}`}>
                    Catálogo de Serviços
                  </span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatOpen(!catOpen);
                  }}
                  className="p-[4px] cursor-pointer"
                  aria-label={catOpen ? "Recolher sub-itens" : "Expandir sub-itens"}
                >
                  {catOpen ? (
                    <ChevronUp className={`size-[14px] ${catActive ? "text-primary-50" : "text-primary-800"}`} />
                  ) : (
                    <ChevronDown className={`size-[14px] ${catActive ? "text-primary-50" : "text-primary-800"}`} />
                  )}
                </button>
              </div>
              {catOpen && (
                <div className="flex flex-col mt-[2px] rounded-[4px] overflow-hidden">
                  <Link
                    href="/catalogo"
                    className={`text-[14px] px-[16px] py-[6px] ${
                      pathname === "/catalogo" ? "font-semibold text-primary-900 bg-primary-300" : "text-primary-800 bg-primary-200 hover:bg-primary-300/50 transition-colors"
                    }`}
                  >
                    Todos os Serviços
                  </Link>
                  <Link
                    href="/catalogo/meus-servicos"
                    className={`text-[14px] px-[16px] py-[6px] ${
                      pathname === "/catalogo/meus-servicos" ? "font-semibold text-primary-900 bg-primary-300" : "text-primary-800 bg-primary-200 hover:bg-primary-300/50 transition-colors"
                    }`}
                  >
                    Os Meus Serviços
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-primary-300" />

          <div className="flex flex-col">
            <Link
              href="/comparar"
              className="flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer hover:bg-primary-300/30 transition-colors"
            >
              <Copy className="size-[20px] text-primary-800" />
              <span className="font-medium text-[16px] leading-[23px] text-primary-800">
                Comparar
              </span>
            </Link>
          </div>

          <div className="h-px bg-primary-300" />

          <div className="flex flex-col gap-[8px]">
            <a className="flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer hover:bg-primary-300/30 transition-colors">
              <Search className="size-[20px] text-primary-800" />
              <span className="font-medium text-[16px] leading-[23px] text-primary-800">
                Procurar
              </span>
            </a>
            <a className="flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer hover:bg-primary-300/30 transition-colors">
              <Heart className="size-[20px] text-primary-800" />
              <span className="font-medium text-[16px] leading-[23px] text-primary-800">
                Favoritos
              </span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <div className="h-px bg-primary-300" />
          <div className="flex flex-col gap-[8px]">
            <a className="flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer hover:bg-primary-300/30 transition-colors">
              <Info className="size-[20px] text-primary-800" />
              <span className="font-medium text-[16px] leading-[23px] text-primary-800">
                Ver Tutorial
              </span>
            </a>
            <a className="flex gap-[8px] items-center px-[16px] py-[6px] rounded-[4px] cursor-pointer hover:bg-primary-300/30 transition-colors">
              <Headphones className="size-[20px] text-primary-800" />
              <span className="font-medium text-[16px] leading-[23px] text-primary-800">
                Centro de Apoio
              </span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
