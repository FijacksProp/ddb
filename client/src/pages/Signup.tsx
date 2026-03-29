import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, UserRound } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    pin: "",
    businessName: "",
    sector: "Retail Services",
    monthlyRevenue: 100000,
    segment: "Retail" as "Retail" | "SME",
  });

  const handleNext = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email)) {
      toast.error("Complete your personal details first.");
      return;
    }
    if (step === 2 && (!formData.phoneNumber || !formData.password || formData.pin.length !== 4)) {
      toast.error("Add your contact details, password, and 4-digit PIN.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signup(formData);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setLocation("/dashboard");
  };

  return (
    <div className="auth-shell">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="auth-grid"
      >
        <div className="auth-showcase">
          <button onClick={() => setLocation("/")} className="btn-outline-light w-fit">
            <ArrowLeft size={16} />
            Back
          </button>
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-white/55 sm:tracking-[0.34em]">Open an account</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-5xl">Create a wallet that can grow into a full banking relationship.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/74">
            Start with a responsive customer wallet now, then unlock higher tiers, credit access, and richer financial products as your footprint grows.
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.3em]">Onboarding</p>
              <h2 className="mt-3 font-display text-3xl text-slate-950 sm:text-4xl">Create your DDB profile</h2>
            </div>
            <span className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground">
              Step {step} / 3
            </span>
          </div>

          <div className="mt-6 flex gap-2">
            {[1, 2, 3].map((value) => (
              <div key={value} className={`h-1.5 flex-1 rounded-full ${value <= step ? "bg-teal-600" : "bg-slate-200"}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {step === 1 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">First name</label>
                    <input className="input-modern" value={formData.firstName} onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label">Last name</label>
                    <input className="input-modern" value={formData.lastName} onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Email address</label>
                  <input className="input-modern" type="email" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, segment: "Retail" }))} className={`segment-card ${formData.segment === "Retail" ? "segment-card-active" : ""}`}>
                    <UserRound size={18} />
                    <span>Retail customer</span>
                  </button>
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, segment: "SME" }))} className={`segment-card ${formData.segment === "SME" ? "segment-card-active" : ""}`}>
                    <Building2 size={18} />
                    <span>SME / business</span>
                  </button>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div>
                  <label className="field-label">Phone number</label>
                  <input className="input-modern" value={formData.phoneNumber} onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))} placeholder="08012345678" />
                </div>
                <div>
                  <label className="field-label">Password</label>
                  <input className="input-modern" type="password" value={formData.password} onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))} />
                </div>
                <div>
                  <label className="field-label">4-digit PIN</label>
                  <input className="input-modern text-center text-xl tracking-[0.28em] sm:text-2xl sm:tracking-[0.4em]" maxLength={4} value={formData.pin} onChange={(event) => setFormData((prev) => ({ ...prev, pin: event.target.value.replace(/\D/g, "") }))} />
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Sector</label>
                    <input className="input-modern" value={formData.sector} onChange={(event) => setFormData((prev) => ({ ...prev, sector: event.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label">Monthly revenue / income</label>
                    <input
                      className="input-modern"
                      type="number"
                      min={0}
                      value={formData.monthlyRevenue}
                      onChange={(event) => setFormData((prev) => ({ ...prev, monthlyRevenue: Number(event.target.value) }))}
                    />
                  </div>
                </div>
                {formData.segment === "SME" ? (
                  <div>
                    <label className="field-label">Business name</label>
                    <input className="input-modern" value={formData.businessName} onChange={(event) => setFormData((prev) => ({ ...prev, businessName: event.target.value }))} />
                  </div>
                ) : null}
              </>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((prev) => prev - 1)} className="btn-ghost">
                  Back
                </button>
              ) : null}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="btn-primary">
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  Create account
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="font-semibold text-teal-700">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
