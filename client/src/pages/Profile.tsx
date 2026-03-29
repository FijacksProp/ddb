import { motion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, Phone, UserRound } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/lib/format";

export default function Profile() {
  const { user, verifyBvn } = useApp();
  const [showBvnVerification, setShowBvnVerification] = useState(false);
  const [bvnInput, setBvnInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleBvnVerification = async () => {
    if (bvnInput.length !== 11 || !/^\d+$/.test(bvnInput)) {
      setVerificationMessage("BVN must be 11 digits");
      return;
    }

    setIsVerifying(true);
    const result = await verifyBvn(bvnInput);
    setVerificationMessage(result.message);
    if (result.success) {
      setBvnInput("");
      setShowBvnVerification(false);
    }
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="surface-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-950 font-display text-3xl text-white">
              {user?.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Customer profile</p>
              <h1 className="mt-2 break-words font-display text-3xl leading-tight text-slate-950 sm:text-4xl">{user?.fullName}</h1>
              <p className="mt-2 break-all text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {user?.kycTier} verified path
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Identity</p>
          <div className="mt-6 space-y-4">
            <div className="list-row"><span className="text-muted-foreground">Account number</span><strong>{user?.accountNumber}</strong></div>
            <div className="list-row">
              <span className="text-muted-foreground">BVN</span>
              <div className="flex items-center gap-2">
                <strong>{user?.isBvnVerified ? (user?.bvn || "Verified") : "Pending"}</strong>
                {user?.isBvnVerified && <span className="text-xs text-emerald-600 font-semibold">✓ Verified</span>}
                {!user?.isBvnVerified && (
                  <button
                    onClick={() => setShowBvnVerification(true)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    Verify Now
                  </button>
                )}
              </div>
            </div>
            <div className="list-row"><span className="text-muted-foreground">Phone</span><strong>{user?.phoneNumber}</strong></div>
            <div className="list-row"><span className="text-muted-foreground">Joined</span><strong>{user?.joinedAt ? formatDate(user.joinedAt) : "-"}</strong></div>
          </div>

          {showBvnVerification && (
            <div className="mt-6 border-t border-border/50 pt-6">
              <p className="text-sm font-semibold mb-3">Verify BVN</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter 11-digit BVN"
                  value={bvnInput}
                  onChange={(e) => setBvnInput(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full px-3 py-2 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary"
                  maxLength={11}
                />
                {verificationMessage && (
                  <p className={`text-sm ${verificationMessage.includes("successfully") ? "text-emerald-600" : "text-rose-600"}`}>
                    {verificationMessage}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleBvnVerification}
                    disabled={isVerifying || bvnInput.length !== 11}
                    className="btn-primary flex-1 text-sm"
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    onClick={() => {
                      setShowBvnVerification(false);
                      setBvnInput("");
                      setVerificationMessage("");
                    }}
                    className="btn-ghost flex-1 justify-center text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="surface-card p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Commercial profile</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="stat-card">
              <div className="icon-shell icon-shell-sm"><BriefcaseBusiness size={18} /></div>
              <p className="mt-4 text-sm text-muted-foreground">Segment</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{user?.segment}</p>
            </div>
            <div className="stat-card">
              <div className="icon-shell icon-shell-sm"><BadgeCheck size={18} /></div>
              <p className="mt-4 text-sm text-muted-foreground">Risk band</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{user?.riskBand}</p>
            </div>
            <div className="stat-card">
              <div className="icon-shell icon-shell-sm"><Phone size={18} /></div>
              <p className="mt-4 text-sm text-muted-foreground">Monthly revenue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(user?.monthlyRevenue ?? 0)}</p>
            </div>
            <div className="stat-card">
              <div className="icon-shell icon-shell-sm"><UserRound size={18} /></div>
              <p className="mt-4 text-sm text-muted-foreground">Sector</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{user?.sector}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
