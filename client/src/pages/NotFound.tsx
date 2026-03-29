import React from "react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card max-w-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">This route does not exist.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The app shell is ready for wallet, lending, and investment flows. This route still needs wiring.
        </p>
        <button onClick={() => setLocation("/")} className="btn-primary mt-6">
          Return home
        </button>
      </div>
    </div>
  );
}
