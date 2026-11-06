export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.045),transparent_55%)]" />

      <div className="absolute -left-40 -top-52 h-[36rem] w-[36rem] animate-aurora rounded-full bg-violet-600/[0.16] blur-[130px]" />
      <div className="absolute -right-48 top-[6%] h-[32rem] w-[32rem] animate-aurora-slow rounded-full bg-amber-500/[0.13] blur-[140px]" />
      <div className="absolute bottom-[-24%] left-[32%] h-[28rem] w-[28rem] animate-float rounded-full bg-sky-500/[0.08] blur-[130px]" />

      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 78%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
