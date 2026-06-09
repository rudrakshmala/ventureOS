// 📄 src/mastra/agents/sqlInjectionBlocker.ts
import { Agent } from '@mastra/core/agent';

export const sqlInjectionBlockerAgent = new Agent({
  name: 'sqlInjectionBlockerAgent',
  id: 'sqlInjectionBlockerAgent',
  instructions: `
    You are the sqlInjectionBlocker for the VentureOS 76-Agent Empire.
    Your department is: CYBER.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
