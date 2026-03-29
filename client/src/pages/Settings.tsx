import { MoonStar, ShieldCheck, SunMedium } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { logout } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <section className="surface-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.28em]">Preferences</p>
        <h1 className="mt-2 font-display text-3xl text-slate-950 sm:text-4xl">Settings</h1>
        <div className="mt-6 space-y-4">
          <button onClick={toggleTheme} className="list-row w-full">
            <div className="flex items-center gap-3">
              <div className="icon-shell icon-shell-sm">{theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}</div>
              <div className="min-w-0 text-left">
                <p className="font-semibold text-slate-950">Theme</p>
                <p className="text-sm text-muted-foreground">Current mode: {theme}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-teal-700">Toggle</span>
          </button>
          <div className="list-row">
            <div className="flex items-center gap-3">
              <div className="icon-shell icon-shell-sm"><ShieldCheck size={18} /></div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">Security posture</p>
                <p className="text-sm text-muted-foreground">JWT auth, ledger integrity, and KYC services belong on the Django side.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              setLocation("/");
            }}
            className="btn-primary bg-rose-600 hover:bg-rose-700"
          >
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}
