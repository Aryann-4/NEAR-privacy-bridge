import {
  ArrowUpRight,
  BookOpen,
  Fingerprint,
  Github,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Logo from "./Logo";

type LandingProps = {
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
  onClearError: () => void;
};

const wallets = ["Meteor", "Intear", "Nightly", "Ledger", "NEAR CLI"];

const features = [
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    body: "Only a commitment hash crosses to Midnight. Your secret witness never leaves the browser.",
  },
  {
    icon: Fingerprint,
    title: "Zero-knowledge claims",
    body: "Prove ownership of a deposit with a private witness. The Midnight claim is not linked to your NEAR wallet.",
  },
  {
    icon: Zap,
    title: "NEAR-speed settlement",
    body: "Lock on NEAR in seconds, then redeem on Midnight through a permissionless relayer.",
  },
];

export default function Landing({
  onConnect,
  connecting,
  error,
  onClearError,
}: LandingProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="shell flex items-center justify-between pt-6 sm:pt-8">
        <Logo />
        <nav className="flex items-center gap-5 text-[13px] font-medium text-zinc-500">
          <a
            href="https://docs.near.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 transition-colors hover:text-zinc-200 sm:flex"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Docs
          </a>
          <a
            href="https://github.com/Aryann-4/NEAR-privacy-bridge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-zinc-200"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </nav>
      </header>

      <main className="shell flex flex-1 flex-col items-center justify-center pb-16 pt-16 sm:pt-20">
        <div
          className="chip animate-fade-up gap-2 border-amber-500/20 bg-amber-500/[0.06] text-amber-200/90"
          style={{ animationDelay: "40ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
          </span>
          NEAR × Midnight · Testnet
        </div>

        <h1
          className="mt-8 max-w-4xl animate-fade-up text-center font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]"
          style={{ animationDelay: "100ms" }}
        >
          <span className="text-gradient">Move value.</span>
          <br />
          <span className="text-white">Leave no trace.</span>
        </h1>

        <p
          className="mt-6 max-w-xl animate-fade-up text-center text-[15px] leading-relaxed text-zinc-400 sm:text-base"
          style={{ animationDelay: "160ms" }}
        >
          Lock assets on NEAR. Redeem privately on Midnight with a zero-knowledge
          commitment. The secret witness never leaves your browser—and the claim
          reveals only a commitment.
        </p>

        <div
          className="mt-10 w-full max-w-[26rem] animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <div className="panel relative overflow-hidden p-6 shadow-glow">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            <button
              type="button"
              onClick={() => {
                onClearError();
                onConnect();
              }}
              disabled={connecting}
              className="btn-primary group h-14 w-full text-[15px]"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening wallet selector…
                </>
              ) : (
                <>
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink-950">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M6.5 18V6h2.9l5.2 7V6h2.9v12h-2.9l-5.2-7v7H6.5Z"
                        fill="#F4F4F5"
                      />
                    </svg>
                  </span>
                  Connect NEAR Wallet
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-3 text-xs text-red-300">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-red-400/70 transition-colors hover:text-red-200"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Lock className="h-3 w-3" />
              Non-custodial · signed in your wallet
            </div>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                Works with
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {wallets.map((wallet) => (
                  <span
                    key={wallet}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium text-zinc-500"
                  >
                    {wallet}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-zinc-600">
            New to NEAR?{" "}
            <a
              href="https://wallet.testnet.near.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              Create a testnet wallet
            </a>
          </p>
        </div>

        <div
          id="protocol"
          className="mt-20 grid w-full gap-3.5 sm:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className="panel panel-hover group animate-fade-up p-5"
              style={{ animationDelay: `${300 + index * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-amber-300 transition-colors duration-300 group-hover:border-amber-400/20 group-hover:bg-amber-400/[0.08]">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="font-mono text-[10px] text-zinc-700">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-zinc-100">
                {title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500">
                {body}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="shell flex items-center justify-between border-t border-white/[0.05] py-5 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500/70" />
          Built for the NEAR Privacy Hackathon
        </span>
        <span className="font-mono">testnet · v1.0</span>
      </footer>
    </div>
  );
}
