import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Elevated API endpoint to reject deposit and update audit state

export async function POST(req: Request) {
  try {
    const { depositId, feedback } = await req.json();

    if (!depositId) {
      return NextResponse.json({ success: false, error: "Missing depositId" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Try RPC first
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("reject_deposit_rpc", {
        p_deposit_id: depositId,
        p_admin_id: "00000000-0000-0000-0000-000000000000",
        p_feedback: feedback || "Invalid transaction hash or proof",
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        return NextResponse.json({ success: true, message: "Deposit request rejected." });
      }
    } catch (rpcEx) {
      console.warn("reject_deposit_rpc failed, proceeding with direct admin execution:", rpcEx);
    }

    // Direct update
    const { error: updateErr } = await supabase.from("deposits").update({
      status: "rejected",
      admin_feedback: feedback || "Invalid transaction hash or proof",
      updated_at: new Date().toISOString(),
    }).eq("id", depositId);

    if (updateErr) {
      throw new Error(`Failed to update deposit status: ${updateErr.message}`);
    }

    return NextResponse.json({ success: true, message: "Deposit request rejected." });
  } catch (err: any) {
    console.error("Deposit reject error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
