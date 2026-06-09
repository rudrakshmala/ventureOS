// 📄 src/mastra/tools/emailTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ─── EMAIL CONFIG ──────────────────────────────────────────────────────────
// Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env file.
// In DEMO_MODE=true, emails are logged to ./outreach-log/ instead of sent.
const DEMO_MODE = process.env.SMTP_USER ? false : true;

function getTransporter() {
  if (DEMO_MODE) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });
}

export const emailTool = createTool({
  id: 'emailTool',
  description: 'Sends an email via SMTP (or logs it to disk in demo mode)',
  inputSchema: z.object({
    to: z.string().describe('Recipient email address'),
    subject: z.string().describe('Email subject line'),
    textBody: z.string().describe('Plain text email body'),
    htmlBody: z.string().optional().describe('HTML email body (optional)'),
    from: z.string().optional().describe('Sender name and email'),
    leadId: z.string().optional().describe('Associated lead ID for tracking'),
  }),
  execute: async ({ input }) => {
    const { to, subject, textBody, htmlBody, from, leadId } = input;
    const senderAddress = from || `VentureOS <${process.env.SMTP_USER || 'noreply@ventureos.ai'}>`;

    // ── DEMO MODE: log to disk ──────────────────────────────────────────────
    if (DEMO_MODE) {
      const logDir = path.resolve(process.cwd(), 'outreach-log');
      fs.mkdirSync(logDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `${timestamp}_${(leadId || 'unknown').slice(0, 8)}.txt`;
      const logContent = [
        `TO: ${to}`,
        `FROM: ${senderAddress}`,
        `SUBJECT: ${subject}`,
        `DATE: ${new Date().toISOString()}`,
        `LEAD_ID: ${leadId || 'N/A'}`,
        `---`,
        textBody
      ].join('\n');
      fs.writeFileSync(path.join(logDir, filename), logContent, 'utf8');
      return {
        success: true,
        mode: 'DEMO',
        loggedTo: `outreach-log/${filename}`,
        message: '📁 Email logged to disk (set SMTP_USER in .env to send real emails)',
        sentAt: new Date().toISOString()
      };
    }

    // ── LIVE MODE: send via SMTP ────────────────────────────────────────────
    try {
      const transporter = getTransporter()!;
      const info = await transporter.sendMail({
        from: senderAddress,
        to,
        subject,
        text: textBody,
        html: htmlBody || `<pre style="font-family:sans-serif">${textBody}</pre>`,
      });
      return {
        success: true,
        mode: 'LIVE',
        messageId: info.messageId,
        response: info.response,
        sentAt: new Date().toISOString()
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});
