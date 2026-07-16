"use client";

import { useSelectedChannel } from "@/context/SelectedChannelContext";

// Alternador de lente Serviço | Canal. Vive dentro do banner (no lugar do antigo título).
function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-[14px] rounded-[8px] px-[16px] py-[6px] transition-colors ${
        active ? "bg-secondary-800 text-white font-semibold" : "bg-transparent text-secondary-900 font-medium hover:bg-secondary-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function ModeSwitch() {
  const { viewMode, setViewMode } = useSelectedChannel();
  return (
    <div className="flex items-center justify-between w-full">
      <p className="font-semibold text-[16px] leading-[23px] text-primary-900">
        {viewMode === "service" ? "Serviço Selecionado" : "Canal Selecionado"}
      </p>
      <div className="flex items-center gap-[8px]">
        <span className="text-[14px] text-neutral-800">Ver por</span>
        <div className="inline-flex items-center gap-[4px] bg-white rounded-[10px] p-[3px] w-fit">
          <ModeTab label="Serviço" active={viewMode === "service"} onClick={() => setViewMode("service")} />
          <ModeTab label="Canal" active={viewMode === "channel"} onClick={() => setViewMode("channel")} />
        </div>
      </div>
    </div>
  );
}
