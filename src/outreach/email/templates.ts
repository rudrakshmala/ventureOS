// 📄 src/outreach/email/templates.ts — Email Templates
export const templates = {
  cold_intro: `
    <p>Hi {{first_name}},</p>
    <p>Noticed {{company}} has been growing and thought I'd reach out. Many companies in the {{industry}} space struggle with {{pain_point}} as they scale.</p>
    <p>We've recently helped teams solve exactly this by building {{relevant_project}}. Our autonomous engineering team spins up custom solutions in days, not months.</p>
    <p>Would you be open to a quick 15-minute chat to see if we could help {{company}} accelerate its roadmap?</p>
    <p>Best,<br>Alex</p>
  `,
  
  follow_up_1: `
    <p>Hi {{first_name}},</p>
    <p>Just floating this to the top of your inbox. I know things get busy.</p>
    <p>We're currently taking on new projects and I genuinely think our approach to {{pain_point}} could save {{company}} a lot of engineering hours.</p>
    <p>Any interest in a brief intro call?</p>
    <p>Best,<br>Alex</p>
  `,
  
  follow_up_2: `
    <p>Hi {{first_name}},</p>
    <p>Looks like the timing isn't right to discuss {{relevant_project}} for {{company}}. I'll stop reaching out for now.</p>
    <p>If things change down the line and you need rapid engineering capacity, feel free to reply here.</p>
    <p>Take care,<br>Alex</p>
  `
};
