import { Agent } from '@mastra/core/agent';
import { groq } from '@ai-sdk/groq';

export const triageSupervisor = new Agent({
  id: 'triage-supervisor', // ◄ Ensure this is present
  name: 'Triage Supervisor',
  instructions: `
    You are the Chief Product Officer of VentureOS. Your single responsibility is to take a 
    raw business idea from a user and break it down into an actionable technical file structure.
    Output your analysis clearly, detailing exactly what files and features must exist.
  `,
  model: groq('llama-3.3-70b-versatile'),
});