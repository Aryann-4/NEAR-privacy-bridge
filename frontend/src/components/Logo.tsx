type LogoProps = {
  compact?: boolean;
};

export default function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border border-white/10 bg-ink-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent" />
        <svg viewBox="0 0 40 40" className="relative h-10 w-10" aria-hidden="true">
          <path
            d="M11 29V11h4.6l9 11.7V11H29v18h-4.6l-9-11.7V29H11Z"
            fill="#F4F4F5"
          />
          <circle cx="30.5" cy="9.5" r="2.4" fill="#F59E0B" />
        </svg>
      </div>

      {!compact && (
        <div className="leading-none">
          <div className="flex items-center gap-1.5 font-display text-[13px] font-semibold tracking-tight text-white">
            <span>NEAR</span>
            <span className="text-zinc-600">×</span>
            <span className="text-zinc-300">MIDNIGHT</span>
          </div>
          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.28em] text-zinc-500">
            Privacy Bridge
          </p>
        </div>
      )}
    </div>
  );
}
