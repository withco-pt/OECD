"use client";


import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { useRouter } from "next/navigation";

export default function SwapServiceBar() {
  const { selectedService, openSwap } = useSelectedService();
  const router = useRouter();

  return (
    <div className="bg-secondary-200 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[10px] px-[32px] py-[16px] w-full">
      <p className="font-semibold text-[16px] leading-[23px] text-primary-900">Serviço Selecionado</p>
      <div className="bg-[#B5E0FF] flex items-center justify-between px-[12px] py-[6px] rounded-[10px] w-full gap-[12px]">
        <div className="flex gap-[8px] items-center min-w-0">
          <AgoraIcon name="like" className="size-[20px] text-neutral-400 shrink-0 cursor-not-allowed" />
          <span className="font-semibold text-[20px] leading-[27px] text-primary-900 truncate">
            {selectedService ? selectedService.name : "Nenhum serviço selecionado"}
          </span>
        </div>
        <div className="flex gap-[8px] items-center shrink-0">
          <button
            onClick={() => selectedService && router.push(`/catalogo/${selectedService.id}`)}
            disabled={!selectedService}
            className="bg-secondary-100 border border-secondary-800 hover:bg-white transition-colors flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[15px] h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-medium text-[14px] leading-[20px] text-secondary-800 whitespace-nowrap">
              Ver Detalhe
            </span>
            <AgoraIcon name="arrow-right-anchor" className="size-[18px] text-secondary-800" />
          </button>
          <button
            onClick={openSwap}
            className="bg-secondary-800 hover:bg-secondary-900 transition-colors flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[15px] h-[36px]"
          >
            <span className="font-medium text-[14px] leading-[20px] text-white whitespace-nowrap">
              Alterar Serviço
            </span>
            <AgoraIcon name="refresh-ccw" className="size-[18px] text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
