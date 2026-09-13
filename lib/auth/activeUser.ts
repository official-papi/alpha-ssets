import { createClient } from "@/lib/supabase/client";

export interface ActiveUserInfo {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  isImpersonating: boolean;
  adminUser: any;
  profile?: any;
}

export async function getActiveUser(supabaseInstance?: ReturnType<typeof createClient>): Promise<ActiveUserInfo | null> {
  const supabase = supabaseInstance || createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const impersonatedId = typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_id") : null;

  if (impersonatedId && impersonatedId !== user.id) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", impersonatedId)
        .maybeSingle();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || (typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_email") : "") || "investor@example.com",
          full_name: profile.full_name || "Investor",
          avatar_url: profile.avatar_url || "",
          role: profile.role || "user",
          isImpersonating: true,
          adminUser: user,
          profile,
        };
      }
    } catch (err) {
      console.error("Error fetching impersonated profile:", err);
    }
  }

  return {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || "Investor",
    avatar_url: "",
    role: user.user_metadata?.role || "user",
    isImpersonating: false,
    adminUser: user,
    profile: null,
  };
}

export function exitImpersonation() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("impersonate_user_id");
    sessionStorage.removeItem("impersonate_user_email");
    window.location.href = "/admin/users";
  }
}
