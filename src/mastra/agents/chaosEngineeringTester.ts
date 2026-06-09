// 📄 src/mastra/agents/chaosEngineeringTester.ts
import { Agent } from '@mastra/core/agent';

export const chaosEngineeringTesterAgent = new Agent({
  name: 'chaosEngineeringTesterAgent',
  id: 'chaosEngineeringTesterAgent',
  instructions: `
    You are the chaosEngineeringTester for the VentureOS 76-Agent Empire.
    Your department is: QA.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
