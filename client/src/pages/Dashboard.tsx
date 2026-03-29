import { motion } from "framer-motion";
import { ArrowUpRight, CreditCard, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";

export default function Dashboard() {
  const { user, transactions, loans, investments, notifications, contacts } = useApp();
  const [, setLocation] = useLocation();
  const [showBalance, setShowBalance] = useState(true);
  const activeLoan = loans
    .filter((item) => item.status === "disbursed")
    .sort((a, b) => {
      const aTime = a.nextRepaymentAt ? new Date(a.nextRepaymentAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.nextRepaymentAt ? new Date(b.nextRepaymentAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })[0];
  const activeInvestment = investments.find((item) => item.status === "active");

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <section className="hero-panel px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Banking overview</p>
            <h1 className="mt-3 font-display text-3xl text-white sm:text-5xl">{user?.fullName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/76">
              Wallet-first banking with investment access, internal transfers, and footprint-driven credit decisions.
            </p>
          </div>
          <div className="glass-card w-full max-w-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/54">Available balance</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                {showBalance ? formatCurrency(user?.walletBalance ?? 0) : "******"}
              </h2>
              <button onClick={() => setShowBalance((prev) => !prev)} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                {showBalance ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => setLocation("/wallet")} className="btn-solid-light">
                Send money
              </button>
              <button onClick={() => setLocation("/investments")} className="btn-outline-light">
                Invest funds
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Wallet balance", value: formatCurrency(user?.walletBalance ?? 0), icon: WalletCards },
          { label: "Unread alerts", value: String(notifications.filter((item) => !item.read).length), icon: ShieldCheck },
          { label: "Active facilities", value: String(loans.filter((item) => item.status === "disbursed").length), icon: CreditCard },
          { label: "Investment positions", value: String(investments.filter((item) => item.status === "active").length), icon: TrendingUp },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="surface-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className="icon-shell icon-shell-sm">
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-5 text-3xl font-semibold text-slate-950">{item.value}</p>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Money movement</h2>
            </div>
            <button onClick={() => setLocation("/wallet")} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
              View wallet <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {transactions.slice(0, 5).map((item) => (
              <div key={item.id} className="list-row">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{item.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.counterpartyName} | {formatDate(item.createdAt)} | {formatTime(item.createdAt)}
                  </p>
                </div>
                <p className={`text-right text-sm font-semibold ${item.direction === "credit" ? "text-emerald-700" : "text-slate-950"}`}>
                  {item.direction === "credit" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Credit position</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Loan readiness</h2>
            {activeLoan ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                  <p className="text-sm text-white/60">{activeLoan.productName}</p>
                  <p className="mt-3 text-3xl font-semibold">{formatCurrency(activeLoan.amountApproved)}</p>
                  <p className="mt-2 text-sm text-white/74">Installment plan: {activeLoan.tenureMonths} monthly payments</p>
                  <p className="mt-1 text-sm text-white/74">
                    Next repayment: {activeLoan.nextRepaymentAt ? formatDate(activeLoan.nextRepaymentAt) : "Not scheduled"}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-600" style={{ width: `${Math.min((activeLoan.score / 100) * 100, 100)}%` }} />
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-border p-5 text-sm text-muted-foreground">
                No active loan yet. Your footprint becomes stronger as wallet activity and KYC depth improve.
              </div>
            )}
          </div>

          <div className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Relationship network</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Known counterparties</h2>
            <div className="mt-5 space-y-3">
              {contacts.slice(0, 3).map((item) => (
                <div key={item.id} className="list-row">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{item.fullName}</p>
                    <p className="text-xs text-muted-foreground">{item.accountNumber}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.segment}</span>
                </div>
              ))}
            </div>
          </div>

          {activeInvestment ? (
            <div className="surface-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Investment position</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{activeInvestment.productName}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current value</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(activeInvestment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily yield</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatCurrency(activeInvestment.dailyYield)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
