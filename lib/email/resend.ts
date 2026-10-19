import { Resend } from "resend";

// Initialize Resend instance lazily
let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_your_resend_api_key_here") {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    from ||
    process.env.RESEND_FROM_EMAIL ||
    "Alpha Assets <noreply@alphaassets.com>";

  if (!apiKey || apiKey.startsWith("re_placeholder")) {
    console.warn(
      `[Resend Email Mock] RESEND_API_KEY not set. Email not sent to: ${Array.isArray(to) ? to.join(", ") : to}. Subject: "${subject}"`
    );
    return {
      success: false,
      error: "RESEND_API_KEY environment variable is not configured.",
    };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "Failed to initialize Resend client." };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " ").trim().substring(0, 300),
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend Success]: Email sent to ${Array.isArray(to) ? to.join(", ") : to} [ID: ${data?.id}]`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err.message || "Failed to send email." };
  }
}

export function getAdminNotificationEmail(): string | null {
  return process.env.ADMIN_EMAIL || null;
}
