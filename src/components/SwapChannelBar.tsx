"use client";

import { useSelectedChannel } from "@/context/SelectedChannelContext";
import ModeSwitch from "@/components/ModeSwitch";

// Pastilha de canal. O canal ativo fica preenchido; os restantes com contorno.
function ChannelPill({
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
      className={`text-[14px] rounded-[15px] px-[14px] py-[7px] transition-colors ${
        active
          ? "bg-secondary-800 text-white border border-secondary-800 font-medium"
          : "bg-white text-secondary-900 border border-secondary-400 hover:bg-secondary-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function SwapChannelBar() {
  const { channels, channelsLoading, selectedChannel, setSelectedChannel } = useSelectedChannel();

  return (
    <div className="bg-secondary-200 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[10px] px-[32px] py-[16px] w-full">
      <ModeSwitch />
      <div className="bg-[#B5E0FF] rounded-[10px] px-[12px] py-[10px] w-full">
        {channelsLoading ? (
          <span className="text-[14px] text-primary-800">A carregar canais…</span>
        ) : channels.length === 0 ? (
          <span className="text-[14px] text-primary-800">Esta entidade não tem dados por canal.</span>
        ) : (
          <div className="flex flex-wrap items-center gap-[8px]">
            <ChannelPill
              label="Todos os canais"
              active={selectedChannel === null}
              onClick={() => setSelectedChannel(null)}
            />
            {channels.map((c) => (
              <ChannelPill
                key={c}
                label={c}
                active={selectedChannel === c}
                onClick={() => setSelectedChannel(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
