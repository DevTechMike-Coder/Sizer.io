import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendVerificationEmailParams {
  to: string;
  code: string;
  name?: string | null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

export async function sendVerificationEmail({ to, code, name }: SendVerificationEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || "Sizer.io Security <onboarding@resend.dev>";
  const greetingName = name?.trim() ? name.trim() : "Trader";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code - Sizer.io</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090d16;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #1e293b;background:linear-gradient(180deg, rgba(37,99,235,0.18) 0%, rgba(15,23,42,0) 100%);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display:inline-block;font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">
                      SIZER<span style="color:#3b82f6;">.IO</span>
                    </div>
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-top:2px;">
                      Institutional Risk OS
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Account Verification Code
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                Hello <strong style="color:#f8fafc;">${greetingName}</strong>,<br />
                Use the one-time verification code below to confirm your identity and complete your login or registration.
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center" style="background-color:#020617;border:1px solid #2563eb;border-radius:12px;padding:24px 16px;">
                    <div style="font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                      Your One-Time Password
                    </div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#38bdf8;padding-left:8px;">
                      ${code}
                    </div>
                    <div style="font-size:12px;color:#64748b;margin-top:10px;">
                      Valid for the next <strong>10 minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px 0;font-size:13px;line-height:1.5;color:#94a3b8;">
                If you did not request this verification code, someone may have entered your email by mistake. You can safely ignore this email.
              </p>

              <div style="border-top:1px solid #1e293b;padding-top:20px;margin-top:28px;">
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.4;">
                  🛡️ <strong>Security Tip:</strong> Sizer.io representatives will never ask you for your verification code or account password.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#020617;border-top:1px solid #1e293b;text-align:center;">
              <p style="margin:0;font-size:11px;color:#475569;">
                &copy; ${new Date().getFullYear()} Sizer.io Terminal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const textContent = `
Sizer.io - Institutional Risk OS
Account Verification Code

Hello ${greetingName},

Your verification code is: ${code}

This code will expire in 10 minutes.
If you did not request this code, you can safely disregard this email.
`;

  // 1. Direct Resend API (Recommended & Fast)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject: `${code} is your Sizer.io verification code`,
        text: textContent,
        html: htmlContent,
      });

      if (error) {
        console.error(`[Resend Error] Failed to send email to ${to}:`, error);
        return { success: false };
      }

      console.log(`[Resend] Verification OTP email dispatched to ${to} (ID: ${data?.id})`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error(`[Resend Error] Unexpected failure sending to ${to}:`, err);
      return { success: false };
    }
  }

  // 2. Standard SMTP Transporter (Fallback)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: `${code} is your Sizer.io verification code`,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[SMTP] Verification OTP email dispatched to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[SMTP Error] Failed to send email via SMTP to ${to}:`, err);
      console.log(`[Email Fallback] Dev Verification Code for ${to}: ${code}`);
      return { success: false };
    }
  }

  // 3. Development / Local Simulator (When no API key or SMTP is configured)
  console.log(`\n======================================================`);
  console.log(`✉️ [SIZER EMAIL SIMULATOR]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${code} is your Sizer.io verification code`);
  console.log(`Verification Code: >> ${code} <<`);
  console.log(`(Set RESEND_API_KEY in .env for live inbox dispatch)`);
  console.log(`======================================================\n`);
  return { success: true };
}
