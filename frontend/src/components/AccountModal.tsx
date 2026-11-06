import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

type AccountModalProps = {
  open: boolean;
  accountId: string;
  balance: string | null;
  onClose: () => void;
  onSignOut: () => Promise<void>;
};

const avatarGradients = [
  "from-amber-400 to-orange-600",
  "from-violet-400 to-fuchsia-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-red-600",
];

function gradientFor(accountId: string) {
  const sum = accountId
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return avatarGradients[sum % avatarGradients.length];
}

export default function AccountModal({
  open,
  accountId,
  balance,
  onClose,
  onSignOut,
}: AccountModalProps) {
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setSigningOut(false);
    }
  }, [open]);

  if (!open) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be unavailable on insecure origins.
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
      onClose();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Wallet overview"
    >
      <div
        className="panel relative w-full max-w-sm overflow-hidden p-6 animate-fade-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="flex items-start justify-between">
          <div>
            <p className="label">Wallet overview</p>
            <h2 className="mt-1.5 font-display text-lg font-semibold text-white">
              Your account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-zinc-500 transition-colors hover:border-white/15 hover:text-white"
            aria-label="Close wallet overview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientFor(
              accountId
            )} font-display text-2xl font-bold text-ink-950 shadow-[0_16px_40px_-16px_rgba(245,158,11,0.5)]`}
          >
            {accountId.slice(0, 1).toUpperCase() || "N"}
          </div>
          <div className="mt-4 flex max-w-full items-center gap-2">
            <span className="break-all font-mono text-[13px] text-zinc-200">
              {accountId}
            </span>
            <button
              type="button"
              onClick={copyAddress}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Copy account ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <span className="chip mt-3 border-emerald-500/20 bg-emerald-500/[0.07] text-[10px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Connected · Testnet
          </span>
        </div>

        <div className="mt-6 space-y-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <Wallet className="h-3.5 w-3.5" />
              Balance
            </span>
            <span className="font-mono text-xs font-medium text-zinc-100">
              {balance ?? "—"} NEAR
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5">
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Network
            </span>
            <span className="text-xs font-medium text-zinc-100">NEAR Testnet</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5">
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <ExternalLink className="h-3.5 w-3.5" />
              Explorer
            </span>
            <a
              href={`https://testnet.nearblocks.io/address/${accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
            >
              NEARBlocks
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-ghost mt-4 w-full border-red-500/15 py-3 text-red-300 hover:border-red-500/30 hover:bg-red-500/[0.07] hover:text-red-200"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {signingOut ? "Disconnecting…" : "Disconnect wallet"}
        </button>

        <p className="mt-4 text-center text-[10px] text-zinc-600">
          Secured by NEAR Connect · keys never leave your wallet
        </p>
      </div>
    </div>
  );
}
