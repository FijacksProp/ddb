import { motion } from "framer-motion";
import { ArrowRightLeft, PlusCircle, Search } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";

export default function Wallet() {
  const { user, contacts, topUpWallet, transactions, transferFunds } = useApp();
  const [transfer, setTransfer] = useState({
    recipientAccountNumber: contacts[0]?.accountNumber ?? "",
    amount: 10000,
    narration: "Inventory support",
  });
  const [topUpAmount, setTopUpAmount] = useState(25000);

  const handleTransfer = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await transferFunds(transfer);
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
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Wallet operations</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Move money with speed and traceability.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/76">
            Internal DDB transfers are instant and ledger-aware. Every movement carries a reference, counterparty, and channel.
          </p>
          <div className="mt-8 glass-card max-w-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/54">Available balance</p>
            <p className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{formatCurrency(user?.walletBalance ?? 0)}</p>
            <p className="mt-2 text-sm text-white/70">Account {user?.accountNumber}</p>
          </div>
        </div>

        <div className="space-y-6">
          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} onSubmit={handleTransfer} className="surface-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-shell"><ArrowRightLeft size={20} /></div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-slate-950">Transfer to another DDB user</h2>
                <p className="text-sm text-muted-foreground">Try 8087654321 for Chioma's seeded account.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="field-label">Recipient account number</label>
                <input className="input-modern" value={transfer.recipientAccountNumber} onChange={(event) => setTransfer((prev) => ({ ...prev, recipientAccountNumber: event.target.value }))} />
              </div>
              <div>
                <label className="field-label">Amount</label>
                <input className="input-modern" type="number" min={1} value={transfer.amount} onChange={(event) => setTransfer((prev) => ({ ...prev, amount: Number(event.target.value) }))} />
              </div>
              <div>
                <label className="field-label">Narration</label>
                <input className="input-modern" value={transfer.narration} onChange={(event) => setTransfer((prev) => ({ ...prev, narration: event.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-6">Send transfer</button>
          </motion.form>

          <div className="surface-card p-6">
            <div className="flex items-center gap-3">
              <div className="icon-shell"><PlusCircle size={20} /></div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-slate-950">Fund wallet</h2>
                <p className="text-sm text-muted-foreground">Simulated local top-up until live payment rails are connected.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <input className="input-modern max-w-[220px]" type="number" value={topUpAmount} onChange={(event) => setTopUpAmount(Number(event.target.value))} />
              <button
                onClick={async () => {
                  const result = await topUpWallet(topUpAmount);
                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                }}
                className="btn-primary"
              >
                Add funds
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Ledger history</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Transactions</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
            <Search size={16} />
            Search will connect to server-side filtering later
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {transactions.map((item) => (
            <div key={item.id} className="list-row">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.reference} | {item.counterpartyName} | {formatDate(item.createdAt)} {formatTime(item.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${item.direction === "credit" ? "text-emerald-700" : "text-slate-950"}`}>
                  {item.direction === "credit" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.channel.replace("_", " ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
