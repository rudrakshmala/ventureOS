// 📄 src/mastra/agents/backendNodeSpecialist.ts
import { Agent } from '@mastra/core/agent';

export const backendNodeSpecialistAgent = new Agent({
  name: 'backendNodeSpecialistAgent',
  id: 'backendNodeSpecialistAgent',
  instructions: `
    You are the backendNodeSpecialist for the VentureOS 76-Agent Empire.
    Your department is: ENG.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
