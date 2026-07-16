"use client";

import { useSelectedChannel, CANONICAL_ORDER } from "@/context/SelectedChannelContext";
import ModeSwitch from "@/components/ModeSwitch";

// Pastilha de canal. O canal ativo fica preenchido; os sem dados ficam cinzentos/inativos
// (em vez de desaparecerem) — para o utilizador ver sempre o conjunto completo de canais
// e perceber que "não há dados", em vez de ter a lista a mudar de forma implícita.
function ChannelPill({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      aria-pressed={active}
      title={disabled ? "Sem dados disponíveis para este canal" : undefined}
      className={`text-[14px] rounded-[15px] px-[14px] py-[7px] transition-colors ${
        disabled
          ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
          : active
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

  // Mostra sempre o conjunto canónico de canais + quaisquer extra específicos da entidade
  // (ex.: "E-clic"), marcando como inativos os que esta entidade não tem de facto.
  const extra = channels.filter((c) => !CANONICAL_ORDER.includes(c)).sort((a, b) => a.localeCompare(b));
  const allChannels = [...CANONICAL_ORDER, ...extra];
  const hasAnyChannel = channels.length > 0;

  return (
    <div className="bg-secondary-200 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[10px] px-[32px] py-[16px] w-full">
      <ModeSwitch />
      <div className="bg-[#B5E0FF] rounded-[10px] px-[12px] py-[10px] w-full">
        {channelsLoading ? (
          <span className="text-[14px] text-primary-800">A carregar canais…</span>
        ) : (
          <div className="flex flex-wrap items-center gap-[8px]">
            <ChannelPill
              label="Todos os canais"
              active={selectedChannel === null}
              disabled={!hasAnyChannel}
              onClick={() => setSelectedChannel(null)}
            />
            {allChannels.map((c) => (
              <ChannelPill
                key={c}
                label={c}
                active={selectedChannel === c}
                disabled={!channels.includes(c)}
                onClick={() => setSelectedChannel(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
