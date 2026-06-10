// 📄 src/outreach/pipeline.ts — Outreach Pipeline Orchestrator
import { leadSourceRouter } from './sources/index.js';
import { emailPersonalizer } from './email/personalizer.js';
import { emailSender } from './email/sender.js';
import { inboxMonitor } from './inbox/monitor.js';
import { createClient } from '@libsql/client';
import { memoryBus } from '../memory/bus.js';

const db = createClient({ url: 'file:./venture_core.db' });

export class OutreachPipeline {
  private isRunning = false;

  async start(): Promise<{ message: string }> {
    if (this.isRunning) {
      return { message: 'Pipeline is already running' };
    }
    this.isRunning = true;
    
    try {
      console.log('🚀 [OutreachPipeline] Starting daily cycle...');
      
      // 1. Check Inbox for replies
      await inboxMonitor.checkInbox();

      // 2. Process Follow-ups (leads that didn't reply after X days)
      await this.processFollowUps();

      // 3. Source and Pitch New Leads
      const hasQuota = await emailSender.checkQuota();
      if (hasQuota) {
        await this.sourceAndPitchNewLeads();
      } else {
        console.log('⚠️ [OutreachPipeline] Daily email quota reached. Skipping new leads.');
      }

      console.log('✅ [OutreachPipeline] Daily cycle complete.');
      return { message: 'Pipeline cycle executed successfully' };
    } catch (error: any) {
      console.error('🔴 [OutreachPipeline] Pipeline failed:', error.message);
      return { message: `Pipeline failed: ${error.message}` };
    } finally {
      this.isRunning = false;
    }
  }

  private async sourceAndPitchNewLeads() {
    console.log('🔍 [OutreachPipeline] Sourcing new leads...');
    const newLeads = await leadSourceRouter.getLeads({ limit: 10 });
    
    if (newLeads.length === 0) {
      console.log('⚠️ [OutreachPipeline] No new leads found.');
      return;
    }

    let sent = 0;
    for (const lead of newLeads) {
      const hasQuota = await emailSender.checkQuota();
      if (!hasQuota) break;

      // Check if lead already exists
      const existing = await db.execute({
        sql: 'SELECT id FROM Lead WHERE contactEmail = ?',
        args: [lead.email]
      });

      if (existing.rows.length > 0) continue;

      console.log(`🧠 [OutreachPipeline] Processing ${lead.email}...`);

      // 1. Personalize Pitch
      const pitch = await emailPersonalizer.personalize(lead, 1);

      // 2. Save Lead
      const leadId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO Lead (id, source, authorUsername, contactEmail, postTitle, postContent, painPoint, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [leadId, 'apollo', lead.firstName || 'Unknown', lead.email, `${lead.title} at ${lead.company}`, 
               `Industry: ${lead.industry}, Size: ${lead.companySize}`, '', 'PITCHED']
      });

      // 3. Send Email
      const success = await emailSender.send(lead.email, pitch.subject, pitch.html);

      // 4. Save Campaign Status
      if (success) {
        const campaignId = crypto.randomUUID();
        await db.execute({
          sql: `INSERT INTO OutreachCampaign (id, leadId, sequence, subject, body, status, sentAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [campaignId, leadId, 1, pitch.subject, pitch.html, 'SENT', new Date().toISOString()]
        });
        
        // Write to memory bus for agents to see
        await memoryBus.write('outreachPipeline', `pitch_${leadId}`, {
          leadId, email: lead.email, company: lead.company, sequence: 1
        }, 'sales');
        
        sent++;
      }
    }
    console.log(`✉️ [OutreachPipeline] Sent ${sent} initial pitches.`);
  }

  private async processFollowUps() {
    console.log('🔄 [OutreachPipeline] Processing follow-ups...');
    
    // Find sent campaigns that haven't been replied to, where sentAt is > 3 days for seq 1, or > 7 days for seq 2
    // Simplified logic for brevity: Just get 'SENT' campaigns
    const campaigns = await db.execute({
      sql: `SELECT o.id, o.sequence, o.sentAt, l.id as leadId, l.contactEmail, l.authorUsername as firstName, l.postTitle as company
            FROM OutreachCampaign o
            JOIN Lead l ON o.leadId = l.id
            WHERE o.status = 'SENT' AND l.status != 'REPLIED'`,
      args: []
    });

    let followUpsSent = 0;
    const now = new Date().getTime();

    for (const row of campaigns.rows) {
      const hasQuota = await emailSender.checkQuota();
      if (!hasQuota) break;

      const sentAt = new Date(row.sentAt as string).getTime();
      const daysSince = (now - sentAt) / (1000 * 3600 * 24);
      const seq = row.sequence as number;

      if ((seq === 1 && daysSince >= 3) || (seq === 2 && daysSince >= 7)) {
        const nextSeq = seq + 1;
        if (nextSeq > 3) continue; // Max 3 sequences

        console.log(`🔄 [OutreachPipeline] Sending follow-up ${nextSeq} to ${row.contactEmail}...`);
        
        const mockLead = {
          id: row.leadId as string,
          firstName: row.firstName as string,
          lastName: '',
          email: row.contactEmail as string,
          company: (row.company as string).split(' at ')[1] || '',
          title: '',
        };

        const pitch = await emailPersonalizer.personalize(mockLead, nextSeq);
        const success = await emailSender.send(mockLead.email, pitch.subject, pitch.html);

        if (success) {
          // Update old campaign to COMPLETED
          await db.execute({
            sql: `UPDATE OutreachCampaign SET status = 'COMPLETED' WHERE id = ?`,
            args: [row.id]
          });

          // Create new sequence record
          const newCampId = crypto.randomUUID();
          await db.execute({
            sql: `INSERT INTO OutreachCampaign (id, leadId, sequence, subject, body, status, sentAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [newCampId, row.leadId, nextSeq, pitch.subject, pitch.html, 'SENT', new Date().toISOString()]
          });
          
          followUpsSent++;
        }
      }
    }
    console.log(`✉️ [OutreachPipeline] Sent ${followUpsSent} follow-ups.`);
  }

  async getStats(): Promise<any> {
    try {
      const leads = await db.execute({ sql: 'SELECT COUNT(*) as c FROM Lead', args: [] });
      const sent = await db.execute({ sql: `SELECT COUNT(*) as c FROM OutreachCampaign WHERE status = 'SENT' OR status = 'COMPLETED'`, args: [] });
      const replied = await db.execute({ sql: `SELECT COUNT(*) as c FROM OutreachCampaign WHERE status = 'REPLIED'`, args: [] });
      
      const sentCount = leads.rows[0].c as number;
      const repliedCount = replied.rows[0].c as number;
      const rate = sentCount > 0 ? ((repliedCount / sentCount) * 100).toFixed(1) + '%' : '0%';

      return {
        leads: leads.rows[0].c,
        sent: sent.rows[0].c,
        replied: replied.rows[0].c,
        conversion_rate: rate
      };
    } catch (e) {
      return { leads: 0, sent: 0, replied: 0, conversion_rate: '0%' };
    }
  }
}

export const outreachPipeline = new OutreachPipeline();
