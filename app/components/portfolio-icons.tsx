import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const base = "block shrink-0";

export function IconBolt({ className, title, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...p}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M11 2h4l-2 8h5l-9 12 2-9H6l5-11z"
        opacity={0.95}
      />
    </svg>
  );
}

export function IconRobot({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
      {...p}
    >
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M9 8V6a3 3 0 016 0v2" />
      <circle cx="10" cy="13" r="1.2" fill="currentColor" />
      <circle cx="14" cy="13" r="1.2" fill="currentColor" />
      <path d="M10 17h4" opacity={0.8} />
      <path d="M12 5v1" />
    </svg>
  );
}

export function IconReact({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      aria-hidden
      {...p}
    >
      <ellipse cx="12" cy="12" rx="8" ry="3.5" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPython({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
      {...p}
    >
      <path d="M9 3h4a2 2 0 012 2v2H9a2 2 0 00-2 2v1" />
      <path d="M15 21h-4a2 2 0 01-2-2v-2h6a2 2 0 002-2v-1" />
      <circle cx="9.5" cy="5.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="18.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMongo({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      <path d="M12 3c-1 4-3 6-3 10a6 6 0 0012 0c0-4-2-6-3-10" fill="currentColor" fillOpacity={0.12} />
      <path d="M12 3v18" opacity={0.85} />
      <path d="M10 20c1 1 2 1 2 1s1 0 2-1" />
    </svg>
  );
}

export function IconAI({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
      {...p}
    >
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M8 11h2M14 11h2M10 15h4" />
      <path d="M12 4v2M12 18v2M19 12h-2M7 12H5" opacity={0.65} strokeWidth={1.2} />
    </svg>
  );
}

export function IconTailwind({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      <path d="M4 12c4-6 8-6 12 0s8 6 12 0" opacity={0.35} />
      <path d="M2 14c3.5-5 7-5 10 0s7 5 10 0" opacity={0.55} />
      <path d="M6 16c2.5-3.5 5-3.5 8 0s5.5 3.5 8 0" />
    </svg>
  );
}

export function IconCloud({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
      {...p}
    >
      <path d="M7 18h10a4 4 0 000-8 5 5 0 00-9.7-1.5A3.5 3.5 0 007 18z" />
      <path d="M12 14v4" opacity={0.5} strokeWidth={1.2} />
    </svg>
  );
}

/** WhatsApp brand mark — use with `text-white` on `#25D366` surfaces */
export function IconWhatsApp({ className, ...p }: IconProps) {
  return (
    <svg
      className={[base, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...p}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
