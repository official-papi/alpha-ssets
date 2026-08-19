import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Support both Vercel Cron secret & authenticated Supabase client headers
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const tempClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await tempClient.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://placeholder-project.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "placeholder-anon-key";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: rpcResult, error: rpcError } = await supabase.rpc("process_investment_payouts_rpc");

    if (rpcError) {
      return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: rpcResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
