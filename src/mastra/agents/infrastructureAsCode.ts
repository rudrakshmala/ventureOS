// 📄 src/mastra/agents/infrastructureAsCode.ts
import { Agent } from '@mastra/core/agent';

export const infrastructureAsCodeAgent = new Agent({
  name: 'infrastructureAsCodeAgent',
  id: 'infrastructureAsCodeAgent',
  instructions: `
    You are the infrastructureAsCode for the VentureOS 76-Agent Empire.
    Your department is: DEVOPS.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
