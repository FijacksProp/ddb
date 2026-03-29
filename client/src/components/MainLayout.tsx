import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CreditCard,
  Landmark,
  LogOut,
  Settings,
  UserRound,
  Wallet,
} from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Landmark },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/loans", label: "Loans", icon: CreditCard },
  { path: "/investments", label: "Investments", icon: BriefcaseBusiness },
  { path: "/profile", label: "Profile", icon: UserRound },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, getUnreadCount } = useApp();
  const unreadCount = getUnreadCount();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(180,83,9,0.14),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[290px] shrink-0 xl:block">
          <div className="app-panel sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden">
            <div className="border-b border-white/10 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="brand-badge">D</div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Digital Development Bank</p>
                  <h1 className="font-display text-2xl text-primary-foreground">DDB Nigeria</h1>
                </div>
              </div>
            </div>

            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Signed in as</p>
              <p className="mt-2 line-clamp-2 text-lg font-semibold text-white">{user?.fullName}</p>
              <p className="text-sm text-primary-foreground/68">{user?.accountNumber}</p>
              <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white">
                {user?.kycTier} | {user?.segment}
              </div>
            </div>

            <nav className="flex-1 px-4 py-5">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      className={`nav-item ${active ? "nav-item-active" : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {active ? <ArrowUpRight size={16} className="ml-auto" /> : null}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="space-y-2 border-t border-white/10 px-4 py-5">
              <button onClick={() => setLocation("/notifications")} className={`nav-item ${location === "/notifications" ? "nav-item-active" : ""}`}>
                <Bell size={18} />
                <span>Notifications</span>
                {unreadCount > 0 ? <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-slate-950">{unreadCount}</span> : null}
              </button>
              <button onClick={() => setLocation("/settings")} className={`nav-item ${location === "/settings" ? "nav-item-active" : ""}`}>
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setLocation("/");
                }}
                className="nav-item text-rose-100 hover:bg-rose-500/12 hover:text-white"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="surface-card sticky top-4 z-30 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="brand-badge brand-badge-sm">D</div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">DDB Nigeria</p>
                <p className="truncate text-sm font-semibold">{user?.fullName}</p>
              </div>
            </div>
            <button
              onClick={() => setLocation("/notifications")}
              className="relative rounded-full border border-border/70 bg-white/70 p-3 text-foreground shadow-sm"
            >
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-500" /> : null}
            </button>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="min-w-0"
          >
            {children}
          </motion.main>

          <nav className="surface-card fixed bottom-4 left-4 right-4 z-40 flex items-center gap-2 overflow-x-auto px-3 py-3 xl:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setLocation("/settings")}
              className={`mobile-nav-item ${location === "/settings" ? "mobile-nav-item-active" : ""}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                logout();
                setLocation("/");
              }}
              className="mobile-nav-item text-rose-100 hover:bg-rose-500/12 hover:text-white"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
