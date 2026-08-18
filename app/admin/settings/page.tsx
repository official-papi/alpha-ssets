"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("HYIP Max Platform");
  const [siteEmail, setSiteEmail] = useState("admin@hyipmax.com");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [kycMandatory, setKycMandatory] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settings) {
      setSiteName(settings.site_name || "HYIP Max Platform");
      setSiteEmail(settings.site_email || "admin@hyipmax.com");
      setCurrencySymbol(settings.currency_symbol || "$");
      setCurrencyCode(settings.currency_code || "USD");
      setLogoUrl(settings.logo_url || "");
      setFaviconUrl(settings.favicon_url || "");
      setMaintenanceMode(settings.maintenance_mode || false);
      setKycMandatory(settings.kyc_mandatory || false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: 1,
        site_name: siteName,
        site_email: siteEmail,
        currency_symbol: currencySymbol,
        currency_code: currencyCode,
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        maintenance_mode: maintenanceMode,
        kyc_mandatory: kycMandatory,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "System settings updated successfully!", type: "success" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure global platform metadata, currencies, logos, and system modes.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="minimal-card p-6 border-slate-200 space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>General Platform Branding</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Platform Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Support Email</label>
              <input
                type="email"
                required
                value={siteEmail}
                onChange={(e) => setSiteEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="e.g. $"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Currency Code</label>
              <input
                type="text"
                required
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                placeholder="e.g. USD"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Favicon URL</label>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.ico"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Mode Toggles */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-extrabold text-slate-900">Maintenance Mode</div>
                <div className="text-[11px] text-slate-500">Temporarily lock investor access for platform updates</div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="cursor-pointer"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-rose-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-extrabold text-slate-900">Mandatory KYC Verification</div>
                <div className="text-[11px] text-slate-500">Require document approval before allowing withdrawals</div>
              </div>
              <button
                type="button"
                onClick={() => setKycMandatory(!kycMandatory)}
                className="cursor-pointer"
              >
                {kycMandatory ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="minimal-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
          >
            {saving ? "Saving Changes..." : "Save System Settings"}
          </button>
        </form>
      </div>

    </div>
  );
}
