"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelectedEntity, type SelectedEntity } from "@/context/SelectedEntityContext";

export function EntityAutoSelect({ entity }: { entity: SelectedEntity }) {
  const router = useRouter();
  const { setEntity } = useSelectedEntity();

  useEffect(() => {
    setEntity(entity);
    router.replace("/dashboard");
  }, [entity, setEntity, router]);

  return (
    <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
      <span className="text-[15px] text-primary-400">A entrar em {entity.name}…</span>
    </div>
  );
}
