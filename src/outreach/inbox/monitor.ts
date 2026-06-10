// 📄 src/outreach/inbox/monitor.ts — IMAP Inbox Monitor for Replies
import imap from 'imap-simple';
import { createClient } from '@libsql/client';
import { memoryBus } from '../../memory/bus.js';
import dotenv from 'dotenv';
dotenv.config();

const IMAP_HOST = process.env.IMAP_HOST || 'imap.gmail.com';
const IMAP_USER = process.env.IMAP_USER || '';
const IMAP_PASS = process.env.IMAP_PASS || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const db = createClient({ url: 'file:./venture_core.db' });

export class InboxMonitor {
  private config = {
    imap: {
      user: IMAP_USER,
      password: IMAP_PASS,
      host: IMAP_HOST,
      port: 993,
      tls: true,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };
  
  private isConfigured(): boolean {
    return IMAP_USER.length > 0 && IMAP_PASS.length > 0;
  }

  async checkInbox(): Promise<number> {
    if (!this.isConfigured()) {
      console.warn('⚠️ [InboxMonitor] IMAP credentials not configured. Skipping inbox check.');
      return 0;
    }

    try {
      console.log('📥 [InboxMonitor] Connecting to IMAP server...');
      const connection = await imap.connect(this.config);
      await connection.openBox('INBOX');

      // Search for unread emails from the last 24 hours
      const delay = 24 * 3600 * 1000;
      const yesterday = new Date(Date.now() - delay).toISOString();
      const searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
      
      const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], markSeen: true };
      const messages = await connection.search(searchCriteria, fetchOptions);

      console.log(`📥 [InboxMonitor] Found ${messages.length} unread messages.`);
      
      let replyCount = 0;

      for (const item of messages) {
        const header = item.parts.find((p: any) => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
        const body = item.parts.find((p: any) => p.which === 'TEXT');
        
        if (!header || !body) continue;

        const from = header.body.from?.[0] || '';
        const subject = header.body.subject?.[0] || '';
        
        // Extract email address
        const emailMatch = from.match(/<(.+)>/);
        const email = emailMatch ? emailMatch[1] : from;

        // Verify if this is a lead in our system
        const leadRes = await db.execute({
          sql: 'SELECT * FROM Lead WHERE contactEmail = ?',
          args: [email]
        });

        if (leadRes.rows.length > 0) {
          const lead = leadRes.rows[0];
          
          console.log(`🔥 [InboxMonitor] Hot Reply Detected from ${email}!`);
          
          // 1. Update Lead Status in DB
          await db.execute({
            sql: 'UPDATE Lead SET status = ? WHERE id = ?',
            args: ['REPLIED', lead.id]
          });
          
          await db.execute({
            sql: 'UPDATE OutreachCampaign SET status = ?, repliedAt = ?, replyBody = ? WHERE leadId = ? AND status = ?',
            args: ['REPLIED', new Date().toISOString(), body.body, lead.id, 'SENT']
          });

          // 2. Write to Memory Bus
          await memoryBus.write('inboxMonitor', `hot_lead_${lead.id}`, {
            id: lead.id,
            email: lead.contactEmail,
            name: lead.authorUsername,
            company: lead.authorUsername, // Mapping approximation
            subject,
            body: body.body
          }, 'sales');

          // 3. Send Telegram Notification
          await this.notifyTelegram(`🔥 HOT LEAD REPLY!\nFrom: ${email}\nSubject: ${subject}\n\nLogin to VentureOS Dashboard to view.`);

          replyCount++;
        }
      }

      connection.end();
      return replyCount;
      
    } catch (error: any) {
      console.error('🔴 [InboxMonitor] IMAP error:', error.message);
      return 0;
    }
  }

  async notifyTelegram(message: string): Promise<void> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      });
    } catch (error) {
      console.error('🔴 [InboxMonitor] Telegram notify failed:', error);
    }
  }
}

export const inboxMonitor = new InboxMonitor();
