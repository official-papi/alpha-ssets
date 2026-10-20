import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Elevated API endpoint to approve deposit and credit user wallet

export async function POST(req: Request) {
  try {
    const { depositId, feedback } = await req.json();

    if (!depositId) {
      return NextResponse.json({ success: false, error: "Missing depositId" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch deposit record
    const { data: depObj, error: fetchErr } = await supabase
      .from("deposits")
      .select("*, profiles(deposit_wallet, email)")
      .eq("id", depositId)
      .single();

    if (fetchErr || !depObj) {
      return NextResponse.json({ success: false, error: "Deposit record not found" }, { status: 404 });
    }

    if (depObj.status === "approved") {
      return NextResponse.json({ success: false, error: "Deposit is already approved." }, { status: 400 });
    }

    const depositAmount = Number(depObj.final_amount || depObj.amount || 0);
    const userId = depObj.user_id;

    // 2. Try RPC first (which also distributes multi-level referral commissions)
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("approve_deposit_rpc", {
        p_deposit_id: depositId,
        p_admin_id: userId,
        p_feedback: feedback || "Deposit verified and approved by admin",
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        return NextResponse.json({
          success: true,
          message: `Deposit of $${depositAmount.toFixed(2)} approved and credited successfully!`,
        });
      }
    } catch (rpcEx) {
      console.warn("RPC approve_deposit_rpc failed, proceeding with direct admin execution:", rpcEx);
    }

    // 3. Direct admin execution with elevated service role (bypasses RLS)
    await supabase.from("deposits").update({
      status: "approved",
      admin_feedback: feedback || "Deposit verified and approved by admin",
      updated_at: new Date().toISOString(),
    }).eq("id", depositId);

    // Fetch fresh profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("deposit_wallet")
      .eq("id", userId)
      .single();

    const currentBal = Number(profile?.deposit_wallet || 0);
    const newBal = currentBal + depositAmount;

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        deposit_wallet: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileErr) {
      throw new Error(`Failed to credit deposit wallet: ${profileErr.message}`);
    }

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      wallet: "deposit_wallet",
      amount: depositAmount,
      post_balance: newBal,
      description: `Deposit approved via ${depObj.gateway || depObj.gateway_name || "Payment Gateway"}`,
      trx_ref: `DEP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });

    return NextResponse.json({
      success: true,
      message: `Deposit of $${depositAmount.toFixed(2)} approved and credited to investor wallet successfully!`,
      newBalance: newBal,
    });
  } catch (err: any) {
    console.error("Deposit approval error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
