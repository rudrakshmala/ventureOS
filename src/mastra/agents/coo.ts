// 📄 src/mastra/agents/coo.ts
import { Agent } from '@mastra/core/agent';

export const cooAgent = new Agent({
  name: 'cooAgent',
  id: 'cooAgent',
  instructions: `
    You are the coo for the VentureOS 76-Agent Empire.
    Your department is: EXEC.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
