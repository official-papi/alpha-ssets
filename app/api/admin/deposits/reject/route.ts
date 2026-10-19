import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { depositRejectedEmail } from "@/lib/email/templates";

// Elevated API endpoint to reject deposit and update audit state

export async function POST(req: Request) {
  try {
    const { depositId, feedback } = await req.json();

    if (!depositId) {
      return NextResponse.json({ success: false, error: "Missing depositId" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Fetch deposit details for user email notification
    const { data: depObj } = await supabase
      .from("deposits")
      .select("*, profiles(email, full_name)")
      .eq("id", depositId)
      .single();

    const rejectReason = feedback || "Invalid transaction hash or proof";

    // Try RPC first
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("reject_deposit_rpc", {
        p_deposit_id: depositId,
        p_admin_id: "00000000-0000-0000-0000-000000000000",
        p_feedback: rejectReason,
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        // Send email
        await sendRejectNotification(supabase, depObj, rejectReason);
        return NextResponse.json({ success: true, message: "Deposit request rejected." });
      }
    } catch (rpcEx) {
      console.warn("reject_deposit_rpc failed, proceeding with direct admin execution:", rpcEx);
    }

    // Direct update
    const { error: updateErr } = await supabase.from("deposits").update({
      status: "rejected",
      admin_feedback: rejectReason,
      updated_at: new Date().toISOString(),
    }).eq("id", depositId);

    if (updateErr) {
      throw new Error(`Failed to update deposit status: ${updateErr.message}`);
    }

    // Send email
    await sendRejectNotification(supabase, depObj, rejectReason);

    return NextResponse.json({ success: true, message: "Deposit request rejected." });
  } catch (err: any) {
    console.error("Deposit reject error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}

async function sendRejectNotification(supabase: any, depObj: any, reason: string) {
  if (!depObj) return;
  try {
    let recipientEmail = depObj.profiles?.email;
    let recipientName = depObj.profiles?.full_name;

    if (!recipientEmail && depObj.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(depObj.user_id);
      recipientEmail = userData?.user?.email;
      recipientName = userData?.user?.user_metadata?.full_name;
    }

    if (recipientEmail) {
      const amount = Number(depObj.final_amount || depObj.amount || 0);
      const { subject, html } = depositRejectedEmail({
        name: recipientName,
        amount,
        reason,
      });
      await sendEmail({ to: recipientEmail, subject, html });
    }
  } catch (e) {
    console.warn("Failed to dispatch deposit rejected email:", e);
  }
}
