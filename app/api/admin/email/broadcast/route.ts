import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const { targetAudience, subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "Subject and message are required." }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    let query = supabase.from("profiles").select("id, email, full_name");

    if (targetAudience === "kyc_approved") {
      query = query.eq("is_kyc_verified", true);
    }

    const { data: users, error: fetchErr } = await query;

    if (fetchErr || !users || users.length === 0) {
      return NextResponse.json({ success: false, error: "No target users found for selected audience." }, { status: 404 });
    }

    // 1. Insert in-app notifications
    const notificationRows = users.map((u: any) => ({
      user_id: u.id,
      title: subject,
      message: message,
      type: "info",
      is_read: false,
    }));

    await supabase.from("notifications").insert(notificationRows);

    // 2. Deliver real emails via Resend to users with valid email addresses
    let emailsSent = 0;
    const validEmails = users.filter((u: any) => u.email && u.email.includes("@"));

    // Wrap plain message in clean HTML layout
    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #001011; padding: 24px 32px; border-bottom: 2px solid #093A3E; text-align: center;">
          <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">ALPHA <span style="color: #3AAFB9;">ASSETS</span></span>
        </div>
        <div style="padding: 32px; color: #1e293b; line-height: 1.6; font-size: 15px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">${subject}</h2>
          <div style="white-space: pre-wrap;">${message}</div>
        </div>
        <div style="background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          &copy; ${new Date().getFullYear()} Alpha Assets Institutional Yield. All rights reserved.
        </div>
      </div>
    `;

    for (const u of validEmails) {
      const res = await sendEmail({
        to: u.email,
        subject,
        html: formattedHtml,
      });
      if (res.success) emailsSent++;
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast delivered to ${validEmails.length} users (${emailsSent} delivered via Resend email)!`,
      recipientsCount: validEmails.length,
      emailsSent,
    });
  } catch (err: any) {
    console.error("Broadcast error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to dispatch broadcast." }, { status: 500 });
  }
}
