import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { withdrawalId, feedback, forceRefund } = body;

    if (!withdrawalId) {
      return NextResponse.json({ success: false, error: "Missing withdrawalId" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch withdrawal details
    const { data: withObj, error: fetchErr } = await supabase
      .from("withdrawals")
      .select("*, profiles(deposit_wallet, interest_wallet, email)")
      .eq("id", withdrawalId)
      .single();

    if (fetchErr || !withObj) {
      return NextResponse.json({ success: false, error: "Withdrawal record not found" }, { status: 404 });
    }

    const refundAmount = Number(withObj.amount || withObj.net_amount || 0);
    const userId = withObj.user_id;
    const targetWallet: "deposit_wallet" | "interest_wallet" =
      withObj.wallet_type === "deposit_wallet" ? "deposit_wallet" : "interest_wallet";

    // If it was already rejected and not forcing a refund, check if refund transaction already exists
    if (withObj.status === "rejected" && !forceRefund) {
      return NextResponse.json({
        success: false,
        error: "This withdrawal is already marked as rejected. Use 'Restore Funds' if balance was not refunded.",
      }, { status: 400 });
    }

    // 2. Attempt RPC first if it's pending
    if (withObj.status === "pending") {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc("reject_withdrawal_rpc", {
          p_withdrawal_id: withdrawalId,
          p_admin_id: userId,
          p_feedback: feedback || "Withdrawal request rejected by administrator",
        });

        if (!rpcErr && rpcRes && rpcRes.success) {
          return NextResponse.json({
            success: true,
            message: `Withdrawal rejected and $${refundAmount.toFixed(2)} refunded to user's ${targetWallet}.`,
            refundAmount,
            targetWallet,
          });
        }
      } catch (rpcEx) {
        console.warn("RPC reject_withdrawal_rpc failed, proceeding with direct admin execution:", rpcEx);
      }
    }

    // Direct execution with Admin Privileges (bypasses client triggers/RLS)
    // Update withdrawal record
    await supabase.from("withdrawals").update({
      status: "rejected",
      admin_feedback: feedback || "Withdrawal request rejected by administrator",
      updated_at: new Date().toISOString(),
    }).eq("id", withdrawalId);

    // Fetch fresh profile balance
    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("deposit_wallet, interest_wallet")
      .eq("id", userId)
      .single();

    const currentBal = Number(freshProfile?.[targetWallet] || 0);
    const newBal = currentBal + refundAmount;

    // Credit user's wallet
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        [targetWallet]: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      throw new Error(`Failed to update profile balance: ${updateErr.message}`);
    }

    // Record audit transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "admin_adjustment",
      wallet: targetWallet,
      amount: refundAmount,
      post_balance: newBal,
      description: `Refunded rejected withdrawal of $${refundAmount.toFixed(2)} to ${targetWallet}`,
      trx_ref: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal rejected and $${refundAmount.toFixed(2)} refunded to user's ${targetWallet} successfully!`,
      refundAmount,
      targetWallet,
      newBalance: newBal,
    });
  } catch (err: any) {
    console.error("Error in reject withdrawal route:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to reject and refund withdrawal" }, { status: 500 });
  }
}
