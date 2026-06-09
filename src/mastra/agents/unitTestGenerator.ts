// 📄 src/mastra/agents/unitTestGenerator.ts
import { Agent } from '@mastra/core/agent';

export const unitTestGeneratorAgent = new Agent({
  name: 'unitTestGeneratorAgent',
  id: 'unitTestGeneratorAgent',
  instructions: `
    You are the unitTestGenerator for the VentureOS 76-Agent Empire.
    Your department is: QA.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
