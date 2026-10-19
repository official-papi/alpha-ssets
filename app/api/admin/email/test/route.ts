import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { testEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Please provide a valid recipient email address." }, { status: 400 });
    }

    const { subject, html } = testEmail({ recipientEmail: email });
    const result = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to deliver email through Resend.",
        hint: "Ensure RESEND_API_KEY is defined in .env.local and RESEND_FROM_EMAIL uses your verified domain in Resend.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email dispatched successfully to ${email}!`,
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
