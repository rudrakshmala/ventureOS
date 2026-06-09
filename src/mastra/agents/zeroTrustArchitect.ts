// 📄 src/mastra/agents/zeroTrustArchitect.ts
import { Agent } from '@mastra/core/agent';

export const zeroTrustArchitectAgent = new Agent({
  name: 'zeroTrustArchitectAgent',
  id: 'zeroTrustArchitectAgent',
  instructions: `
    You are the zeroTrustArchitect for the VentureOS 76-Agent Empire.
    Your department is: CYBER.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
