import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_HOST = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
const SMTP_USER = process.env.BREVO_SMTP_USER || 'b5786a001@smtp-brevo.com';
const SMTP_PASS = process.env.BREVO_SMTP_KEY || 'xsmtpsib-c6631c60c4656c1ba3be795c6f60f1a94fa9a47c45ecc92add4e4f83827b7d6d-lSfZ8ZsyTNeXjIGh';
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'b5786a001@smtp-brevo.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Forge India Connect';

// Configure Brevo Nodemailer Transporter
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Diagnostic verification on startup
export async function testSmtpConnection() {
  try {
    await transporter.verify();
    console.log('📧 Brevo SMTP Relay Connected & Ready (smtp-relay.brevo.com:587)');
    return { success: true };
  } catch (err) {
    if (err.message && err.message.includes('525')) {
      console.warn('⚠️ [Brevo SMTP IP Whitelist Warning]: Brevo rejected connection with 525 5.7.1 Unauthorized IP address.');
      console.warn('💡 Tip: In Brevo Dashboard -> SMTP & API -> Authorized IPs, add your current server/network IP or disable the whitelist restriction.');
    } else {
      console.warn('⚠️ [Brevo SMTP Warning]:', err.message);
    }
    return { success: false, error: err.message };
  }
}

/**
 * Sends a real-time verification OTP email via Brevo SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Customer full name
 * @param {string} otp - 6-digit numeric OTP code
 */
export async function sendRegistrationOtpEmail(toEmail, toName, otp) {
  const recipientName = toName || 'Valued Customer';
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: toEmail,
    subject: `${otp} is your Forge India Connect verification code`,
    text: `Hello ${recipientName},\n\nYour 6-digit account verification code for Forge India Connect is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this OTP with anyone.\n\nThank you,\nForge India Connect Team`,
    html: `
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
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Brevo Mail Sent] OTP email successfully dispatched to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Brevo Mail Error] Failed to send OTP to ${toEmail}:`, err.message);
    if (err.message && err.message.includes('525')) {
      console.warn('💡 Brevo 525 5.7.1 Unauthorized IP address error: Please add sending IP to Authorized IPs in Brevo Dashboard.');
    }
    return { success: false, error: err.message };
  }
}
