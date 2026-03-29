import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await login(formData.email, formData.password);
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
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-white/55 sm:tracking-[0.34em]">Secure access</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-5xl">Sign in to your DDB workspace.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/74">
            Customer wallets, internal transfers, loan footprinting, and investments now live in a more serious banking shell.
          </p>
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck size={20} className="text-emerald-300" />
              <span className="font-semibold">Demo accounts</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/74">
              <p>adebayo@ddb.ng / demo1234</p>
              <p>chioma@ddb.ng / demo1234</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.3em]">Customer sign in</p>
          <h2 className="mt-3 font-display text-3xl text-slate-950 sm:text-4xl">Welcome back</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to your DDB account or create a new one.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                className="input-modern"
                placeholder="you@ddb.ng"
                required
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  className="input-modern pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            New to DDB?{" "}
            <button onClick={() => setLocation("/signup")} className="font-semibold text-teal-700">
              Create an account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
