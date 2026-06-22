import { PrismaClient } from '@prisma/client'
import { acquireLeads } from './sources/index.js'
import { sendEmail, checkQuota } from './email/sender.js'
import { coldIntroTemplate, followUp1Template, followUp2Template } from './email/templates.js'
import { memoryBus } from '../memory/index.js'

export class OutreachPipeline {
  private prisma: PrismaClient
  private isRunning = false

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Main daily cycle — called at 9am IST by cron
  async runDailyCycle(): Promise<void> {
    if (this.isRunning) {
      console.log('[Pipeline] Already running — skipping')
      return
    }

    this.isRunning = true
    console.log('[Pipeline] Starting daily outreach cycle')
    
    // Create database log
    const runLog = await this.prisma.agentRunLog.create({
      data: {
        runType: 'PITCH_RUN',
        status: 'RUNNING',
        logs: 'Starting daily outreach cycle\n'
      }
    })

    const appendLog = async (msg: string) => {
      console.log(`[Pipeline] ${msg}`)
      await this.prisma.agentRunLog.update({
        where: { id: runLog.id },
        data: { logs: { increment: msg + '\n' } as any } // prisma doesn't support string increment, let's query and update
      }).catch(() => {})
    }

    const updateLogString = async (msg: string) => {
      try {
        const current = await this.prisma.agentRunLog.findUnique({ where: { id: runLog.id } })
        await this.prisma.agentRunLog.update({
          where: { id: runLog.id },
          data: { logs: (current?.logs || '') + msg + '\n' }
        })
      } catch {}
    }

    try {
      // Step 1: Acquire new leads
      await updateLogString('Step 1: Acquiring new leads...')
      const newLeads = await acquireLeads(this.prisma, 20)
      await updateLogString(`Acquired ${newLeads} leads.`)
      await memoryBus.write('pipeline', 'daily_new_leads', newLeads, 'sales')

      // Step 2: Check quota
      const quota = await checkQuota(this.prisma)
      if (!quota.allowed) {
        await updateLogString('[Pipeline] Quota exhausted — stopping')
        await this.prisma.agentRunLog.update({
          where: { id: runLog.id },
          data: { status: 'FAILED', completedAt: new Date() }
        })
        return
      }

      const availableSlots = quota.max - quota.used
      let sent = 0

      // Step 3: Send cold intros to sourced leads
      const coldLeads = await this.prisma.salesLead.findMany({
        where: { status: 'sourced' },
        take: Math.floor(availableSlots * 0.6),
        orderBy: { createdAt: 'asc' }
      })

      for (const lead of coldLeads) {
        if (sent >= availableSlots) break
        
        const template = coldIntroTemplate({
          firstName: lead.name?.split(' ')[0] || 'there',
          company: lead.company || 'your company',
          painPoint: lead.painPoint || 'scaling your product',
          relevantProject: await this.getRelevantProject(lead.company || ''),
          senderName: process.env.SENDER_NAME || 'Rudraksh'
        })

        const result = await sendEmail(this.prisma, lead.email, template, lead.id)
        
        if (result.success) {
          await updateLogString(`Email sent successfully to ${lead.email}`)
          await this.prisma.salesLead.update({
            where: { id: lead.id },
            data: { status: 'emailed', pitchSent: template.html }
          })
          sent++
          // Rate limit: 30 second delay between sends to avoid spam flags
          await new Promise(r => setTimeout(r, 30000))
        } else {
          await updateLogString(`FAILED to send email to ${lead.email}: ${result.error || 'Unknown error'}`)
        }
      }

      // Step 4: Send follow-up 1 to leads emailed 3+ days ago
      const followUp1Leads = await this.prisma.salesLead.findMany({
        where: {
          status: 'emailed',
          updatedAt: { lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        },
        take: Math.floor(availableSlots * 0.25)
      })

      for (const lead of followUp1Leads) {
        if (sent >= availableSlots) break
        const template = followUp1Template({
          firstName: lead.name?.split(' ')[0] || 'there',
          senderName: process.env.SENDER_NAME || 'Rudraksh'
        })
        const result = await sendEmail(this.prisma, lead.email, template, lead.id)
        if (result.success) {
          await updateLogString(`Follow-up 1 sent successfully to ${lead.email}`)
          await this.prisma.salesLead.update({ where: { id: lead.id }, data: { status: 'follow_up_1' } })
          sent++
          await new Promise(r => setTimeout(r, 30000))
        } else {
          await updateLogString(`FAILED to send Follow-up 1 to ${lead.email}: ${result.error || 'Unknown error'}`)
        }
      }

      // Step 5: Send follow-up 2 to leads at follow_up_1 for 4+ days
      const followUp2Leads = await this.prisma.salesLead.findMany({
        where: {
          status: 'follow_up_1',
          updatedAt: { lte: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
        },
        take: Math.floor(availableSlots * 0.15)
      })

      for (const lead of followUp2Leads) {
        if (sent >= availableSlots) break
        const template = followUp2Template({
          firstName: lead.name?.split(' ')[0] || 'there',
          senderName: process.env.SENDER_NAME || 'Rudraksh'
        })
        const result = await sendEmail(this.prisma, lead.email, template, lead.id)
        if (result.success) {
          await updateLogString(`Follow-up 2 sent successfully to ${lead.email}`)
          await this.prisma.salesLead.update({ where: { id: lead.id }, data: { status: 'follow_up_2' } })
          sent++
          await new Promise(r => setTimeout(r, 30000))
        } else {
          await updateLogString(`FAILED to send Follow-up 2 to ${lead.email}: ${result.error || 'Unknown error'}`)
        }
      }

      // Write daily stats to memory bus for dashboard
      const stats = await this.getStats()
      await memoryBus.write('pipeline', 'daily_stats', stats, 'executive')
      
      const completeMsg = `[Pipeline] Cycle complete — sent ${sent} emails`
      console.log(completeMsg)
      await updateLogString(completeMsg)

      await this.prisma.agentRunLog.update({
        where: { id: runLog.id },
        data: { 
          status: 'SUCCESS', 
          pitchesSent: sent, 
          completedAt: new Date() 
        }
      })

    } catch (error: any) {
      console.error('[Pipeline Error]', error)
      await updateLogString(`CRASH: ${error.message || error}`)
      await this.prisma.agentRunLog.update({
        where: { id: runLog.id },
        data: { 
          status: 'FAILED', 
          completedAt: new Date() 
        }
      }).catch(() => {})
    } finally {
      this.isRunning = false
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const [sourced, emailed, followUp1, followUp2, replied, closedWon, closedLost] = await Promise.all([
      this.prisma.salesLead.count({ where: { status: 'sourced' } }),
      this.prisma.salesLead.count({ where: { status: 'emailed' } }),
      this.prisma.salesLead.count({ where: { status: 'follow_up_1' } }),
      this.prisma.salesLead.count({ where: { status: 'follow_up_2' } }),
      this.prisma.salesLead.count({ where: { status: 'replied' } }),
      this.prisma.salesLead.count({ where: { status: 'closed_won' } }),
      this.prisma.salesLead.count({ where: { status: 'closed_lost' } })
    ])

    const totalContacted = emailed + followUp1 + followUp2 + replied + closedWon + closedLost
    const conversionRate = totalContacted > 0 ? Math.round((replied + closedWon) / totalContacted * 100) : 0

    return { sourced, emailed, followUp1, followUp2, replied, closedWon, closedLost, totalContacted, conversionRate }
  }

  private async getRelevantProject(company: string): Promise<string> {
    // Find the most recently built project to reference in cold email
    const project = await this.prisma.salesProject.findFirst({
      where: { status: 'delivered' },
      orderBy: { createdAt: 'desc' }
    })
    return project ? `a ${project.brief.substring(0, 60)}` : 'an MVP for a startup like yours'
  }

  // Schedule for 9am IST (UTC+5:30) = 3:30 UTC
  startScheduler(): void {
    const run = () => {
      const now = new Date()
      const istHour = (now.getUTCHours() + 5) % 24
      const istMinute = (now.getUTCMinutes() + 30) % 60
      if (istHour === 9 && istMinute < 5) {
        this.runDailyCycle()
      }
    }
    setInterval(run, 5 * 60 * 1000)  // Check every 5 minutes
    console.log('[Pipeline] Scheduler started — runs daily at 9am IST')
  }
}
