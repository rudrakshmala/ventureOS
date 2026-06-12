// EMAIL: All outgoing mail passes through this file. DO NOT bypass.
import { Resend } from 'resend'
import { PrismaClient } from '@prisma/client'
import type { EmailTemplate } from './templates.js'

const resend = new Resend(process.env.RESEND_API_KEY)

// EMAIL: Check and increment daily quota before ANY send
export async function checkQuota(prisma: PrismaClient): Promise<{ allowed: boolean; used: number; max: number }> {
  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  
  const quota = await prisma.emailQuota.upsert({
    where: { date: today },
    create: { date: today, sent: 0, maxDaily: Number(process.env.EMAIL_DAILY_LIMIT || 100) },
    update: {}
  })

  return {
    allowed: quota.sent < quota.maxDaily,
    used: quota.sent,
    max: quota.maxDaily
  }
}

async function incrementQuota(prisma: PrismaClient): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await prisma.emailQuota.update({
    where: { date: today },
    data: { sent: { increment: 1 } }
  })
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// EMAIL: Primary send function — never call Resend directly, always use this
export async function sendEmail(
  prisma: PrismaClient,
  to: string,
  template: EmailTemplate,
  leadId?: string
): Promise<SendResult> {
  const { allowed, used, max } = await checkQuota(prisma)
  
  if (!allowed) {
    console.warn(`[Email] Daily quota reached (${used}/${max}). Skipping ${to}`)
    return { success: false, error: 'quota_exceeded' }
  }

  const fromDomain = process.env.SENDING_DOMAIN || 'ventures.yourdomain.com'
  const senderName = process.env.SENDER_NAME || 'Rudraksh'
  const unsubscribeBase = process.env.APP_URL || 'http://localhost:3000'
  const unsubscribeUrl = `${unsubscribeBase}/api/v1/unsubscribe?email=${encodeURIComponent(to)}&token=${Buffer.from(to).toString('base64')}`

  const html = template.html.replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)
  const text = template.text.replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)

  try {
    const { data, error } = await resend.emails.send({
      from: `${senderName} <hello@${fromDomain}>`,
      to: [to],
      subject: template.subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    await incrementQuota(prisma)
    console.log(`[Email] Sent to ${to} — ID: ${data?.id}`)
    return { success: true, messageId: data?.id }

  } catch (err: any) {
    console.error('[Email] Send exception:', err.message)
    return { success: false, error: err.message }
  }
}
