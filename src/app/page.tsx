import AppLayout from "@/components/AppLayout";
import ThematicPriorityCard from "@/components/ThematicPriorityCard";
import type { PriorityStatus } from "@/components/ThematicPriorityCard";
import HelpTooltip from "@/components/HelpTooltip";
import { priorities as priorityData } from "@/data/mock";

function PriorityIcon({ src, alt, size = 50 }: { src: string; alt: string; size?: number }) {
  return <img src={src} alt={alt} width={size} height={size} />;
}

function getStatus(p: typeof priorityData[number]): PriorityStatus {
  if (p.nonCompliance > 0 && p.missingData > 0) return "both";
  if (p.nonCompliance > 0) return "non_compliance";
  if (p.missingData > 0) return "missing_data";
  return "ok";
}

export default function PrioridadesTematicas() {
  const featured = priorityData[0];
  const rest = priorityData.slice(1);

  return (
    <AppLayout>
      <div className="flex gap-[16px] items-center">
        <h1 className="font-bold text-[40px] leading-[55px] text-primary-900">
          Prioridades Temáticas
        </h1>
        <div className="mt-[11px]"><HelpTooltip size={30} label="As Prioridades Temáticas são as dimensões prioritárias a que os serviços públicos devem responder. Cada uma agrega um conjunto de indicadores." /></div>
      </div>

      <p className="text-[16px] leading-[23px] text-primary-900 mt-[8px] max-w-[742px]">
        Explore as categorias de indicadores abaixo que ajudam a identificar
        desafios para o serviço.
      </p>

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
    </AppLayout>
  );
}
