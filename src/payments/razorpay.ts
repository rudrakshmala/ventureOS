// PAYMENT: All payment creation and verification passes through this file
// Razorpay docs: https://razorpay.com/docs/payments/payment-links/

interface RazorpayOrderResponse {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
  short_url?: string
}

// PAYMENT: Create a payment link for 50% upfront
export async function createPaymentLink(
  amount: number,  // in INR (e.g. 15000 for ₹15,000)
  projectId: string,
  clientEmail: string,
  description: string
): Promise<{ paymentUrl: string; orderId: string } | null> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('[Payment] Razorpay credentials not configured')
    return null
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  
  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amount * 100,  // Razorpay uses paise
        currency: 'INR',
        description: `50% advance — ${description}`,
        customer: { email: clientEmail },
        notify: { sms: false, email: true },
        reminder_enable: true,
        notes: {
          project_id: projectId,
          payment_type: '50_upfront',
          description: description
        },
        callback_url: `${process.env.APP_URL}/api/v1/payments/callback`,
        callback_method: 'get'
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Payment] Razorpay error:', err)
      return null
    }

    const data: RazorpayOrderResponse = await response.json()
    return {
      paymentUrl: data.short_url || `https://rzp.io/${data.id}`,
      orderId: data.id
    }

  } catch (err: any) {
    console.error('[Payment] Exception:', err.message)
    return null
  }
}

// PAYMENT: Verify webhook signature from Razorpay
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}
