// Brand-styled HTML email templates for Alpha Assets

const BRAND_NAME = "Alpha Assets";
const BRAND_PRIMARY = "#093A3E";
const BRAND_ACCENT = "#3AAFB9";
const BRAND_BG = "#f4f6f8";
const TEXT_DARK = "#0f172a";
const TEXT_MUTED = "#64748b";

function baseEmailWrapper(contentHtml: string, previewText: string = ""): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${BRAND_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    a { color: ${BRAND_ACCENT}; text-decoration: none; }
    .btn { display: inline-block; padding: 14px 28px; background-color: ${BRAND_PRIMARY}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG};">
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
    ${previewText}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_BG}; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #001011; padding: 28px 36px; text-align: center; border-bottom: 2px solid #093A3E;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #093A3E; border-radius: 10px; color: #3AAFB9; font-size: 20px; font-weight: 900; margin-right: 10px; vertical-align: middle; border: 1px solid rgba(58,175,185,0.3);">▲</span>
                    <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">ALPHA <span style="color: #3AAFB9;">ASSETS</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px 18px;">
                <tr>
                  <td style="font-size: 12px; color: ${TEXT_MUTED}; line-height: 1.5;">
                    🔒 <strong>Security Notice:</strong> Alpha Assets staff will never ask for your private keys, passwords, or personal recovery phrases. Always ensure you are on the authentic platform URL.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #001011; padding: 24px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                &copy; ${year} ${BRAND_NAME}. Institutional Quantitative Yield Platform. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                This is an automated notification. For support, please contact our team via your account dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Welcome Email
export function welcomeEmail(params: { name?: string; email: string; dashboardUrl?: string }) {
  const displayName = params.name?.trim() || "Investor";
  const dashboardUrl = params.dashboardUrl || "https://alphaassets.com/dashboard";

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: ${TEXT_DARK};">
      Welcome to Alpha Assets, ${displayName}!
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Your investor account has been successfully initialized. You now have access to institutional-grade automated yield generation, secure asset custodial management, and real-time portfolio analytics.
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #065f46;">
        Account Registered: <span style="font-weight: 400; color: #047857;">${params.email}</span>
      </p>
    </div>

    <h3 style="margin: 24px 0 12px 0; font-size: 16px; font-weight: 700; color: ${TEXT_DARK};">
      Getting Started in 3 Steps:
    </h3>
    <ol style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;">
      <li><strong>Fund your Deposit Wallet:</strong> Deposit crypto (USDT, BTC, ETH) or bank transfer.</li>
      <li><strong>Activate an Investment Plan:</strong> Choose a fixed compounding duration and daily yield rate.</li>
      <li><strong>Receive Daily Yields:</strong> Returns are automatically credited to your interest wallet with flexible withdrawals.</li>
    </ol>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${dashboardUrl}" class="btn" style="color: #ffffff;">Access Your Dashboard &rarr;</a>
    </div>
  `;

  return {
    subject: `Welcome to Alpha Assets — Your Investor Portal is Ready`,
    html: baseEmailWrapper(content, "Welcome to Alpha Assets. Start generating automated investment yields."),
  };
}

// 2. Deposit Submitted (Pending Review)
export function depositSubmittedEmail(params: {
  name?: string;
  amount: number;
  gateway: string;
  trxId?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: ${TEXT_DARK};">
      Deposit Request Received (${formattedAmount})
    </h2>
    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${displayName}, we have received your deposit request. Our automated ledger and verification systems are currently validating the payment proof.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; padding: 18px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Deposit Amount:</td>
        <td style="padding: 6px 0; font-size: 15px; font-weight: 700; color: ${TEXT_DARK}; text-align: right;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Payment Gateway:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.gateway}</td>
      </tr>
      ${params.trxId ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Transaction Reference:</td>
        <td style="padding: 6px 0; font-size: 13px; font-family: monospace; font-weight: 600; color: #0284c7; text-align: right;">${params.trxId}</td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Status:</td>
        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #d97706; text-align: right;">PENDING VERIFICATION</td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Your deposit wallet will be automatically credited immediately upon blockchain confirmation or admin approval. You will receive a follow-up email once completed.
    </p>
  `;

  return {
    subject: `Deposit Request Received: ${formattedAmount} via ${params.gateway}`,
    html: baseEmailWrapper(content, `Deposit request of ${formattedAmount} is currently pending confirmation.`),
  };
}

// 3. Deposit Approved & Credited
export function depositApprovedEmail(params: {
  name?: string;
  amount: number;
  newBalance?: number;
  gateway?: string;
  trxId?: string;
  dashboardUrl?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;
  const formattedBal = params.newBalance !== undefined ? `$${params.newBalance.toFixed(2)}` : null;
  const dashboardUrl = params.dashboardUrl || "https://alphaassets.com/dashboard";

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 50%; color: #10b981; font-size: 28px;">✓</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: ${TEXT_DARK}; text-align: center;">
      Deposit Approved & Credited!
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155; text-align: center;">
      Hello ${displayName}, your recent deposit of <strong>${formattedAmount}</strong> has been verified and successfully funded to your Deposit Wallet.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 20px 0; padding: 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Amount Credited:</td>
        <td style="padding: 6px 0; font-size: 18px; font-weight: 800; color: #15803d; text-align: right;">${formattedAmount}</td>
      </tr>
      ${formattedBal ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Updated Deposit Balance:</td>
        <td style="padding: 6px 0; font-size: 15px; font-weight: 700; color: ${TEXT_DARK}; text-align: right;">${formattedBal}</td>
      </tr>
      ` : ""}
      ${params.gateway ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Gateway / Channel:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.gateway}</td>
      </tr>
      ` : ""}
      ${params.trxId ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Reference:</td>
        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #047857; text-align: right;">${params.trxId}</td>
      </tr>
      ` : ""}
    </table>

    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      You can now use your deposited balance to subscribe to our algorithmic investment plans and begin earning daily compounding yields.
    </p>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${dashboardUrl}" class="btn" style="color: #ffffff;">Invest Now &rarr;</a>
    </div>
  `;

  return {
    subject: `Deposit Confirmed: ${formattedAmount} Credited to Your Account`,
    html: baseEmailWrapper(content, `Your deposit of ${formattedAmount} has been approved and credited.`),
  };
}

// 4. Deposit Rejected
export function depositRejectedEmail(params: {
  name?: string;
  amount: number;
  reason?: string;
  dashboardUrl?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;
  const feedbackReason = params.reason || "Payment proof could not be verified on the blockchain.";

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 50%; color: #ef4444; font-size: 28px;">✕</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: ${TEXT_DARK}; text-align: center;">
      Deposit Request Declined
    </h2>
    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${displayName}, we were unable to verify your deposit request for <strong>${formattedAmount}</strong>.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #991b1b;">
        Reason for Decline:
      </p>
      <p style="margin: 0; font-size: 14px; color: #b91c1c; font-weight: 500;">
        ${feedbackReason}
      </p>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      If you believe this was an error, please ensure you submitted the correct transaction hash/screenshot and resubmit via your dashboard or contact our 24/7 support team.
    </p>
  `;

  return {
    subject: `Deposit Update: ${formattedAmount} Request Declined`,
    html: baseEmailWrapper(content, `Your deposit request of ${formattedAmount} was declined: ${feedbackReason}`),
  };
}

// 5. Withdrawal Requested (To User)
export function withdrawalSubmittedEmail(params: {
  name?: string;
  amount: number;
  netAmount: number;
  method: string;
  destination: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedGross = `$${params.amount.toFixed(2)}`;
  const formattedNet = `$${params.netAmount.toFixed(2)}`;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: ${TEXT_DARK};">
      Withdrawal Request Initiated (${formattedNet})
    </h2>
    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${displayName}, your withdrawal request has been logged and queued for settlement.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; padding: 18px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Requested Amount:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${formattedGross}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Net Payout:</td>
        <td style="padding: 6px 0; font-size: 16px; font-weight: 800; color: #0284c7; text-align: right;">${formattedNet}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Payout Method:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.method}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Destination:</td>
        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #475569; text-align: right; max-width: 250px; word-break: break-all;">${params.destination}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Status:</td>
        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #d97706; text-align: right;">PENDING DISPATCH</td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748b;">
      Standard withdrawal requests are processed within 1 to 24 hours. You will receive a confirmation once the funds have been dispatched to your designated wallet/account.
    </p>
  `;

  return {
    subject: `Withdrawal Request Logged: ${formattedNet} via ${params.method}`,
    html: baseEmailWrapper(content, `Withdrawal request of ${formattedNet} has been submitted for processing.`),
  };
}

// 6. Withdrawal Approved & Paid Out
export function withdrawalApprovedEmail(params: {
  name?: string;
  amount: number;
  method?: string;
  destination?: string;
  feedback?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 50%; color: #10b981; font-size: 28px;">✓</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: ${TEXT_DARK}; text-align: center;">
      Withdrawal Dispatched Successfully!
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155; text-align: center;">
      Hello ${displayName}, your withdrawal of <strong>${formattedAmount}</strong> has been approved and processed.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 20px 0; padding: 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Payout Amount:</td>
        <td style="padding: 6px 0; font-size: 18px; font-weight: 800; color: #15803d; text-align: right;">${formattedAmount}</td>
      </tr>
      ${params.method ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Payout Channel:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.method}</td>
      </tr>
      ` : ""}
      ${params.destination ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Recipient Destination:</td>
        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #166534; text-align: right; max-width: 250px; word-break: break-all;">${params.destination}</td>
      </tr>
      ` : ""}
      ${params.feedback ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #166534;">Dispatch Note:</td>
        <td style="padding: 6px 0; font-size: 13px; color: #047857; text-align: right;">${params.feedback}</td>
      </tr>
      ` : ""}
    </table>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Depending on blockchain network traffic or bank clearing rails, the funds should reflect in your balance shortly. Thank you for investing with Alpha Assets.
    </p>
  `;

  return {
    subject: `Payout Dispatched: ${formattedAmount} Sent Successfully`,
    html: baseEmailWrapper(content, `Your payout of ${formattedAmount} has been successfully dispatched.`),
  };
}

// 7. Withdrawal Rejected & Refunded
export function withdrawalRejectedEmail(params: {
  name?: string;
  amount: number;
  walletRefunded: string;
  reason?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;
  const walletLabel = params.walletRefunded === "deposit_wallet" ? "Deposit Wallet" : "Interest Wallet";
  const reasonText = params.reason || "Wallet address invalid or network mismatch.";

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 50%; color: #ef4444; font-size: 28px;">✕</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: ${TEXT_DARK}; text-align: center;">
      Withdrawal Request Rejected (Funds Refunded)
    </h2>
    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${displayName}, your withdrawal request for <strong>${formattedAmount}</strong> could not be completed and has been refunded back to your <strong>${walletLabel}</strong>.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #991b1b;">
        Reason for Rejection:
      </p>
      <p style="margin: 0; font-size: 14px; color: #b91c1c; font-weight: 500;">
        ${reasonText}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; padding: 18px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Refunded Amount:</td>
        <td style="padding: 6px 0; font-size: 16px; font-weight: 800; color: #059669; text-align: right;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Refund Destination:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${walletLabel}</td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Your account balance has been restored. Please double check your wallet address, network selection, or QR code and request your withdrawal again.
    </p>
  `;

  return {
    subject: `Withdrawal Rejected — ${formattedAmount} Refunded to Your ${walletLabel}`,
    html: baseEmailWrapper(content, `Your withdrawal of ${formattedAmount} was rejected and fully refunded. Reason: ${reasonText}`),
  };
}

// 8. Investment Plan Activated
export function investmentActivatedEmail(params: {
  name?: string;
  planName: string;
  amount: number;
  dailyRate: number;
  durationDays?: number;
  dashboardUrl?: string;
}) {
  const displayName = params.name?.trim() || "Investor";
  const formattedAmount = `$${params.amount.toFixed(2)}`;
  const dailyYield = `$${((params.amount * params.dailyRate) / 100).toFixed(2)}`;
  const dashboardUrl = params.dashboardUrl || "https://alphaassets.com/dashboard/investments";

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: ${TEXT_DARK};">
      Investment Plan Activated: ${params.planName}
    </h2>
    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${displayName}, congratulations! Your investment of <strong>${formattedAmount}</strong> has been allocated to the <strong>${params.planName}</strong> portfolio.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; padding: 18px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Plan Name:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: ${TEXT_DARK}; text-align: right;">${params.planName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Invested Capital:</td>
        <td style="padding: 6px 0; font-size: 15px; font-weight: 800; color: #093A3E; text-align: right;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Daily ROI:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #10b981; text-align: right;">${params.dailyRate}% (~${dailyYield}/day)</td>
      </tr>
      ${params.durationDays ? `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: ${TEXT_MUTED};">Duration:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.durationDays} Days</td>
      </tr>
      ` : ""}
    </table>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${dashboardUrl}" class="btn" style="color: #ffffff;">Track Real-Time Earnings &rarr;</a>
    </div>
  `;

  return {
    subject: `Plan Activated: ${params.planName} (${formattedAmount})`,
    html: baseEmailWrapper(content, `You have successfully activated ${params.planName} for ${formattedAmount}.`),
  };
}

// 9. Admin Notification (Deposit / Withdrawal Alert)
export function adminAlertEmail(params: {
  title: string;
  eventType: "deposit" | "withdrawal";
  userEmail: string;
  amount: number;
  methodOrGateway: string;
  details?: string;
  adminReviewUrl?: string;
}) {
  const formattedAmount = `$${params.amount.toFixed(2)}`;
  const reviewUrl = params.adminReviewUrl || "https://alphaassets.com/admin";

  const content = `
    <div style="background-color: #0f172a; color: #f8fafc; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px;">
      <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">ADMIN ACTION REQUIRED</span>
      <h3 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #ffffff;">${params.title}</h3>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
      A new user financial request has been submitted requiring administrative review or dispatch.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; padding: 18px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">User Account:</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: ${TEXT_DARK}; text-align: right;">${params.userEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Amount:</td>
        <td style="padding: 6px 0; font-size: 16px; font-weight: 800; color: #093A3E; text-align: right;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Channel / Method:</td>
        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: ${TEXT_DARK}; text-align: right;">${params.methodOrGateway}</td>
      </tr>
      ${params.details ? `
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: ${TEXT_MUTED};">Notes / Destination:</td>
        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #475569; text-align: right; max-width: 250px; word-break: break-all;">${params.details}</td>
      </tr>
      ` : ""}
    </table>

    <div style="text-align: center; margin: 24px 0 12px 0;">
      <a href="${reviewUrl}" class="btn" style="color: #ffffff;">Review in Admin Panel &rarr;</a>
    </div>
  `;

  return {
    subject: `[Admin Alert] New ${params.eventType.toUpperCase()}: ${formattedAmount} from ${params.userEmail}`,
    html: baseEmailWrapper(content, `Admin Alert: New ${params.eventType} of ${formattedAmount} submitted by ${params.userEmail}.`),
  };
}

// 10. Test Email
export function testEmail(params: { recipientEmail: string }) {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 50%; color: #3b82f6; font-size: 28px;">⚡</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: ${TEXT_DARK}; text-align: center;">
      Resend Email Service Connected!
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155; text-align: center;">
      Congratulations! Your Resend API integration and verified domain are working perfectly with <strong>Alpha Assets</strong>.
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #166534;">
        ✓ Direct Deliverability Check: SUCCESS
      </p>
      <p style="margin: 0; font-size: 13px; color: #15803d;">
        Delivered to: <strong>${params.recipientEmail}</strong> at ${new Date().toUTCString()}
      </p>
    </div>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
      All automated notifications (deposits, payouts, yield rewards, and security updates) are configured and ready for live production use.
    </p>
  `;

  return {
    subject: `✓ Alpha Assets: Resend Email Integration Verified Successfully`,
    html: baseEmailWrapper(content, "Your Resend email configuration has been successfully tested and verified."),
  };
}
