// 📄 src/mastra/agents/integrationTestRunner.ts
import { Agent } from '@mastra/core/agent';

export const integrationTestRunnerAgent = new Agent({
  name: 'integrationTestRunnerAgent',
  id: 'integrationTestRunnerAgent',
  instructions: `
    You are the integrationTestRunner for the VentureOS 76-Agent Empire.
    Your department is: QA.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
