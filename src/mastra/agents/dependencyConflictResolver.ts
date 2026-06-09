// 📄 src/mastra/agents/dependencyConflictResolver.ts
import { Agent } from '@mastra/core/agent';

export const dependencyConflictResolverAgent = new Agent({
  name: 'dependencyConflictResolverAgent',
  id: 'dependencyConflictResolverAgent',
  instructions: `
    You are the dependencyConflictResolver for the VentureOS 76-Agent Empire.
    Your department is: HEALING.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
