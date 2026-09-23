"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeUserId, setActiveUserId] = useState("");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  
  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setActiveUserId(activeUser.id);
      setIsImpersonating(activeUser.isImpersonating);
      setUserEmail(activeUser.email);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeUser.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setUsername(profile.username || "");
        setPhone(profile.phone || "");
      }
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);

    const supabase = createClient();
    if (!activeUserId) {
      setProfileMsg({ text: "Authentication error", type: "error" });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeUserId);

    if (error) {
      setProfileMsg({ text: error.message, type: "error" });
    } else {
      setProfileMsg({ text: "Profile details updated successfully!", type: "success" });
    }
    setSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (isImpersonating) {
      setPasswordMsg({ text: "Password changes in Impersonation mode are disabled. Manage user passwords in Admin Panel.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match.", type: "error" });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg({ text: error.message, type: "error" });
    } else {
      setPasswordMsg({ text: "Password updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8 max-w-4xl">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account information and security credentials.</p>
        </div>

        {/* Profile Info Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-[#093A3E]" />
            <span>Personal Information</span>
          </h3>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              profileMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all cursor-pointer shadow-md shadow-[#093A3E]/15"
            >
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#093A3E]" />
            <span>Change Password</span>
          </h3>

          {passwordMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              passwordMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all cursor-pointer shadow-md shadow-[#093A3E]/15"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
