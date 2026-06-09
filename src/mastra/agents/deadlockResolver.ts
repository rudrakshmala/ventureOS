// 📄 src/mastra/agents/deadlockResolver.ts
import { Agent } from '@mastra/core/agent';

export const deadlockResolverAgent = new Agent({
  name: 'deadlockResolverAgent',
  id: 'deadlockResolverAgent',
  instructions: `
    You are the deadlockResolver for the VentureOS 76-Agent Empire.
    Your department is: HEALING.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
