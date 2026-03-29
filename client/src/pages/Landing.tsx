import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Landmark,
  ShieldCheck,
  Sprout,
  WalletCards,
} from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/format";

const features = [
  {
    title: "Instant internal transfers",
    description: "Wallet-to-wallet transfers settle instantly inside the DDB ledger with full audit references.",
    icon: WalletCards,
  },
  {
    title: "Footprint-based lending",
    description: "Loan decisions are shaped by KYC depth, revenue footprint, wallet activity, and risk posture.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Accessible investments",
    description: "Treasury-style products start from low entry amounts with daily yield visibility and T+1 liquidity.",
    icon: Landmark,
  },
  {
    title: "Compliance-first design",
    description: "Tiered KYC, ledgers, audit trails, and structured controls are built into the operating model.",
    icon: ShieldCheck,
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  
  // Demo stats (in production, these would come from an API endpoint)
  const demoStats = {
    activeWallets: 2847,
    loanFacilities: 342,
    totalAUM: 48500000,
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(13,148,136,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.16),transparent_24%)]" />
      <div className="relative mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-card flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="brand-badge brand-badge-sm">D</div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Digital Development Bank</p>
              <h1 className="font-display text-xl text-slate-900">DDB Nigeria</h1>
            </div>
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <button onClick={() => setLocation("/login")} className="btn-ghost max-[420px]:flex-1 max-[420px]:justify-center">
              Sign in
            </button>
            <button onClick={() => setLocation("/signup")} className="btn-primary max-[420px]:flex-1 max-[420px]:justify-center">
              Open account
            </button>
          </div>
        </header>

        <section className="grid gap-8 pb-12 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="hero-panel"
          >
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/82 sm:tracking-[0.28em]">
              <BadgeCheck size={14} />
              Development finance, delivered digitally
            </div>
            <h2 className="mt-6 max-w-3xl font-display text-3xl leading-[1.04] text-white sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              A banking platform for Nigerians building households, farms, shops, and industries.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
              DDB combines wallet banking, internal transfers, structured investments, and smarter credit for retail users and SMEs in one responsive platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setLocation("/signup")} className="btn-hero">
                Create account <ArrowRight size={18} />
              </button>
              <button onClick={() => setLocation("/login")} className="btn-outline-light">
                Explore demo
              </button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="hero-stat">
                <span>Active wallets</span>
                <strong>{demoStats.activeWallets.toLocaleString()}</strong>
              </div>
              <div className="hero-stat">
                <span>Loan facilities</span>
                <strong>{demoStats.loanFacilities}</strong>
              </div>
              <div className="hero-stat">
                <span>Tracked balances</span>
                <strong>{formatCurrency(demoStats.totalAUM)}</strong>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            className="surface-card overflow-hidden p-0"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-border/70 bg-slate-950 px-6 py-6 text-white md:border-b-0 md:border-r md:border-white/10">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 sm:tracking-[0.32em]">Investment Engine</p>
                <h3 className="mt-4 font-display text-2xl sm:text-3xl">Daily yield, transparent maturity, T+1 liquidity.</h3>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  Structured to feel like a serious financial product, not a decorative savings card.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/50 sm:tracking-[0.24em]">Current live product</p>
                  <p className="mt-2 text-lg font-semibold">Treasury Income Vault</p>
                  <p className="mt-1 text-sm text-amber-300">12% annualized yield</p>
                </div>
              </div>
              <div className="bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_42%,#f8fafc_100%)] px-6 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.32em]">Development mandate</p>
                    <h3 className="mt-4 font-display text-2xl text-slate-950 sm:text-3xl">Credit that reads context, not only collateral.</h3>
                  </div>
                  <Sprout className="text-emerald-700" size={28} />
                </div>
                <ul className="mt-6 space-y-4 text-sm text-slate-700">
                  <li className="feature-bullet">Internal wallets and ledger-aware transaction history</li>
                  <li className="feature-bullet">SME and consumer flows shaped around Nigerian usage patterns</li>
                  <li className="feature-bullet">Responsive desktop and mobile banking shell</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="pb-12">
          <div className="grid gap-5 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
                  className="surface-card p-6"
                >
                  <div className="icon-shell">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
