// 📄 src/outreach/email/sender.ts — Email sending infrastructure using Resend
import { Resend } from 'resend';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDING_DOMAIN = process.env.SENDING_DOMAIN || 'ventures.yourdomain.com';
const DAILY_LIMIT = 100;

const db = createClient({ url: 'file:./venture_core.db' });
let dbInitialized = false;

async function initDb() {
  if (dbInitialized) return;
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS email_quota (
      date TEXT PRIMARY KEY,
      sent_count INTEGER DEFAULT 0
    );
  `);
  dbInitialized = true;
}

export class EmailSender {
  private resend: Resend | null = null;

  constructor() {
    if (RESEND_API_KEY) {
      this.resend = new Resend(RESEND_API_KEY);
    } else {
      console.warn('⚠️ [EmailSender] RESEND_API_KEY not configured. Running in mock mode.');
    }
  }

  async checkQuota(): Promise<boolean> {
    await initDb();
    const today = new Date().toISOString().split('T')[0];
    
    // Ensure row exists
    await db.execute({
      sql: 'INSERT OR IGNORE INTO email_quota (date, sent_count) VALUES (?, 0)',
      args: [today]
    });

    const res = await db.execute({
      sql: 'SELECT sent_count FROM email_quota WHERE date = ?',
      args: [today]
    });

    const sentCount = (res.rows[0]?.sent_count as number) || 0;
    return sentCount < DAILY_LIMIT;
  }

  async incrementQuota(): Promise<void> {
    await initDb();
    const today = new Date().toISOString().split('T')[0];
    await db.execute({
      sql: 'UPDATE email_quota SET sent_count = sent_count + 1 WHERE date = ?',
      args: [today]
    });
  }

  async send(to: string, subject: string, html: string, fromName: string = 'Alex'): Promise<boolean> {
    const hasQuota = await this.checkQuota();
    if (!hasQuota) {
      console.warn(`🔴 [EmailSender] Daily quota (${DAILY_LIMIT}) exhausted. Skipping send to ${to}`);
      return false;
    }

    const fromAddress = `${fromName} <${fromName.toLowerCase()}@${SENDING_DOMAIN}>`;

    console.log(`📧 [EmailSender] Sending email to ${to} (Subject: "${subject}")`);

    if (!this.resend) {
      // Mock mode
      console.log(`   [Mock] Would have sent via Resend API from: ${fromAddress}`);
      await this.incrementQuota();
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('🔴 [EmailSender] Resend API error:', error);
        return false;
      }

      await this.incrementQuota();
      console.log(`✅ [EmailSender] Email sent successfully (ID: ${data?.id})`);
      return true;
    } catch (err: any) {
      console.error('🔴 [EmailSender] Unexpected error during send:', err.message);
      return false;
    }
  }

  async sendBatch(emails: { to: string; subject: string; html: string; fromName?: string }[], delayMs: number = 2000): Promise<number> {
    let sent = 0;
    for (const email of emails) {
      const success = await this.send(email.to, email.subject, email.html, email.fromName);
      if (success) {
        sent++;
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } else {
        // Stop batch if quota hit or major error
        break;
      }
    }
    return sent;
  }
}

export const emailSender = new EmailSender();
