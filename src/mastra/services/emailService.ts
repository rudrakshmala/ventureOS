// 📄 src/mastra/services/emailService.ts
// Centralized email delivery service with demo/live mode switching
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const DEMO_MODE = false; // Strictly enforced LIVE mode for production earning

export interface EmailPayload {
  to: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
  from?: string;
  leadId?: string;
  campaignId?: string;
}

export interface EmailResult {
  success: boolean;
  mode: 'DEMO' | 'LIVE';
  messageId?: string;
  logPath?: string;
  error?: string;
  sentAt: string;
}

function buildTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    tls: { rejectUnauthorized: false }
  });
}

function buildHtmlEmail(textBody: string, subject: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
           background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: white; 
                 border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
              padding: 20px; color: white; font-size: 14px; font-weight: 600; }
    .body { padding: 28px; line-height: 1.7; font-size: 15px; white-space: pre-wrap; }
    .footer { padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0;
              font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">VentureOS</div>
    <div class="body">${textBody.replace(/\n/g, '<br>')}</div>
    <div class="footer">
      You received this because you posted about needing development help.<br>
      To unsubscribe, reply with "unsubscribe" in the subject.
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, textBody, htmlBody, from, leadId, campaignId } = payload;
  const sender = from || `VentureOS <${process.env.SMTP_USER || 'outreach@ventureos.ai'}>`;
  const timestamp = new Date().toISOString();

  if (DEMO_MODE) {
    throw new Error('DEMO_MODE is strictly disabled. You must configure real SMTP credentials to send real pitches.');
  }

  try {
    const transporter = buildTransporter();
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text: textBody,
      html: htmlBody || buildHtmlEmail(textBody, subject),
    });
    console.log(`✅ [Email Service] LIVE: Sent "${subject}" → ${to} (${info.messageId})`);
    return { success: true, mode: 'LIVE', messageId: info.messageId, sentAt: timestamp };
  } catch (error: any) {
    console.error(`❌ [Email Service] Send failed: ${error.message}`);
    return { success: false, mode: 'LIVE', error: error.message, sentAt: timestamp };
  }
}

export function getEmailConfig() {
  return {
    mode: DEMO_MODE ? 'DEMO' : 'LIVE',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpUser: process.env.SMTP_USER ? '***configured***' : 'NOT SET',
    instructions: DEMO_MODE
      ? 'Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to .env to enable live sending'
      : 'Live email sending is active'
  };
}
