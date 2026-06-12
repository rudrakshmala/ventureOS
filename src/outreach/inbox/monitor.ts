import imaps from 'imap-simple'
import { PrismaClient } from '@prisma/client'
import { memoryBus } from '../../memory/index.js'

// Polls inbox every 5 minutes for replies
// When a reply is found: updates DB, writes to MemoryBus, notifies you via Telegram
export async function startReplyMonitor(prisma: PrismaClient): Promise<void> {
  const config = {
    imap: {
      user: process.env.IMAP_USER || '',
      password: process.env.IMAP_PASS || '',
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  }

  if (!config.imap.user || !config.imap.password) {
    console.warn('[ReplyMonitor] IMAP credentials not configured — reply detection disabled')
    return
  }

  const checkInbox = async () => {
    try {
      const connection = await imaps.connect(config)
      await connection.openBox('INBOX')

      // Look for unseen messages from the last 24 hours
      const since = new Date()
      since.setDate(since.getDate() - 1)

      const searchCriteria = ['UNSEEN', ['SINCE', since]]
      const fetchOptions = { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'], markSeen: false }

      const messages = await connection.search(searchCriteria, fetchOptions)
      
      for (const message of messages) {
        const header = message.parts.find((p: any) => p.which === 'HEADER.FIELDS (FROM SUBJECT DATE)')
        const body = message.parts.find((p: any) => p.which === 'TEXT')
        
        if (!header) continue

        const fromHeader = header.body?.from?.[0] || ''
        const subjectHeader = header.body?.subject?.[0] || ''
        
        // Extract email from "Name <email>" format
        const emailMatch = fromHeader.match(/<([^>]+)>/) || [null, fromHeader]
        const senderEmail = emailMatch[1]?.toLowerCase()

        if (!senderEmail) continue

        // Check if this is a reply from one of our leads
        const lead = await prisma.salesLead.findUnique({ where: { email: senderEmail } })
        
        if (lead && lead.status !== 'replied' && lead.status !== 'closed_won') {
          const preview = body?.body?.substring(0, 200) || ''
          
          // Update lead status
          await prisma.salesLead.update({
            where: { email: senderEmail },
            data: {
              status: 'replied',
              repliedAt: new Date(),
              replyPreview: preview
            }
          })

          // Broadcast to memory bus — engineering & executive can see hot leads
          await memoryBus.promoteLead(lead.id, {
            email: senderEmail,
            name: lead.name,
            company: lead.company,
            subject: subjectHeader,
            preview,
            repliedAt: new Date().toISOString()
          })

          // Send Telegram notification to you immediately
          await notifyTelegram(`🔥 REPLY FROM ${lead.name || senderEmail} (${lead.company || 'Unknown Co'})\n\nSubject: ${subjectHeader}\n\nPreview: ${preview.substring(0, 150)}...`)
          
          console.log(`[ReplyMonitor] 🎯 Reply detected from ${senderEmail}`)
        }
      }

      connection.end()
    } catch (err: any) {
      console.error('[ReplyMonitor] Error:', err.message)
    }
  }

  // Run immediately, then every 5 minutes
  await checkInbox()
  setInterval(checkInbox, 5 * 60 * 1000)
  console.log('[ReplyMonitor] Started — checking every 5 minutes')
}

async function notifyTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.log('[Telegram] Not configured — reply notification:', message)
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    })
  } catch (err: any) {
    console.error('[Telegram] Failed to send notification:', err.message)
  }
}
