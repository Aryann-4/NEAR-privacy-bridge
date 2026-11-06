import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  createCommitment,
  shortHash,
  verifyCommitment,
  type CommitmentRecord,
} from "../lib/commitment";

export type BridgeRecord = {
  id: string;
  commitment: string;
  amount: string;
  createdAt: number;
};

type BridgeCardProps = {
  balance: string | null;
  onComplete: (record: BridgeRecord) => void;
};

type Mode = "bridge" | "redeem";
type Step = "idle" | "generating" | "done";
type RedeemState = "idle" | "verifying" | "verified" | "invalid";

function NearMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6.5 18V6h2.9l5.2 7V6h2.9v12h-2.9l-5.2-7v7H6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HashRow({
  label,
  value,
  tone = "neutral",
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "secret";
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-3.5 ${
        tone === "secret"
          ? "border-amber-500/20 bg-amber-500/[0.05]"
          : "border-white/[0.07] bg-ink-900/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {tone === "secret" ? (
            <KeyRound className="h-3 w-3 text-amber-400" />
          ) : (
            <Fingerprint className="h-3 w-3" />
          )}
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-zinc-300">
        {value}
      </p>
    </div>
  );
}

export default function BridgeCard({ balance, onComplete }: BridgeCardProps) {
  const [mode, setMode] = useState<Mode>("bridge");
  const [amount, setAmount] = useState("1.0");
  const [step, setStep] = useState<Step>("idle");
  const [record, setRecord] = useState<CommitmentRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [redeemCommitment, setRedeemCommitment] = useState("");
  const [redeemSecret, setRedeemSecret] = useState("");
  const [redeemState, setRedeemState] = useState<RedeemState>("idle");

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  const handleBridge = async () => {
    if (!amountValid) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setError(null);
    setStep("generating");

    try {
      const next = await createCommitment(amount);
      // Give the proof step a moment so the state transition is legible.
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      setRecord(next);
      setStep("done");
      onComplete({
        id: next.id,
        commitment: next.commitment,
        amount: next.amount,
        createdAt: next.createdAt,
      });
    } catch (cause) {
      console.error("Failed to create commitment:", cause);
      setError("Could not generate the commitment. Please try again.");
      setStep("idle");
    }
  };

  const resetBridge = () => {
    setStep("idle");
    setRecord(null);
    setAmount("1.0");
    setError(null);
  };

  const downloadClaim = () => {
    if (!record) return;
    const payload = {
      protocol: "NEAR x Midnight Privacy Bridge",
      network: "testnet",
      commitment: record.commitment,
      secret: record.secret,
      amount: record.amount,
      createdAt: new Date(record.createdAt).toISOString(),
      note: "Keep this file private. The secret is the only way to redeem the deposit.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `midnight-claim-${record.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    setError(null);
    setRedeemState("verifying");

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const valid = await verifyCommitment(redeemCommitment, redeemSecret);
      setRedeemState(valid ? "verified" : "invalid");
    } catch (cause) {
      console.error("Commitment verification failed:", cause);
      setRedeemState("invalid");
    }
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-base font-semibold text-white">
            Bridge assets
          </h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            NEAR → Midnight · private settlement
          </p>
        </div>

        <div className="flex rounded-full border border-white/[0.07] bg-ink-900 p-1">
          {(["bridge", "redeem"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError(null);
              }}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium capitalize transition-all duration-200 ${
                mode === item
                  ? "bg-white text-ink-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {mode === "bridge" && step !== "done" && (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-white/[0.07] bg-ink-900/70 p-4">
              <div className="flex items-center justify-between">
                <span className="label">From</span>
                <span className="text-[11px] text-zinc-500">
                  Balance {balance ?? "—"} NEAR
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white">
                    <NearMark className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">NEAR</p>
                    <p className="whitespace-nowrap text-[10px] text-zinc-500">
                      NEAR Protocol
                    </p>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError(null);
                  }}
                  className="w-full bg-transparent text-right font-display text-[2rem] font-semibold tracking-tight text-white outline-none placeholder:text-zinc-700"
                  placeholder="0.0"
                  aria-label="Amount to bridge"
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-zinc-500">
                  Testnet
                </span>
                <button
                  type="button"
                  onClick={() => balance && setAmount(balance)}
                  className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 transition-colors hover:text-amber-300"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="relative -my-1 flex h-10 items-center justify-center">
              <div className="absolute inset-x-7 top-1/2 border-t border-dashed border-white/10" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-ink-850 text-zinc-400">
                <ArrowDown className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-ink-900/70 p-4">
              <div className="flex items-center justify-between">
                <span className="label">To</span>
                <span className="flex items-center gap-1 text-[11px] text-violet-300/80">
                  <ShieldCheck className="h-3 w-3" />
                  Shielded
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <Moon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Midnight</p>
                    <p className="text-[10px] text-zinc-500">ZK settlement layer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold text-zinc-300">
                    {amountValid ? numericAmount.toFixed(2) : "0.00"}
                  </p>
                  <p className="text-[10px] text-zinc-600">private balance</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.015] px-4 py-3.5">
              {[
                ["Bridge fee", "0.10%"],
                ["Relayer fee", "0.002 NEAR"],
                ["Privacy", "1-of-N commitment"],
                ["Est. settlement", "~12 sec"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">{label}</span>
                  <span className="font-mono text-[11px] text-zinc-300">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-3 text-[11px] text-red-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleBridge}
              disabled={step === "generating" || !amountValid}
              className="btn-amber mt-4 h-[52px] w-full"
            >
              {step === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating zero-knowledge commitment…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Generate private commitment
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[10px] text-zinc-600">
              Testnet preview · commitment is generated locally · no funds move
            </p>
          </div>
        )}

        {mode === "bridge" && step === "done" && record && (
          <div className="animate-fade-up">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-200">
                  Commitment created
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-200/60">
                  {record.amount} NEAR is ready to be claimed privately on Midnight.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <HashRow
                label="Commitment · public"
                value={record.commitment}
                copied={copied === "commitment"}
                onCopy={() => copy("commitment", record.commitment)}
              />
              <HashRow
                label="Secret · private witness"
                value={record.secret}
                tone="secret"
                copied={copied === "secret"}
                onCopy={() => copy("secret", record.secret)}
              />
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3.5 py-3 text-[10.5px] leading-relaxed text-amber-200/70">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              Save the secret before closing this screen. It never leaves your
              browser and cannot be recovered.
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={downloadClaim} className="btn-ghost py-3">
                <Download className="h-3.5 w-3.5" />
                Claim file
              </button>
              <button type="button" onClick={resetBridge} className="btn-primary py-3">
                <RotateCcw className="h-3.5 w-3.5" />
                Bridge again
              </button>
            </div>
          </div>
        )}

        {mode === "redeem" && (
          <div className="animate-fade-in">
            <div className="flex items-start gap-2.5 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] px-4 py-3">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
              <p className="text-[11px] leading-relaxed text-violet-200/70">
                Verify a commitment locally before submitting the private claim to
                Midnight. The secret is never broadcast.
              </p>
            </div>

            <div className="mt-4">
              <label className="label" htmlFor="redeem-commitment">
                Commitment hash
              </label>
              <input
                id="redeem-commitment"
                value={redeemCommitment}
                onChange={(event) => {
                  setRedeemCommitment(event.target.value);
                  setRedeemState("idle");
                }}
                placeholder="0x…"
                className="field mt-2 font-mono text-[11px]"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div className="mt-3.5">
              <label className="label" htmlFor="redeem-secret">
                Secret witness
              </label>
              <input
                id="redeem-secret"
                type="password"
                value={redeemSecret}
                onChange={(event) => {
                  setRedeemSecret(event.target.value);
                  setRedeemState("idle");
                }}
                placeholder="64-character hex secret"
                className="field mt-2 font-mono text-[11px]"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-3 text-[11px] text-red-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {redeemState === "verified" && (
              <div className="mt-4 animate-fade-up rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <BadgeCheck className="h-4 w-4 text-emerald-400" />
                  Proof verified
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-200/60">
                  SHA-256(secret) matches commitment{" "}
                  <span className="font-mono text-emerald-200/80">
                    {shortHash(redeemCommitment, 8, 6)}
                  </span>
                  . A relayer can now unlock the private balance on Midnight.
                </p>
              </div>
            )}

            {redeemState === "invalid" && (
              <div className="mt-4 animate-fade-up rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Proof rejected
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-red-200/60">
                  The secret does not hash to this commitment. Check both values and
                  try again.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={
                redeemState === "verifying" ||
                !redeemCommitment.trim() ||
                !redeemSecret.trim()
              }
              className="btn-primary mt-4 w-full py-3.5"
            >
              {redeemState === "verifying" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying witness…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify commitment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
