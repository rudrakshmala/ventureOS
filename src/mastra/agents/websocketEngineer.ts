// 📄 src/mastra/agents/websocketEngineer.ts
import { Agent } from '@mastra/core/agent';

export const websocketEngineerAgent = new Agent({
  name: 'websocketEngineerAgent',
  id: 'websocketEngineerAgent',
  instructions: `
    You are the websocketEngineer for the VentureOS 76-Agent Empire.
    Your department is: ENG.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
