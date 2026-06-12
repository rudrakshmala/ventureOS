export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Template 1: Cold intro — first touch, max 150 words
// Variables: {{firstName}}, {{company}}, {{painPoint}}, {{relevantProject}}
export const coldIntroTemplate = (vars: {
  firstName: string
  company: string
  painPoint: string
  relevantProject: string
  senderName: string
}): EmailTemplate => ({
  subject: `Quick question about ${vars.company}'s tech stack`,
  html: `
    <p>Hi ${vars.firstName},</p>
    <p>I noticed ${vars.company} is working on ${vars.painPoint}.</p>
    <p>We recently built something similar — ${vars.relevantProject} — and shipped it in under 72 hours using our AI-powered development system.</p>
    <p>We handle everything: architecture, code, testing, deployment. You describe what you want, we deliver it.</p>
    <p>Worth a 15-minute call to see if we can save your team months of work?</p>
    <p>— ${vars.senderName}</p>
    <p style="font-size:11px;color:#999;">Don't want more emails? <a href="{{unsubscribeUrl}}">Unsubscribe here</a></p>
  `,
  text: `Hi ${vars.firstName},\n\nI noticed ${vars.company} is working on ${vars.painPoint}.\n\nWe recently built something similar — ${vars.relevantProject} — and shipped it in under 72 hours.\n\nWorth a 15-min call?\n\n— ${vars.senderName}\n\nUnsubscribe: {{unsubscribeUrl}}`
})

// Template 2: Follow-up day 3 — soft nudge, 80 words max
export const followUp1Template = (vars: {
  firstName: string
  senderName: string
}): EmailTemplate => ({
  subject: `Re: Quick question about your tech stack`,
  html: `
    <p>Hi ${vars.firstName},</p>
    <p>Just checking in on my note from earlier this week.</p>
    <p>If you're not the right person for this, happy to hear who is. If timing is off, I can follow up next month.</p>
    <p>— ${vars.senderName}</p>
    <p style="font-size:11px;color:#999;"><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
  `,
  text: `Hi ${vars.firstName},\n\nJust checking in on my note from earlier this week.\n\nIf timing is off, happy to follow up later.\n\n— ${vars.senderName}\n\nUnsubscribe: {{unsubscribeUrl}}`
})

// Template 3: Follow-up day 7 — close the loop, 60 words
export const followUp2Template = (vars: {
  firstName: string
  senderName: string
}): EmailTemplate => ({
  subject: `Closing the loop`,
  html: `
    <p>Hi ${vars.firstName},</p>
    <p>Last email, I promise.</p>
    <p>If you ever need an AI system to build and deploy software for you — fast and affordably — I'm here.</p>
    <p>Good luck with everything.</p>
    <p>— ${vars.senderName}</p>
    <p style="font-size:11px;color:#999;"><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
  `,
  text: `Hi ${vars.firstName},\n\nLast email. If you ever need fast, AI-powered software delivery — I'm here.\n\nGood luck!\n\n— ${vars.senderName}\n\nUnsubscribe: {{unsubscribeUrl}}`
})
