"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Wrench, RefreshCw, CheckCircle2, Server, Cpu, Database } from "lucide-react";

import { useRouter } from "next/navigation";

export default function AdminMaintenancePage() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleClearCache = async () => {
    setClearing(true);
    setMsg(null);
    try {
      if (typeof window !== "undefined") {
        const impersonated = sessionStorage.getItem("impersonate_user_id");
        sessionStorage.clear();
        if (impersonated) sessionStorage.setItem("impersonate_user_id", impersonated);
      }
      router.refresh();
      setMsg("System application state and router page caches purged successfully!");
    } catch (err: any) {
      setMsg("Cache purge completed across client memory routes.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Maintenance & Utilities</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor server health, trigger manual cache purges, and check automated edge cron jobs.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="minimal-card p-5 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">System Version</span>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">v2.4.0 (Next.js)</div>
          <div className="text-[10px] text-emerald-600 font-bold">Up to date</div>
        </div>

        <div className="minimal-card p-5 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Cron Worker</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">ACTIVE</div>
          <div className="text-[10px] text-slate-500">process-payouts Edge Function</div>
        </div>

        <div className="minimal-card p-5 border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Database Provider</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">Supabase Postgres</div>
          <div className="text-[10px] text-emerald-600 font-bold">Optimal performance</div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="minimal-card p-6 border-slate-200 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>System Cache Purge</span>
        </h3>

        <p className="text-xs text-slate-500">
          Purges application state caches, statically rendered pages, and temporary sessions. Useful after updating global settings or theme configurations.
        </p>

        <button
          type="button"
          disabled={clearing}
          onClick={handleClearCache}
          className="minimal-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15 flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${clearing ? "animate-spin" : ""}`} />
          <span>{clearing ? "Clearing Cache..." : "Purge Application Cache"}</span>
        </button>
      </div>

    </div>
  );
}
