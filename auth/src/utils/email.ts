import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// SMTP Email Utility — Production-grade OTP delivery for IntelliDoc
//
// Behaviour:
//  • In test or missing-SMTP_HOST → mock (log to console, never throws)
//  • In production              → real SMTP with retry and connection verify
//
// Config (set in auth/.env):
//  SMTP_HOST         e.g. smtp.gmail.com | smtp.sendgrid.net | smtp.mailgun.org
//  SMTP_PORT         587 (STARTTLS) | 465 (SSL) | 25
//  SMTP_SECURE       "true" for port 465, "false" for 587/25
//  SMTP_USER         your SMTP login / API username
//  SMTP_PASS         your SMTP password / API key
//  SMTP_FROM         display name + address  e.g. '"IntelliDoc" <noreply@yourdomain.com>'
// ─────────────────────────────────────────────────────────────────────────────

const isMockMode =
  process.env.NODE_ENV === 'test' ||
  !process.env.SMTP_HOST ||
  process.env.SMTP_HOST === 'YOUR_SMTP_HOST';

// Build the transporter once — nodemailer reuses the connection pool
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    // true for port 465 (SSL), false for 587 (STARTTLS) — matches major providers
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Retry on transient network failures (e.g. DNS blip)
    connectionTimeout: 10_000, // 10 s
    greetingTimeout:   5_000,  // 5 s
    socketTimeout:     10_000, // 10 s
    pool: true,                // keep-alive connection pool
    maxConnections: 5,
  });

  return _transporter;
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildOTPHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IntelliDoc Admin OTP</title>
</head>
<body style="margin:0;padding:0;background:#faf9f3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="border:4px solid #000;background:#fff;box-shadow:8px 8px 0 #000;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:20px 32px;">
              <p style="margin:0;color:#ffde59;font-size:11px;font-weight:900;
                         letter-spacing:4px;text-transform:uppercase;">
                IntelliDoc · Admin Portal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 32px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;
                          text-transform:uppercase;letter-spacing:-1px;">
                Admin Login Code
              </h1>
              <p style="margin:0 0 32px;color:#444;font-size:15px;line-height:1.6;">
                Use the one-time password below to complete your admin login.
                This code expires in <strong>5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="border:4px solid #000;background:#ffde59;padding:24px;
                           text-align:center;box-shadow:6px 6px 0 #000;
                           margin-bottom:32px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:900;
                            letter-spacing:4px;text-transform:uppercase;color:#555;">
                  Your OTP
                </p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;
                            color:#000;line-height:1;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                If you did not request this code, please ignore this email.<br />
                Never share this code with anyone — IntelliDoc staff will never ask for it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:3px solid #000;padding:16px 32px;background:#faf9f3;">
              <p style="margin:0;font-size:11px;color:#999;font-weight:700;
                          text-transform:uppercase;letter-spacing:2px;">
                IntelliDoc Systems · Automated Security Email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── Plain-text fallback ───────────────────────────────────────────────────────

function buildOTPText(otp: string): string {
  return [
    'IntelliDoc Admin Portal — One-Time Password',
    '============================================',
    '',
    `Your OTP: ${otp}`,
    '',
    'This code expires in 5 minutes.',
    'If you did not request this, please ignore this email.',
    '',
    '— IntelliDoc Systems',
  ].join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an OTP email to the given address.
 *
 * - In test / no-SMTP-configured mode: prints to console and returns immediately.
 * - In production: verifies SMTP connection once, then sends with retry.
 *
 * @throws Error if SMTP send fails after all retries (caller should handle gracefully).
 */
export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (isMockMode) {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║        MOCK EMAIL — NOT SENT         ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  TO  : ${to.padEnd(29)}║`);
    console.log(`║  OTP : ${otp.padEnd(29)}║`);
    console.log('╚══════════════════════════════════════╝\n');
    console.log('→ To enable real email: set SMTP_HOST in auth/.env\n');
    return;
  }

  // ── Production mode ────────────────────────────────────────────────────────
  const transporter = getTransporter();

  // Verify SMTP connection on first use (fails fast if credentials are wrong)
  try {
    await transporter.verify();
  } catch (err) {
    const msg = `[email] SMTP connection failed — check SMTP_HOST/USER/PASS in .env: ${err}`;
    console.error(msg);
    throw new Error(msg);
  }

  const from =
    process.env.SMTP_FROM || '"IntelliDoc Admin" <noreply@intellidoc.com>';

  const mailOptions: SendMailOptions = {
    from,
    to,
    subject: 'Your IntelliDoc Admin Login Code',
    text: buildOTPText(otp),
    html: buildOTPHtml(otp),
    // Helps deliverability: sets List-Unsubscribe and precedence headers
    headers: {
      'X-Mailer': 'IntelliDoc-Auth/1.0',
      Precedence: 'transactional',
    },
  };

  // Simple retry (3 attempts, 1 s back-off)
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[email] OTP sent to ${to} — messageId: ${info.messageId}`);
      return;
    } catch (err) {
      console.error(`[email] Send attempt ${attempt}/${MAX_RETRIES} failed:`, err);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 1_000 * attempt)); // 1s, 2s back-off
    }
  }
}
