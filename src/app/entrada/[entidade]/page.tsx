import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { EntityAutoSelect } from "@/components/EntityAutoSelect";

// Mesma razão do /entrada: as entidades vêm da BD e não podem ficar em cache estática.
export const dynamic = "force-dynamic";

async function getEntity(shortName: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("short_name, name, area_governamental, active")
    .eq("short_name", shortName)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.short_name as string,
    name: data.name as string,
    area: (data.area_governamental as string) ?? null,
  };
}

export default async function EntradaEntidadePage({
  params,
}: {
  params: Promise<{ entidade: string }>;
}) {
  const { entidade } = await params;
  const entity = await getEntity(entidade);

  if (!entity) {
    return (
      <div className="bg-neutral-50 min-h-screen flex flex-col items-center justify-center gap-[12px] text-center px-[32px]">
        <span className="text-[18px] font-bold text-primary-900">
          Entidade não encontrada.
        </span>
        <span className="text-[15px] text-primary-400">
          Verifique o link ou escolha a entidade na lista.
        </span>
        <Link href="/entrada" className="text-[15px] font-semibold text-primary-700 underline">
          Ir para a página de entrada
        </Link>
      </div>
    );
  }

  return <EntityAutoSelect entity={entity} />;
}
