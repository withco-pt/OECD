"use client";

import HelpTooltip from "@/components/HelpTooltip";
import { RevealContext, revealClasses, useRevealOnScroll } from "./Reveal";

/** Moldura partilhada dos blocos do dashboard — segue o padrão visual do IndicatorViz.
 *  Revela-se ao entrar no viewport e informa os gráficos internos (via RevealContext)
 *  para animarem a sua construção. */
export default function DashboardCard({
  title,
  subtitle,
  help,
  children,
  className = "",
  revealDelay = 0,
}: {
  title: string;
  subtitle?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
  revealDelay?: number;
}) {
  const { ref, visible } = useRevealOnScroll<HTMLElement>();

  return (
    <RevealContext.Provider value={visible}>
      <section
        ref={ref}
        style={revealDelay ? { transitionDelay: `${revealDelay}ms` } : undefined}
        className={`bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] p-[16px] flex flex-col gap-[16px] ${revealClasses(visible)} ${className}`}
      >
        <div className="flex flex-col gap-[2px] pb-[8px] border-b-2 border-primary-300">
          <div className="flex items-center gap-[8px]">
            <h2 className="text-[20px] font-bold text-primary-900 leading-[27px]">{title}</h2>
            {help && <HelpTooltip size={18} label={help} />}
          </div>
          {subtitle && <p className="text-[14px] text-primary-700">{subtitle}</p>}
        </div>
        {children}
      </section>
    </RevealContext.Provider>
  );
}
