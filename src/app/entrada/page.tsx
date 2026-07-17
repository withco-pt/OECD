import { EntitySelector, type Entity } from "@/components/EntitySelector";
import { supabase } from "@/lib/supabase";
import { LOCAL_ENTITY_LOGOS } from "@/lib/entityLogos";

// Entidades vêm da BD e podem mudar (ex: nome, logótipo) sem novo deploy de código —
// nunca renderizar esta página como estática/cacheada em build, senão fica desatualizada.
export const dynamic = "force-dynamic";

async function getEntities(): Promise<{ entities: Entity[]; error: boolean }> {
  const { data, error } = await supabase
    .from("organizations")
    .select("short_name, name, area_governamental, logo_url, active")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("[entrada] erro ao carregar organizations:", error.message);
    return { entities: [], error: true };
  }

  const entities: Entity[] = (data ?? []).map((o) => ({
    id: o.short_name,
    name: o.name,
    ministry: o.area_governamental,
    logo: o.logo_url ?? LOCAL_ENTITY_LOGOS[o.short_name] ?? null,
  }));

  return { entities, error: false };
}

export default async function EntradaPage() {
  const { entities, error } = await getEntities();

  return (
    <div className="flex flex-col min-h-screen w-full font-sans" style={{ background: "rgb(247,248,250)" }}>

      {/* Hero band */}
      <div
        className="relative flex flex-col items-center overflow-hidden flex-shrink-0"
        style={{
          background: "rgb(3,74,216)",
          padding: "56px 32px 110px",
        }}
      >
        {/* Watermark */}
        <div className="absolute right-[-30px] top-[-20px] opacity-10 pointer-events-none">
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="130" cy="130" r="100" stroke="white" strokeWidth="40" opacity="0.6" />
            <circle cx="130" cy="130" r="50" stroke="white" strokeWidth="20" opacity="0.4" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-[16px] max-w-[760px] text-center z-[1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-arte.png"
            alt="ARTE — Agência para a Reforma Tecnológica do Estado"
            style={{ height: 104, width: "auto", marginBottom: 4 }}
          />

          <h1
            className="text-white font-bold"
            style={{ margin: 0, fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            Matriz para a Avaliação nos Serviços Públicos
          </h1>
          <p
            className="text-white"
            style={{ margin: "6px 0 0", fontSize: 18, lineHeight: 1.5, opacity: 0.88, maxWidth: 620 }}
          >
            Monitorize, compare e melhore os indicadores de qualidade dos serviços públicos.
          </p>
        </div>
      </div>

      {/* Selection panel — overlaps hero */}
      <div className="flex-1 flex flex-col items-center" style={{ padding: "0 32px 56px" }}>
        <div
          className="w-full flex flex-col"
          style={{
            maxWidth: 680,
            marginTop: -70,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0px 8px 28px rgba(2,28,81,0.12)",
            padding: 40,
            boxSizing: "border-box",
            gap: 24,
            zIndex: 2,
          }}
        >
          {/* Panel header */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span
              className="font-bold"
              style={{ fontSize: 28, lineHeight: 1.2, color: "rgb(2,28,81)" }}
            >
              Selecione a sua Entidade
            </span>
            <span
              style={{ fontSize: 16, lineHeight: 1.5, color: "rgb(100,113,139)" }}
            >
              Escolha a entidade para aceder à respetiva matriz de indicadores.
            </span>
          </div>

          {/* Entity cards (dados reais do Supabase) */}
          <EntitySelector entities={entities} error={error} />
        </div>

        {/* Footer note */}
        <span
          className="text-center"
          style={{ marginTop: 28, fontSize: 13, lineHeight: 1.4, color: "rgb(140,150,166)" }}
        >
          Uma plataforma da ARTE — Agência para a Reforma Tecnológica do Estado
        </span>
      </div>
    </div>
  );
}
