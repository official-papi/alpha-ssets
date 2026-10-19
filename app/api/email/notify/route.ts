import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail, getAdminNotificationEmail } from "@/lib/email/resend";
import {
  welcomeEmail,
  depositSubmittedEmail,
  withdrawalSubmittedEmail,
  investmentActivatedEmail,
  adminAlertEmail,
} from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { event, payload } = await req.json();

    if (!event || !payload) {
      return NextResponse.json({ success: false, error: "Missing event or payload" }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const adminEmail = getAdminNotificationEmail();

    switch (event) {
      case "welcome": {
        const { email, name } = payload;
        if (email) {
          const { subject, html } = welcomeEmail({ email, name });
          await sendEmail({ to: email, subject, html });
        }
        break;
      }

      case "deposit_submitted": {
        const { userId, userEmail, userName, amount, gateway, trxId } = payload;
        let recipientEmail = userEmail;
        let recipientName = userName;

        if (!recipientEmail && userId) {
          const { data } = await supabase.auth.admin.getUserById(userId);
          recipientEmail = data?.user?.email;
          recipientName = data?.user?.user_metadata?.full_name;
        }

        if (recipientEmail) {
          const { subject, html } = depositSubmittedEmail({
            name: recipientName,
            amount: Number(amount || 0),
            gateway: gateway || "Payment Gateway",
            trxId,
          });
          await sendEmail({ to: recipientEmail, subject, html });
        }

        // Notify admin if configured
        if (adminEmail) {
          const { subject, html } = adminAlertEmail({
            title: `New Deposit: $${Number(amount || 0).toFixed(2)} (${gateway})`,
            eventType: "deposit",
            userEmail: recipientEmail || "Unknown user",
            amount: Number(amount || 0),
            methodOrGateway: gateway || "Gateway",
            details: trxId ? `TRX: ${trxId}` : undefined,
          });
          await sendEmail({ to: adminEmail, subject, html });
        }
        break;
      }

      case "withdrawal_submitted": {
        const { userId, userEmail, userName, amount, netAmount, method, destination } = payload;
        let recipientEmail = userEmail;
        let recipientName = userName;

        if (!recipientEmail && userId) {
          const { data } = await supabase.auth.admin.getUserById(userId);
          recipientEmail = data?.user?.email;
          recipientName = data?.user?.user_metadata?.full_name;
        }

        if (recipientEmail) {
          const { subject, html } = withdrawalSubmittedEmail({
            name: recipientName,
            amount: Number(amount || 0),
            netAmount: Number(netAmount || amount || 0),
            method: method || "Payout Method",
            destination: destination || "Registered Wallet",
          });
          await sendEmail({ to: recipientEmail, subject, html });
        }

        // Notify admin if configured
        if (adminEmail) {
          const { subject, html } = adminAlertEmail({
            title: `New Payout Request: $${Number(netAmount || amount || 0).toFixed(2)} (${method})`,
            eventType: "withdrawal",
            userEmail: recipientEmail || "Unknown user",
            amount: Number(netAmount || amount || 0),
            methodOrGateway: method || "Payout Channel",
            details: destination,
          });
          await sendEmail({ to: adminEmail, subject, html });
        }
        break;
      }

      case "investment_started": {
        const { userId, userEmail, userName, planName, amount, dailyRate, durationDays } = payload;
        let recipientEmail = userEmail;
        let recipientName = userName;

        if (!recipientEmail && userId) {
          const { data } = await supabase.auth.admin.getUserById(userId);
          recipientEmail = data?.user?.email;
          recipientName = data?.user?.user_metadata?.full_name;
        }

        if (recipientEmail) {
          const { subject, html } = investmentActivatedEmail({
            name: recipientName,
            planName: planName || "Compounding Tier",
            amount: Number(amount || 0),
            dailyRate: Number(dailyRate || 0),
            durationDays: Number(durationDays || 0),
          });
          await sendEmail({ to: recipientEmail, subject, html });
        }
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unhandled event: ${event}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Notification event ${event} processed.` });
  } catch (err: any) {
    console.error("Error in email notify endpoint:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
