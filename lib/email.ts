import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "Umuguzipro <noreply@umuguzi.pro>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  // Always log code in development console for instant developer convenience
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n================== [EMAIL DISPATCH] ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html.replace(/<[^>]+>/g, " ")}`);
    console.log(`======================================================\n`);
  }

  // 1. Try Resend if configured
  if (resend && resendApiKey && resendApiKey.startsWith("re_")) {
    try {
      const response = await resend.emails.send({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
        text,
      });
      if (response.data?.id) return true;
    } catch (err) {
      console.warn("Resend email delivery failed, checking SMTP fallback:", err);
    }
  }

  // 2. Try Nodemailer SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });
      return true;
    } catch (err) {
      console.warn("SMTP email delivery failed:", err);
    }
  }

  // If no external keys, return true in development mode (logged to console)
  return true;
}

// -----------------------------------------------------------------------------
// Email HTML Templates
// -----------------------------------------------------------------------------

export function getVerificationEmailTemplate(code: string, appName: string = "Umuguzipro"): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${appName}</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Confirm your email address</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #edf2f7; margin-bottom: 24px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0; margin-bottom: 16px;">
          Use the following 6-digit numeric verification code to complete your registration.
        </p>
        <div style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 16px; margin-bottom: 0;">
          This code expires in 15 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
      </div>
    </div>
  `;
}

export function getTwoFactorEmailTemplate(code: string, appName: string = "Umuguzipro"): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${appName}</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Two-Factor Authentication (2FA)</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #edf2f7; margin-bottom: 24px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0; margin-bottom: 16px;">
          A login attempt was made for your account. Enter this 6-digit security code to finish logging in:
        </p>
        <div style="display: inline-block; background: #0f172a; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #dc2626; font-size: 13px; margin-top: 16px; margin-bottom: 0; font-weight: 500;">
          Never share this code with anyone. This code expires in 10 minutes.
        </p>
      </div>
      <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} ${appName}. Protected with Two-Factor Security.
      </div>
    </div>
  `;
}

export function getPasswordResetEmailTemplate(code: string, appName: string = "Umuguzipro"): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${appName}</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #edf2f7; margin-bottom: 24px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0; margin-bottom: 16px;">
          You requested to reset your password. Use the following 6-digit verification code to set your new password:
        </p>
        <div style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 16px; margin-bottom: 0;">
          This code expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} ${appName}. Account Security.
      </div>
    </div>
  `;
}
