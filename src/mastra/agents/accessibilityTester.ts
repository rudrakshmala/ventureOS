// 📄 src/mastra/agents/accessibilityTester.ts
import { Agent } from '@mastra/core/agent';

export const accessibilityTesterAgent = new Agent({
  name: 'accessibilityTesterAgent',
  id: 'accessibilityTesterAgent',
  instructions: `
    You are the accessibilityTester for the VentureOS 76-Agent Empire.
    Your department is: QA.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
