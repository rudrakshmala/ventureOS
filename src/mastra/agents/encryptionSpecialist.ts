// 📄 src/mastra/agents/encryptionSpecialist.ts
import { Agent } from '@mastra/core/agent';

export const encryptionSpecialistAgent = new Agent({
  name: 'encryptionSpecialistAgent',
  id: 'encryptionSpecialistAgent',
  instructions: `
    You are the encryptionSpecialist for the VentureOS 76-Agent Empire.
    Your department is: CYBER.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
