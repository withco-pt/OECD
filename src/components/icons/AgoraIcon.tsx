import { AGORA_ICONS, type AgoraIconName } from "./agora-icons.generated";

export type { AgoraIconName };

type AgoraIconProps = Omit<React.SVGProps<SVGSVGElement>, "name"> & {
  /** Nome do ícone Ágora (variante line). */
  name: AgoraIconName;
  /** Rótulo acessível. Se ausente, o ícone é tratado como decorativo (aria-hidden). */
  title?: string;
  /** Tamanho em px (largura e altura). Por defeito 1em (acompanha o texto). */
  size?: number | string;
};

/**
 * Ícone do Ágora Design System (variante line).
 *
 * Os SVGs usam `fill="currentColor"`, pelo que a cor segue a `color` do elemento
 * — controlável com classes `text-*` do Tailwind. O tamanho controla-se por
 * classe (ex.: `size-[14px]`, `size-4`); por defeito 1em (acompanha o texto).
 */
export function AgoraIcon({ name, title, size, className, ...rest }: AgoraIconProps) {
  const icon = AGORA_ICONS[name];
  if (!icon) return null;
  return (
    <svg
      viewBox={icon.vb}
      width={size ?? "1em"}
      height={size ?? "1em"}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable={false}
      className={className}
      dangerouslySetInnerHTML={{ __html: title ? `<title>${title}</title>${icon.inner}` : icon.inner }}
      {...rest}
    />
  );
}
