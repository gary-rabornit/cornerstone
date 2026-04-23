import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@rabornmedia.com'

  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, html })
      console.log(`[Email] Sent to ${to}: "${subject}" (messageId: ${info.messageId})`)
      return true
    } catch (err) {
      console.error('[Email] Failed to send:', err)
      return false
    }
  } else {
    console.log('\n' + '='.repeat(60))
    console.log('[Email] No SMTP configured — logging email:')
    console.log(`  To:      ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body:    (HTML content, ${html.length} chars)`)
    console.log('='.repeat(60) + '\n')
    return true
  }
}

// ── Email Templates ──────────────────────────────────────────

export function approvalRequestEmail({
  approverName,
  proposalTitle,
  clientName,
  requesterName,
  proposalId,
  message,
}: {
  approverName: string
  proposalTitle: string
  clientName: string
  requesterName: string
  proposalId: string
  message?: string
}) {
  const approveUrl = `${APP_URL}/proposals/${proposalId}/approve`

  return {
    subject: `Approval Requested: ${proposalTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#003964;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Cornerstone</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a202c;font-size:16px;line-height:1.5;">
        Hi ${approverName},
      </p>
      <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6;">
        <strong>${requesterName}</strong> has requested your approval on a proposal:
      </p>

      <!-- Proposal Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #00CFF8;border-radius:8px;padding:20px;margin:0 0 20px;">
        <p style="margin:0 0 4px;color:#003964;font-size:17px;font-weight:700;">${proposalTitle}</p>
        <p style="margin:0;color:#718096;font-size:14px;">Client: ${clientName}</p>
      </div>

      ${message ? `
      <!-- Message -->
      <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 4px;color:#92400e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Message from ${requesterName}:</p>
        <p style="margin:0;color:#78350f;font-size:14px;line-height:1.5;font-style:italic;">"${message}"</p>
      </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${approveUrl}" style="display:inline-block;background:#00CFF8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          Review &amp; Approve
        </a>
      </div>

      <p style="margin:0;color:#a0aec0;font-size:13px;text-align:center;line-height:1.5;">
        Or copy this link: <a href="${approveUrl}" style="color:#00CFF8;">${approveUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#a0aec0;font-size:12px;">
        Powered by Cornerstone &middot; Raborn Media
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}

export function proposalSentToClientEmail({
  requesterName,
  proposalTitle,
  clientName,
  clientEmail,
  clientViewUrl,
}: {
  requesterName: string
  proposalTitle: string
  clientName: string
  clientEmail: string
  clientViewUrl: string
}) {
  return {
    subject: `Proposal: ${proposalTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#003964;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Cornerstone</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a202c;font-size:16px;line-height:1.5;">
        Hi ${clientName},
      </p>
      <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6;">
        ${requesterName} has sent you a proposal for your review:
      </p>

      <!-- Proposal Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #00CFF8;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0;color:#003964;font-size:17px;font-weight:700;">${proposalTitle}</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${clientViewUrl}" style="display:inline-block;background:#00CFF8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          View Proposal
        </a>
      </div>

      <p style="margin:0;color:#a0aec0;font-size:13px;text-align:center;line-height:1.5;">
        Or copy this link: <a href="${clientViewUrl}" style="color:#00CFF8;">${clientViewUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#a0aec0;font-size:12px;">
        Powered by Cornerstone &middot; Raborn Media
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}
