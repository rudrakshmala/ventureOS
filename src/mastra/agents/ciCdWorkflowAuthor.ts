// 📄 src/mastra/agents/ciCdWorkflowAuthor.ts
import { Agent } from '@mastra/core/agent';

export const ciCdWorkflowAuthorAgent = new Agent({
  name: 'ciCdWorkflowAuthorAgent',
  id: 'ciCdWorkflowAuthorAgent',
  instructions: `
    You are the ciCdWorkflowAuthor for the VentureOS 76-Agent Empire.
    Your department is: DEVOPS.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
