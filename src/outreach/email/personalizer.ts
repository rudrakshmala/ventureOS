// 📄 src/outreach/email/personalizer.ts — Email Personalization using PitchCrafterAgent
import { pitchCrafterAgent } from '../../mastra/agents/pitchCrafter.js';
import { templates } from './templates.js';
import type { ApolloLead } from '../sources/apollo.js';

export class EmailPersonalizer {
  async personalize(lead: ApolloLead, sequence: number = 1): Promise<{ subject: string; html: string }> {
    console.log(`🤖 [Personalizer] Generating personalized pitch for ${lead.firstName} at ${lead.company}`);
    
    try {
      const response = await pitchCrafterAgent.generate([
        {
          role: 'user',
          content: `
            Write a pitch for this lead:
            Name: ${lead.firstName} ${lead.lastName}
            Company: ${lead.company}
            Title: ${lead.title}
            Industry: ${lead.industry}
            Location: ${lead.location}
            
            Return JSON with { subject, body } using the exact rules in your instructions.
          `
        }
      ], { output: "json" });

      let pitchData: any;
      try {
        pitchData = JSON.parse(response.text);
      } catch (e) {
        // Fallback parsing if LLM wraps in markdown
        const match = response.text.match(/\\{.*\\}/s);
        if (match) {
          pitchData = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse PitchCrafter response as JSON');
        }
      }

      // If we're on follow-up 1 or 2, we use our static templates but fill the variables
      // If sequence == 1, we prefer the AI-generated pitch body but fallback to template if needed
      
      let html = pitchData.body || templates.cold_intro;
      const subject = pitchData.subject || `Quick question for ${lead.company}`;

      if (sequence === 2) html = templates.follow_up_1;
      if (sequence === 3) html = templates.follow_up_2;

      // Replace template variables if using templates
      html = html
        .replace(/{{first_name}}/g, lead.firstName || 'there')
        .replace(/{{company}}/g, lead.company || 'your company')
        .replace(/{{industry}}/g, lead.industry || 'your')
        .replace(/{{pain_point}}/g, pitchData.pain_point || 'scaling engineering capacity')
        .replace(/{{relevant_project}}/g, pitchData.relevant_project || 'custom software solutions');

      // Ensure HTML formatting
      if (!html.includes('<p>')) {
        html = html.split('\\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
      }

      return { subject, html };
    } catch (error: any) {
      console.error(`🔴 [Personalizer] Failed to personalize for ${lead.email}:`, error.message);
      
      // Fallback to basic template
      let html = templates.cold_intro;
      if (sequence === 2) html = templates.follow_up_1;
      if (sequence === 3) html = templates.follow_up_2;

      html = html
        .replace(/{{first_name}}/g, lead.firstName || 'there')
        .replace(/{{company}}/g, lead.company || 'your company')
        .replace(/{{industry}}/g, lead.industry || 'your')
        .replace(/{{pain_point}}/g, 'scaling engineering capacity')
        .replace(/{{relevant_project}}/g, 'custom software solutions');

      return {
        subject: `Quick question for ${lead.company}`,
        html
      };
    }
  }
}

export const emailPersonalizer = new EmailPersonalizer();
