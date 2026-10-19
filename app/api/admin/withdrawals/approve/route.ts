import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { withdrawalApprovedEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { withdrawalId, feedback } = await req.json();

    if (!withdrawalId) {
      return NextResponse.json({ success: false, error: "Missing withdrawalId" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch withdrawal details
    const { data: withObj, error: fetchErr } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name)")
      .eq("id", withdrawalId)
      .single();

    if (fetchErr || !withObj) {
      return NextResponse.json({ success: false, error: "Withdrawal record not found" }, { status: 404 });
    }

    if (withObj.status === "approved") {
      return NextResponse.json({ success: false, error: "Withdrawal is already approved." }, { status: 400 });
    }

    const approvalFeedback = feedback || "Withdrawal payout sent successfully";

    // 2. Update status to approved
    const { error: updateErr } = await supabase.from("withdrawals").update({
      status: "approved",
      admin_feedback: approvalFeedback,
      updated_at: new Date().toISOString(),
    }).eq("id", withdrawalId);

    if (updateErr) {
      throw new Error(`Failed to approve withdrawal: ${updateErr.message}`);
    }

    // 3. Dispatch confirmation email to investor
    try {
      let recipientEmail = withObj.profiles?.email;
      let recipientName = withObj.profiles?.full_name;

      if (!recipientEmail && withObj.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(withObj.user_id);
        recipientEmail = userData?.user?.email;
        recipientName = userData?.user?.user_metadata?.full_name;
      }

      if (recipientEmail) {
        let destinationText = "Designated account";
        if (typeof withObj.account_details === "object" && withObj.account_details?.details) {
          destinationText = withObj.account_details.details;
        } else if (typeof withObj.account_details === "string") {
          destinationText = withObj.account_details;
        }

        const payoutAmount = Number(withObj.net_amount || withObj.amount || 0);

        const { subject, html } = withdrawalApprovedEmail({
          name: recipientName,
          amount: payoutAmount,
          method: withObj.method_name,
          destination: destinationText,
          feedback: approvalFeedback,
        });

        await sendEmail({ to: recipientEmail, subject, html });
      }
    } catch (emailErr) {
      console.warn("Failed to dispatch withdrawal approved email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal payout approved and investor notified via email!",
    });
  } catch (err: any) {
    console.error("Error approving withdrawal:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
