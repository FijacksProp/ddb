import { motion } from "framer-motion";
import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/lib/format";

const products = [
  { name: "Treasury Income Vault", annualYield: 12, tenureDays: 90, liquidityDays: 1 },
  { name: "Growth Reserve Note", annualYield: 15, tenureDays: 180, liquidityDays: 2 },
];

export default function Investments() {
  const { createInvestment, investments, user } = useApp();
  const [form, setForm] = useState({
    productName: products[0].name,
    amount: 50000,
    annualYield: products[0].annualYield,
    tenureDays: products[0].tenureDays,
    liquidityDays: products[0].liquidityDays,
  });

  const handleProductChange = (name: string) => {
    const product = products.find((item) => item.name === name) ?? products[0];
    setForm((prev) => ({
      ...prev,
      productName: product.name,
      annualYield: product.annualYield,
      tenureDays: product.tenureDays,
      liquidityDays: product.liquidityDays,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createInvestment(form);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  };

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="hero-panel px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Investment desk</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Put idle wallet balances to work.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/76">
            The product set is modeled as a regulated treasury-style investment experience with transparent yield and liquidity windows.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass-card">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Available wallet</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(user?.walletBalance ?? 0)}</p>
            </div>
            <div className="glass-card">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Minimum entry</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(500)}</p>
            </div>
          </div>
        </div>

        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="surface-card p-6">
          <div className="flex items-center gap-3">
            <div className="icon-shell"><Landmark size={20} /></div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Book a product</p>
              <h2 className="text-2xl font-semibold text-slate-950">Create an investment</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <div>
              <label className="field-label">Product</label>
              <select className="input-modern" value={form.productName} onChange={(event) => handleProductChange(event.target.value)}>
                {products.map((product) => (
                  <option key={product.name} value={product.name}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Amount</label>
              <input className="input-modern" type="number" min={500} value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="field-label">Yield</label>
                <input className="input-modern" value={`${form.annualYield}%`} readOnly />
              </div>
              <div>
                <label className="field-label">Tenure</label>
                <input className="input-modern" value={`${form.tenureDays} days`} readOnly />
              </div>
              <div>
                <label className="field-label">Liquidity</label>
                <input className="input-modern" value={`T+${form.liquidityDays}`} readOnly />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-6">Create investment</button>
        </motion.form>
      </section>

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Portfolio</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Active positions</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <Sparkles size={16} />
            Daily accrual visibility
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {investments.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-950">{item.productName}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.annualYield}% annual yield | Matures {formatDate(item.maturityDate)}</p>
                </div>
                <ArrowUpRight className="text-teal-700" size={18} />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatCurrency(item.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily yield</p>
                  <p className="mt-1 font-semibold text-emerald-700">{formatCurrency(item.dailyYield)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accrued</p>
                  <p className="mt-1 font-semibold text-emerald-700">{formatCurrency(item.yieldAccrued)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
