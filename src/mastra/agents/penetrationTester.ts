// 📄 src/mastra/agents/penetrationTester.ts
import { Agent } from '@mastra/core/agent';

export const penetrationTesterAgent = new Agent({
  name: 'penetrationTesterAgent',
  id: 'penetrationTesterAgent',
  instructions: `
    You are the penetrationTester for the VentureOS 76-Agent Empire.
    Your department is: CYBER.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
