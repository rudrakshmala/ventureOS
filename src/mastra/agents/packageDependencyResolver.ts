// 📄 src/mastra/agents/packageDependencyResolver.ts
import { Agent } from '@mastra/core/agent';

export const packageDependencyResolverAgent = new Agent({
  name: 'packageDependencyResolverAgent',
  id: 'packageDependencyResolverAgent',
  instructions: `
    You are the packageDependencyResolver for the VentureOS 76-Agent Empire.
    Your department is: ENG.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
