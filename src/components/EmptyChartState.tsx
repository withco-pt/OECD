import { AgoraIcon, type AgoraIconName } from "@/components/icons/AgoraIcon";

type EmptyChartStateProps = {
  /** "lg" para visualizações grandes (gauge, doughnut, barras); "sm" para widgets compactos (KPI, rácio). */
  size?: "lg" | "sm";
  icon?: AgoraIconName;
  title: string;
  description?: string;
  className?: string;
};

/**
 * Estado "sem dados" para visualizações de indicadores — reutiliza o padrão já
 * aprovado em "Nenhum resultado encontrado" (src/app/pesquisa/page.tsx): distintivo
 * circular com ícone, título a bold e descrição opcional.
 */
export default function EmptyChartState({ size = "lg", icon = "bar-chart", title, description, className = "" }: EmptyChartStateProps) {
  const badgePadding = size === "lg" ? "p-[15px]" : "p-[11px]";
  const iconSize = size === "lg" ? "size-[26px]" : "size-[18px]";
  const titleClass = size === "lg" ? "text-[14px] font-bold text-primary-900" : "text-[12px] font-bold text-primary-900";

  return (
    <div className={`flex flex-col items-center justify-center text-center gap-[10px] ${className}`}>
      <div className={`bg-neutral-100 rounded-full ${badgePadding}`}>
        <AgoraIcon name={icon} className={`${iconSize} text-neutral-700`} />
      </div>
      <p className={titleClass}>{title}</p>
      {description && <p className="text-[12px] text-primary-700 max-w-[220px]">{description}</p>}
    </div>
  );
}
