import AppLayout from "@/components/AppLayout";
import ThematicPriorityCard from "@/components/ThematicPriorityCard";
import type { PriorityStatus } from "@/components/ThematicPriorityCard";
import HelpTooltip from "@/components/HelpTooltip";
import { supabase } from "@/lib/supabase";

type PriorityRow = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  missingData: number;
  nonCompliance: number;
};

function PriorityIcon({ src, alt, size = 50 }: { src: string | null; alt: string; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={size} height={size} />;
  }
  // Fallback para prioridades sem ícone dedicado (ex.: "Procura") — glifo genérico.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label={alt}>
      <rect x="3" y="13" width="4" height="8" rx="1" fill="#B0C8F5" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="#B0C8F5" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#B0C8F5" />
    </svg>
  );
}

function getStatus(p: { nonCompliance: number; missingData: number }): PriorityStatus {
  if (p.nonCompliance > 0 && p.missingData > 0) return "both";
  if (p.nonCompliance > 0) return "non_compliance";
  if (p.missingData > 0) return "missing_data";
  return "ok";
}

async function getPriorities(): Promise<PriorityRow[]> {
  const { data, error } = await supabase
    .from("thematic_priorities")
    .select("id, name_pt, description, icon_name, display_order")
    .order("display_order");

  if (error || !data) {
    console.error("[prioridades] erro ao carregar:", error?.message);
    return [];
  }

  return data.map((p) => ({
    id: p.id as string,
    title: p.name_pt as string,
    description: (p.description as string) ?? "",
    icon: p.icon_name ? `/icons/${p.icon_name}` : null,
    // Sem dados de incumprimento/dados-incompletos recolhidos ainda.
    missingData: 0,
    nonCompliance: 0,
  }));
}

export default async function PrioridadesTematicas() {
  const priorityData = await getPriorities();
  const featured = priorityData[0];
  const rest = priorityData.slice(1);

  return (
    <AppLayout>
      <div className="flex gap-[16px] items-center">
        <h1 className="font-bold text-[40px] leading-[55px] text-primary-900">
          Dimensões
        </h1>
        <div className="mt-[11px]"><HelpTooltip size={30} label="As Dimensões são as áreas prioritárias a que os serviços públicos devem responder. Cada uma agrega um conjunto de indicadores." /></div>
      </div>

      <p className="text-[16px] leading-[23px] text-primary-900 mt-[8px] max-w-[742px]">
        Explore as categorias de indicadores abaixo que ajudam a identificar
        desafios para o serviço.
      </p>

      {priorityData.length === 0 ? (
        <div className="mt-[32px] text-center py-[48px] text-primary-400 text-[16px]">
          Não foi possível carregar as dimensões.
        </div>
      ) : (
        <div className="mt-[16px] flex flex-col gap-[32px]">
          <ThematicPriorityCard
            title={featured.title}
            description={featured.description}
            icon={<PriorityIcon src={featured.icon} alt={featured.title} size={85} />}
            variant="large"
            status={getStatus(featured)}
            href={`/prioridades/${featured.id}`}
          />

          <div className="grid grid-cols-3 gap-[32px]">
            {rest.map((p) => (
              <ThematicPriorityCard
                key={p.id}
                title={p.title}
                description={p.description}
                icon={<PriorityIcon src={p.icon} alt={p.title} />}
                status={getStatus(p)}
                href={`/prioridades/${p.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
