// ── Signing confirmation emails ──────────────────────────────────────

export function signedConfirmationToClientEmail({
  signerName,
  proposalTitle,
  clientCompanyName,
  signedAt,
  referenceId,
  rabornCompany,
  signedPdfUrl,
}: {
  signerName: string
  proposalTitle: string
  clientCompanyName?: string | null
  signedAt: string
  referenceId: string
  rabornCompany: string
  signedPdfUrl: string
}) {
  return {
    subject: `Signed: ${proposalTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <div style="background:#10B981;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">&#10003; Proposal Signed</h1>
      <p style="margin:6px 0 0;color:#ffffff;font-size:13px;opacity:0.9;">Your electronic signature has been recorded.</p>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a202c;font-size:16px;line-height:1.5;">Hi ${signerName},</p>
      <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6;">
        Thank you for signing the proposal ${clientCompanyName ? `between <strong>${rabornCompany}</strong> and <strong>${clientCompanyName}</strong>` : `with <strong>${rabornCompany}</strong>`}. This email confirms your electronic acceptance of the agreement terms.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10B981;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Agreement</p>
        <p style="margin:0 0 16px;color:#003964;font-size:17px;font-weight:700;">${proposalTitle}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Signed at:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-weight:600;text-align:right;">${signedAt}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Reference ID:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-family:monospace;text-align:right;">${referenceId}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${signedPdfUrl}" style="display:inline-block;background:#10B981;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          Download Signed Copy
        </a>
      </div>

      <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;line-height:1.5;">
        This signature was captured under the U.S. E-SIGN Act (15 U.S.C. &sect; 7001) and UETA.<br/>
        A full audit trail including IP address, timestamps, and document hash has been preserved.
      </p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#a0aec0;font-size:12px;">
        Powered by Cornerstone &middot; ${rabornCompany}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}

export function signedNotificationToInternalEmail({
  recipientName,
  signerName,
  signerEmail,
  signerTitle,
  proposalTitle,
  clientCompanyName,
  signedAt,
  referenceId,
  auditTrailUrl,
}: {
  recipientName: string
  signerName: string
  signerEmail: string
  signerTitle?: string | null
  proposalTitle: string
  clientCompanyName?: string | null
  signedAt: string
  referenceId: string
  auditTrailUrl: string
}) {
  return {
    subject: `Signed: ${proposalTitle} by ${signerName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <div style="background:#003964;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Deal Won!</h1>
      <p style="margin:6px 0 0;color:#00CFF8;font-size:14px;">A proposal was just signed.</p>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a202c;font-size:16px;line-height:1.5;">Hi ${recipientName},</p>
      <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6;">
        Great news &mdash; your proposal has been signed by the client.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10B981;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 12px;color:#003964;font-size:17px;font-weight:700;">${proposalTitle}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${clientCompanyName ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Client:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-weight:600;text-align:right;">${clientCompanyName}</td></tr>` : ''}
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Signed by:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-weight:600;text-align:right;">${signerName}${signerTitle ? ` (${signerTitle})` : ''}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Email:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;text-align:right;">${signerEmail}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Signed at:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-weight:600;text-align:right;">${signedAt}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">Reference ID:</td><td style="padding:4px 0;color:#1a202c;font-size:13px;font-family:monospace;text-align:right;">${referenceId}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${auditTrailUrl}" style="display:inline-block;background:#00CFF8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          View Audit Trail
        </a>
      </div>

      <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
        The deal has been automatically moved to &ldquo;Deal Won&rdquo; in your pipeline.
      </p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#a0aec0;font-size:12px;">Powered by Cornerstone</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}
