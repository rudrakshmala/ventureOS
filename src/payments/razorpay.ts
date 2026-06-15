// PAYMENT: All payment creation and verification passes through this file

export interface PaymentLinkResult {
  paymentUrl: string
  orderId: string
}

// PAYMENT: Creates a Razorpay payment link for 50% upfront
export async function createPaymentLink(
  amount: number,    // full project amount in INR (e.g. 25000)
  projectId: string,
  clientEmail: string,
  description: string
): Promise<PaymentLinkResult | null> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('[Payment] Razorpay credentials not configured — cannot create link')
    return null
  }

  const upfrontAmount = Math.floor(amount / 2)
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: upfrontAmount * 100,  // paise
        currency: 'INR',
        description: `50% advance — ${description}`,
        customer: { email: clientEmail },
        notify: { sms: false, email: true },
        reminder_enable: true,
        notes: { project_id: projectId, payment_type: '50_upfront' },
        callback_url: `${process.env.APP_URL}/api/v1/payments/callback`,
        callback_method: 'get'
      })
    })

    if (!response.ok) {
      console.error('[Payment] Razorpay error:', response.status, await response.text())
      return null
    }

    const data = await response.json() as any
    return {
      paymentUrl: data.short_url || `https://rzp.io/${data.id}`,
      orderId: data.id
    }
  } catch (err: any) {
    console.error('[Payment] Exception:', err.message)
    return null
  }
}

// PAYMENT: Creates the FINAL 50% payment link, called after delivery
export async function createFinalPaymentLink(
  amount: number,
  projectId: string,
  clientEmail: string,
  description: string
): Promise<PaymentLinkResult | null> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('[Payment] Razorpay credentials not configured')
    return null
  }

  const finalAmount = Math.ceil(amount / 2)
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: finalAmount * 100,
        currency: 'INR',
        description: `Final 50% — ${description}`,
        customer: { email: clientEmail },
        notify: { sms: false, email: true },
        reminder_enable: true,
        notes: { project_id: projectId, payment_type: '50_final' },
        callback_url: `${process.env.APP_URL}/api/v1/payments/callback`,
        callback_method: 'get'
      })
    })

    if (!response.ok) {
      console.error('[Payment] Razorpay error:', response.status, await response.text())
      return null
    }

    const data = await response.json() as any
    return {
      paymentUrl: data.short_url || `https://rzp.io/${data.id}`,
      orderId: data.id
    }
  } catch (err: any) {
    console.error('[Payment] Exception:', err.message)
    return null
  }
}

// PAYMENT: Verifies the Razorpay webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Payment] RAZORPAY_WEBHOOK_SECRET not configured')
    return false
  }
  const crypto = require('crypto')
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}
