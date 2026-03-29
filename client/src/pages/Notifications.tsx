import { BellRing } from "lucide-react";
import React from "react";
import { useApp } from "@/contexts/AppContext";
import { formatDate, formatTime } from "@/lib/format";

export default function Notifications() {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useApp();

  return (
    <div className="space-y-6 pb-28 xl:pb-8">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Inbox</p>
            <h1 className="mt-2 font-display text-3xl text-slate-950 sm:text-4xl">Notifications</h1>
          </div>
          <button onClick={markAllNotificationsAsRead} className="btn-ghost">Mark all as read</button>
        </div>

        <div className="mt-6 space-y-3">
          {notifications.map((item) => (
            <button key={item.id} onClick={() => markNotificationAsRead(item.id)} className={`w-full rounded-[24px] border p-5 text-left transition ${item.read ? "border-border bg-white" : "border-teal-200 bg-teal-50/60"}`}>
              <div className="flex items-start gap-4">
                <div className="icon-shell icon-shell-sm"><BellRing size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDate(item.createdAt)} | {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
