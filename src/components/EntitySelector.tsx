"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useRouter } from "next/navigation";
import { useSelectedEntity } from "@/context/SelectedEntityContext";

export type Entity = {
  id: string;
  name: string;
  ministry: string | null;
  logo: string | null;
};

export function EntitySelector({
  entities,
  error = false,
}: {
  entities: Entity[];
  error?: boolean;
}) {
  const router = useRouter();
  const { setEntity } = useSelectedEntity();

  // Estado de erro
  if (error) {
    return (
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: 8, padding: "24px 8px", color: "rgb(179,38,30)" }}
      >
        <AgoraIcon name="alert-triangle" className="size-[24px]" />
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          Não foi possível carregar as entidades.
        </span>
        <span style={{ fontSize: 14, color: "rgb(100,113,139)" }}>
          Verifique a ligação à base de dados e tente novamente.
        </span>
      </div>
    );
  }

  // Estado vazio
  if (entities.length === 0) {
    return (
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: 6, padding: "24px 8px", color: "rgb(100,113,139)" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "rgb(2,28,81)" }}>
          Nenhuma entidade disponível.
        </span>
        <span style={{ fontSize: 14 }}>
          Ainda não existem entidades registadas na plataforma.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {entities.map((entity) => (
        <button
          key={entity.id}
          onClick={() => {
            setEntity({ id: entity.id, name: entity.name, area: entity.ministry });
            router.push("/");
          }}
          className="flex flex-row items-center text-left transition-all"
          style={{
            gap: 20,
            textDecoration: "none",
            background: "rgb(229,238,255)",
            border: "1.5px solid rgb(187,209,253)",
            borderRadius: 10,
            padding: "20px 22px",
            boxSizing: "border-box",
            transition:
              "background 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgb(213,228,255)";
            e.currentTarget.style.borderColor = "rgb(95,147,252)";
            e.currentTarget.style.boxShadow = "0px 4px 12px rgba(2,28,81,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgb(229,238,255)";
            e.currentTarget.style.borderColor = "rgb(187,209,253)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Logo tile (ou iniciais quando não há logótipo) */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {entity.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entity.logo}
                alt={entity.name}
                style={{ width: 48, height: 48, objectFit: "contain" }}
              />
            ) : (
              <span
                className="font-bold"
                style={{ fontSize: 20, color: "rgb(0,43,130)", letterSpacing: "0.02em" }}
              >
                {entity.id.toUpperCase().slice(0, 3)}
              </span>
            )}
          </div>

          {/* Nome + área governamental */}
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: 4 }}>
            <span
              className="font-bold"
              style={{ fontSize: 22, lineHeight: 1.25, color: "rgb(2,28,81)" }}
            >
              {entity.name}
            </span>
            {entity.ministry && (
              <span style={{ fontSize: 15, lineHeight: 1.4, color: "rgb(100,113,139)" }}>
                {entity.ministry}
              </span>
            )}
          </div>

          {/* Pill Aceder */}
          <div
            className="flex flex-row items-center flex-shrink-0 font-semibold text-white"
            style={{
              gap: 8,
              background: "rgb(0,43,130)",
              borderRadius: 50,
              padding: "10px 18px",
              fontSize: 15,
              whiteSpace: "nowrap",
            }}
          >
            Aceder
            <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
          </div>
        </button>
      ))}
    </div>
  );
}
