import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_HOST = (process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com').trim();
// Default to port 2525 as cloud hosting (Render, AWS, DigitalOcean) blocks port 587/465/25
const SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || '2525', 10);
const SMTP_USER = (process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SMTP_USER || 'b5786a001@smtp-brevo.com').trim();
const SMTP_PASS = (process.env.BREVO_SMTP_KEY || 'xsmtpsib-c6631c60c4656c1ba3be795c6f60f1a94fa9a47c45ecc92add4e4f83827b7d6d-lSfZ8ZsyTNeXjIGh').trim();

export function getSenderEmail() {
  const envFrom = (process.env.BREVO_SENDER_EMAIL || process.env.BREVO_FROM_EMAIL || '').trim();
  if (envFrom && !envFrom.includes('@smtp-brevo.com')) {
    return envFrom;
  }
  return 'forgeindiaconnectfic@gmail.com';
}

const FROM_NAME = (process.env.BREVO_SENDER_NAME || process.env.BREVO_FROM_NAME || 'urban').trim();

function createBrevoTransporter(port = SMTP_PORT) {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    connectionTimeout: 2500,
    greetingTimeout: 2000,
    socketTimeout: 3000,
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Primary configured transporter
export const transporter = createBrevoTransporter(SMTP_PORT);

// Diagnostic verification on startup (bounded by 2s timeout)
export async function testSmtpConnection() {
  const timeoutPromise = new Promise((resolve) => 
    setTimeout(() => resolve({ success: false, error: 'Startup SMTP test timed out' }), 2000)
  );

  const testPromise = (async () => {
    try {
      const t = createBrevoTransporter(SMTP_PORT);
      await t.verify();
      console.log(`📧 Brevo SMTP Relay Connected & Ready (smtp-relay.brevo.com:${SMTP_PORT})`);
      return { success: true, port: SMTP_PORT };
    } catch (err) {
      if (err.message && err.message.includes('525')) {
        console.warn(`⚠️ [Brevo SMTP IP Whitelist Warning]: Brevo rejected connection with 525 5.7.1 Unauthorized IP address.`);
      }
      return { success: false, error: err.message };
    }
  })();

  return Promise.race([testPromise, timeoutPromise]);
}

/**
 * Sends a real-time verification OTP email via Brevo REST API or Multi-Port SMTP Relay
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Customer full name
 * @param {string} otp - 6-digit numeric OTP code
 */
export async function sendRegistrationOtpEmail(toEmail, toName, otp) {
  const recipientName = toName || 'Valued Customer';
  const fromEmail = getSenderEmail();
  const mailSubject = `${otp} is your Forge India Connect verification code`;
  const mailText = `Hello ${recipientName},\n\nYour 6-digit account verification code for Forge India Connect is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this OTP with anyone.\n\nThank you,\nForge India Connect Team`;
  const mailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0F172A; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block; background-color: #6E42E5; color: #FFFFFF; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 8px; letter-spacing: -0.5px; margin-bottom: 8px;">
                      FIC
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: -0.2px;">
                      Forge India Connect
                    </h1>
                    <p style="margin: 4px 0 0; color: #94A3B8; font-size: 12.5px;">
                      India's Verified Doorstep Home Services Platform
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px;">
                    <h2 style="margin: 0 0 12px; color: #0F172A; font-size: 18px; font-weight: 700;">
                      Verify Your Email Address
                    </h2>
                    <p style="margin: 0 0 20px; color: #475569; font-size: 14.5px; line-height: 1.6;">
                      Hello <strong>${recipientName}</strong>,<br>
                      Welcome to Forge India Connect! Please use the following One-Time Password (OTP) to complete your account registration and verify your email.
                    </p>

                    <!-- OTP Box -->
                    <div style="background: #F4F0FF; border: 2px dashed #6E42E5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-size: 12px; font-weight: 800; color: #6E42E5; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                        Your One-Time Password
                      </span>
                      <div style="font-size: 36px; font-weight: 900; color: #0F172A; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                        ${otp}
                      </div>
                      <span style="font-size: 12px; color: #64748B; display: block; margin-top: 8px;">
                        ⏱️ Valid for 10 minutes only
                      </span>
                    </div>

                    <p style="margin: 0 0 16px; color: #64748B; font-size: 13px; line-height: 1.5;">
                      If you did not initiate this registration request, please ignore this email. No account will be created without this verification code.
                    </p>
                    
                    <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 20px;">
                      <p style="margin: 0; color: #059669; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                        🛡️ 100% Verified Quality • Aadhaar KYC Verified Specialists • 30-Day Guarantee
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 32px; text-align: center;">
                    <p style="margin: 0; color: #94A3B8; font-size: 11.5px;">
                      © 2026 Forge India Connect Technologies India Pvt. Ltd. All rights reserved.<br>
                      Rayakottai Road, Krishnagiri, Tamil Nadu 635001
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

  // 1. If Brevo REST API v3 key is provided, attempt HTTP delivery (Port 443 HTTPS - never blocked)
  const apiKey = (process.env.BREVO_API_KEY || (process.env.BREVO_SMTP_KEY?.startsWith('xkeysib-') ? process.env.BREVO_SMTP_KEY : '')).trim();
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const apiResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: fromEmail },
          to: [{ email: toEmail, name: recipientName }],
          subject: mailSubject,
          htmlContent: mailHtml,
          textContent: mailText
        })
      });
      clearTimeout(timeoutId);
      const data = await apiResponse.json();
      if (apiResponse.ok && (data.messageId || data.messageIds)) {
        const mId = data.messageId || (data.messageIds && data.messageIds[0]);
        console.log(`✅ [Brevo API Sent] OTP email dispatched to ${toEmail} via Brevo REST API (MessageId: ${mId})`);
        return { success: true, messageId: mId, method: 'api' };
      }
      console.warn('⚠️ [Brevo API Error]:', data);
    } catch (apiErr) {
      console.warn('⚠️ [Brevo API Fetch Error]:', apiErr.message);
    }
  }

  // 1B. Resend REST API (Port 443 HTTPS)
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <onboarding@resend.dev>`,
          to: [toEmail],
          subject: mailSubject,
          html: mailHtml,
          text: mailText
        })
      });
      clearTimeout(timeoutId);
      const data = await resendRes.json();
      if (resendRes.ok && data.id) {
        console.log(`✅ [Resend API Sent] OTP email dispatched to ${toEmail} (Id: ${data.id})`);
        return { success: true, messageId: data.id, method: 'resend' };
      }
    } catch (e) {
      console.warn('⚠️ [Resend API Error]:', e.message);
    }
  }

  // 2. Multi-Port Brevo SMTP Relay Delivery with hard overall timeout
  const mailOptions = {
    from: `"${FROM_NAME}" <${fromEmail}>`,
    to: toEmail,
    replyTo: fromEmail,
    subject: mailSubject,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    },
    text: mailText,
    html: mailHtml
  };

  const smtpDeliveryPromise = (async () => {
    // Attempt configured port (default 2525), then 587
    const candidatePorts = [SMTP_PORT, 2525, 587].filter((v, i, a) => a.indexOf(v) === i);
    let lastError = null;
    for (const port of candidatePorts) {
      try {
        const currentTransporter = createBrevoTransporter(port);
        const info = await currentTransporter.sendMail(mailOptions);
        console.log(`✅ [Brevo SMTP Sent] OTP email successfully dispatched to ${toEmail} via port ${port} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, method: `smtp:${port}` };
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [Brevo SMTP Attempt Failed on port ${port}]:`, err.message);
        if (err.message && err.message.includes('525')) {
          break; // IP whitelist issue, no point trying other ports
        }
      }
    }

    const isIpBlocked = Boolean(lastError?.message && lastError.message.includes('525'));
    console.error(`❌ [Brevo Error] SMTP delivery attempt to ${toEmail} failed:`, lastError?.message);

    return {
      success: false,
      error: lastError?.message || 'SMTP delivery failed on candidate ports',
      isIpBlocked,
      clientIp: '223.178.86.143'
    };
  })();

  // Guarantee that this function never hangs the server response for more than 8 seconds
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        error: 'SMTP connection timed out: Brevo mail server did not respond within 8 seconds',
        isIpBlocked: false,
        clientIp: '223.178.86.143'
      });
    }, 8000);
  });

  return Promise.race([smtpDeliveryPromise, timeoutPromise]);
}
