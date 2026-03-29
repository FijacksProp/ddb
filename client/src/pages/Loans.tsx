import { motion } from "framer-motion";
import { BadgeCheck, Building2, CircleAlert } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/lib/format";

const products = [
  { name: "SME Working Capital", cap: 750000, tenure: 6, description: "Inventory, payroll support, and operational liquidity for SMEs." },
  { name: "Education Support", cap: 250000, tenure: 9, description: "Structured short-term finance for tuition or professional development." },
  { name: "Agri Input Facility", cap: 500000, tenure: 8, description: "Seasonal credit aligned to farm inputs and harvest windows." },
];

const scoreRubric = [
  {
    title: "Cash Flow & Capacity",
    points: 35,
    details: "Consistent Income/Deposits (15), Savings Retention (10), Outflow-to-Inflow Ratio (10).",
  },
  {
    title: "Account Behavior & Reliability",
    points: 35,
    details: "Account Tenure (15), Consistent Bill Payments (10), Transaction Frequency (10).",
  },
  {
    title: "Digital Footprint & Security",
    points: 30,
    details: "KYC & Identity Verification (15), App Engagement & Security (10), Profile Completeness (5).",
  },
];

export default function Loans() {
  const { loans, requestLoan, user } = useApp();
  const [form, setForm] = useState({
    productName: products[0].name,
    purpose: "Working capital support",
    amount: 200000,
    tenureMonths: 3,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await requestLoan(form);
    if (!result.success && result.application?.decision !== "manual_review") {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  };

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Underwriting posture</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-slate-950 sm:text-4xl">Loans grounded in customer footprint.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            DDB uses a 100-point scorecard aligned to real credit capacity, account reliability, and digital trust indicators.
          </p>
          <div className="mt-6 grid gap-3">
            {scoreRubric.map((item) => (
              <div key={item.title} className="rounded-[22px] border border-border bg-white/72 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">{item.points} pts</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.details}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[26px] bg-slate-950 p-5 text-white">
            <p className="text-sm text-white/60">Current customer profile</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/45 sm:tracking-[0.2em]">Segment</p>
                <p className="mt-1 font-semibold">{user?.segment}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/45 sm:tracking-[0.2em]">KYC tier</p>
                <p className="mt-1 font-semibold">{user?.kycTier}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/45 sm:tracking-[0.2em]">Sector</p>
                <p className="mt-1 font-semibold">{user?.sector}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/45 sm:tracking-[0.2em]">Monthly revenue</p>
                <p className="mt-1 font-semibold">{formatCurrency(user?.monthlyRevenue ?? 0)}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {products.map((item) => (
              <div key={item.name} className="rounded-[22px] border border-border p-4">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Up to {formatCurrency(item.cap)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="surface-card p-6">
          <div className="flex items-center gap-3">
            <div className="icon-shell"><Building2 size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Apply now</p>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Request a facility</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label">Loan product</label>
              <select className="input-modern" value={form.productName} onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}>
                {products.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Amount</label>
              <input className="input-modern" type="number" min={10000} value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} />
            </div>
            <div>
              <label className="field-label">Tenure (months)</label>
              <input className="input-modern" type="number" min={1} max={12} value={form.tenureMonths} onChange={(event) => setForm((prev) => ({ ...prev, tenureMonths: Number(event.target.value) }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Purpose</label>
              <input className="input-modern" value={form.purpose} onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Submit application</button>
            </div>
          </form>
        </motion.div>
      </section>

      <section className="surface-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Applications</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Loan book snapshot</h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-[24px] border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{loan.productName}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{loan.purpose}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loan.decision === "approved" ? "bg-emerald-50 text-emerald-700" : loan.decision === "manual_review" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                  {loan.decision.replace("_", " ")}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatCurrency(loan.amountRequested)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatCurrency(loan.amountApproved)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit score</p>
                  <p className="mt-1 font-semibold text-slate-950">{loan.score}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatDate(loan.createdAt)}</p>
                </div>
              </div>
              {loan.scoreCategories.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-border/70 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground sm:tracking-[0.2em]">Category Allocation</p>
                  <div className="mt-3 space-y-2">
                    {loan.scoreCategories.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-slate-950">{item.value}/{item.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-5 space-y-2">
                {loan.scoreBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-slate-950">
                      {item.value}
                      {item.max ? `/${item.max}` : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground sm:tracking-[0.2em]">
                {loan.decision === "approved" ? <BadgeCheck size={15} className="text-emerald-700" /> : <CircleAlert size={15} className="text-amber-700" />}
                {loan.status.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
