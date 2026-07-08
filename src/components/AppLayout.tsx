"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SwapServiceBar from "./SwapServiceBar";
import { useSelectedEntity } from "@/context/SelectedEntityContext";

export default function AppLayout({
  children,
  hideSwapBar = false,
}: {
  children: React.ReactNode;
  hideSwapBar?: boolean;
}) {
  const { entity, hydrated } = useSelectedEntity();
  const router = useRouter();

  // Regra da plataforma: as páginas internas exigem uma entidade selecionada.
  // Sem entidade, o utilizador é reencaminhado para a página de entrada.
  useEffect(() => {
    if (hydrated && !entity) router.replace("/entrada");
  }, [hydrated, entity, router]);

  if (!hydrated || !entity) {
    return (
      <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
        <span className="text-[15px] text-primary-400">A carregar…</span>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-[316px] mt-[72px]">
        {!hideSwapBar && <SwapServiceBar />}
        <div className="px-[32px] pt-[40px] pb-[40px]">{children}</div>
      </main>
    </div>
  );
}
