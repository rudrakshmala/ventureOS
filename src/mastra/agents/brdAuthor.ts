// 📄 src/mastra/agents/brdAuthor.ts
import { Agent } from '@mastra/core/agent';

export const brdAuthorAgent = new Agent({
  name: 'brdAuthorAgent',
  id: 'brdAuthorAgent',
  instructions: `
    You are the brdAuthor for the VentureOS 76-Agent Empire.
    Your department is: PRODUCT.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
