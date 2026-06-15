# VentureOS Payment Workflow

1. Lead replies to cold email -> you discuss scope manually
2. POST /api/v1/projects/:id/quote with { amount: <INR> } 
   -> sets priceQuoted, status becomes 'scoping'
3. POST /api/v1/payments/create with { projectId } 
   -> generates 50% upfront Razorpay link, returns paymentUrl
   -> send this link to the client manually (email/Telegram)
4. Client pays -> Razorpay webhook fires -> status becomes 'building'
5. You build + deliver the project
6. POST /api/v1/payments/create-final with { projectId }
   -> generates final 50% link, send to client
7. Client pays final -> webhook fires -> status becomes 'paid'

## Required Railway environment variables (main service):
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET  
- RAZORPAY_WEBHOOK_SECRET

## Razorpay webhook setup (manual, in Razorpay dashboard):
1. Settings -> Webhooks -> Add New Webhook
2. URL: https://ventureos-production.up.railway.app/api/v1/payments/webhook
3. Active events: payment_link.paid
4. Copy the webhook secret shown -> set as RAZORPAY_WEBHOOK_SECRET
