// 📄 src/mastra/agents/customerPersona.ts
import { Agent } from '@mastra/core/agent';

export const customerPersonaAgent = new Agent({
  name: 'customerPersonaAgent',
  id: 'customerPersonaAgent',
  instructions: `
    You are the customerPersona for the VentureOS 76-Agent Empire.
    Your department is: PRODUCT.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
