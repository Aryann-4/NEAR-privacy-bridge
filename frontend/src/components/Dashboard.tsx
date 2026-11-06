import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Clock3,
  Fingerprint,
  Github,
  Lock,
  Moon,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Logo from "./Logo";
import AccountModal from "./AccountModal";
import BridgeCard, { type BridgeRecord } from "./BridgeCard";
import { shortHash, timeAgo } from "../lib/commitment";

const STORAGE_KEY = "near-midnight-activity-v1";

type DashboardProps = {
  accountId: string;
  balance: string | null;
  onSignOut: () => Promise<void>;
};

type ActivityItem = BridgeRecord & { status: "Locked" | "Relayed" | "Proving" };

const sampleActivity: ActivityItem[] = [
  {
    id: "sample-01",
    commitment: "0x91c4a7f0b83d5e2619fa0c7d84b3e5a1f6d2098c7b3a5e1d4c8f0a2b6e9d3c71",
    amount: "24.50",
    createdAt: Date.now() - 1000 * 60 * 3,
    status: "Relayed",
  },
  {
    id: "sample-02",
    commitment: "0x3e8b1d6f9a2c4e7b0d5f8a1c3e6b9d2f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b",
    amount: "8.00",
    createdAt: Date.now() - 1000 * 60 * 12,
    status: "Locked",
  },
  {
    id: "sample-03",
    commitment: "0xa5f2c9e6b3d8a1f4c7e0b3d6a9f2c5e8b1d4a7f0c3e6b9d2a5f8c1e4b7d0a3f6",
    amount: "112.20",
    createdAt: Date.now() - 1000 * 60 * 29,
    status: "Relayed",
  },
];

const gradients = [
  "from-amber-400 to-orange-600",
  "from-violet-400 to-fuchsia-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
];

function gradientFor(value: string) {
  const sum = value
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return gradients[sum % gradients.length];
}

function loadRecords(): BridgeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function shortAccount(accountId: string) {
  if (accountId.length <= 20) return accountId;
  return `${accountId.slice(0, 8)}…${accountId.slice(-6)}`;
}

const stats = [
  { label: "Total value locked", value: "$2.41M", hint: "across both chains" },
  { label: "Private volume", value: "$18.7M", hint: "since genesis" },
  { label: "Commitments", value: "12,408", hint: "all-time" },
  { label: "Avg. settlement", value: "11.8s", hint: "NEAR → Midnight" },
];

const statusStyles: Record<ActivityItem["status"], string> = {
  Relayed: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300",
  Locked: "border-amber-500/20 bg-amber-500/[0.07] text-amber-300",
  Proving: "border-violet-500/20 bg-violet-500/[0.07] text-violet-300",
};

export default function Dashboard({
  accountId,
  balance,
  onSignOut,
}: DashboardProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const [records, setRecords] = useState<BridgeRecord[]>(loadRecords);

  const activity = useMemo<ActivityItem[]>(
    () => [
      ...records.map((record) => ({ ...record, status: "Locked" as const })),
      ...sampleActivity,
    ],
    [records]
  );

  const addRecord = (record: BridgeRecord) => {
    setRecords((previous) => {
      const next = [record, ...previous].slice(0, 4);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be blocked; the in-memory list still updates.
      }
      return next;
    });
  };

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-7">
            <Logo />
            <nav className="hidden items-center gap-6 text-[12px] font-medium text-zinc-500 md:flex">
              <a href="#overview" className="text-zinc-200 transition-colors hover:text-white">
                Overview
              </a>
              <a href="#bridge" className="transition-colors hover:text-zinc-200">
                Bridge
              </a>
              <a href="#activity" className="transition-colors hover:text-zinc-200">
                Activity
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Testnet
            </span>

            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 pr-3 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.06]"
              aria-label="Open wallet overview"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(
                  accountId
                )} font-display text-[11px] font-bold text-ink-950`}
              >
                {accountId.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[130px] truncate font-mono text-[11px] text-zinc-300 sm:block">
                {shortAccount(accountId)}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>
          </div>
        </div>
      </header>

      <main id="overview" className="shell scroll-mt-24 pb-16 pt-9 sm:pt-10">
        <div className="animate-fade-up">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <span>Overview</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">Privacy bridge</span>
          </div>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.6rem] sm:leading-[1.08]">
                Private value transfer, simplified.
              </h1>
              <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-zinc-500">
                Lock on NEAR, redeem on Midnight. One commitment, zero linkable
                history between the two.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="chip border-white/[0.07] text-[10px]">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Non-custodial
              </span>
              <a href="#bridge" className="btn-ghost text-[12px]">
                Bridge now
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="panel mt-8 animate-fade-up overflow-hidden"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3 sm:px-6">
            <span className="label">Protocol overview</span>
            <span className="text-[10px] text-zinc-600">Preview metrics</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`px-5 py-4 sm:px-6 sm:py-5 ${
                  index % 2 === 1 ? "border-l border-white/[0.05]" : ""
                } ${index > 1 ? "border-t border-white/[0.05] sm:border-t-0" : ""} ${
                  index > 0 ? "sm:border-l sm:border-white/[0.05]" : ""
                }`}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-600">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div
            id="bridge"
            className="scroll-mt-24 animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            <BridgeCard balance={balance} onComplete={addRecord} />
          </div>

          <div
            className="space-y-5 animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            <div className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="label">Connected wallet</span>
                <Wallet className="h-3.5 w-3.5 text-zinc-600" />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(
                    accountId
                  )} font-display text-sm font-bold text-ink-950`}
                >
                  {accountId.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[12px] text-zinc-200">
                    {accountId}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">NEAR Testnet</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                    Balance
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium text-zinc-200">
                    {balance ?? "—"}
                    <span className="ml-1 text-[9px] text-zinc-500">NEAR</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                    Privacy
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium text-zinc-200">
                    1-of-N
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="btn-ghost mt-3 w-full py-2.5 text-[12px]"
              >
                Manage wallet
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div id="activity" className="panel scroll-mt-24 p-5">
              <div className="flex items-center justify-between">
                <span className="label">Recent transfers</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                  <Clock3 className="h-3 w-3" />
                  live
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {activity.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-500">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-zinc-200">
                        {item.amount} NEAR
                      </p>
                      <p className="truncate font-mono text-[9.5px] text-zinc-600">
                        {shortHash(item.commitment, 10, 6)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                          statusStyles[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="mt-1 text-[9px] text-zinc-600">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-t border-white/[0.05] pt-3 text-[9.5px] leading-relaxed text-zinc-600">
                Commitments are truncated. Sender and receiver stay unlinkable on
                Midnight.
              </p>
            </div>
          </div>
        </div>

        <section
          className="panel mt-5 animate-fade-up p-5 sm:p-6"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between">
            <span className="label">How it works</span>
            <span className="font-mono text-[10px] text-zinc-700">
              private by construction
            </span>
          </div>

          <div className="relative mt-5 grid gap-4 sm:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-5 hidden border-t border-dashed border-white/[0.08] sm:block" />
            {[
              {
                icon: Lock,
                step: "01",
                title: "Lock on NEAR",
                body: "Deposit NEAR to the bridge contract. It stores only your commitment hash.",
              },
              {
                icon: Fingerprint,
                step: "02",
                title: "Commit privately",
                body: "Your browser hashes a random secret. The secret never leaves the device.",
              },
              {
                icon: Moon,
                step: "03",
                title: "Redeem on Midnight",
                body: "Prove the witness in zero knowledge and claim the shielded balance.",
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div
                key={step}
                className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.035]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-ink-900 text-amber-300 transition-colors group-hover:border-amber-400/25 group-hover:text-amber-200">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-mono text-[10px] text-zinc-700">{step}</span>
                </div>
                <h3 className="mt-3 font-display text-[13.5px] font-semibold text-zinc-200">
                  {title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-5 text-[10.5px] text-zinc-600 sm:flex-row">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-500/70" />
            NEAR × Midnight Privacy Bridge · Testnet preview
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Aryann-4/NEAR-privacy-bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-zinc-300"
            >
              <Github className="h-3 w-3" />
              Source
            </a>
            <a
              href="https://docs.near.org"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-300"
            >
              NEAR docs
            </a>
          </div>
        </footer>
      </main>

      <AccountModal
        open={walletOpen}
        accountId={accountId}
        balance={balance}
        onClose={() => setWalletOpen(false)}
        onSignOut={onSignOut}
      />
    </div>
  );
}
