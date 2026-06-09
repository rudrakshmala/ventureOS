// 📄 src/mastra/agents/dockerfileCreator.ts
import { Agent } from '@mastra/core/agent';

export const dockerfileCreatorAgent = new Agent({
  name: 'dockerfileCreatorAgent',
  id: 'dockerfileCreatorAgent',
  instructions: `
    You are the dockerfileCreator for the VentureOS 76-Agent Empire.
    Your department is: DEVOPS.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
