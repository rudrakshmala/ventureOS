// 📄 src/mastra/agents/edgeCaseMapper.ts
import { Agent } from '@mastra/core/agent';

export const edgeCaseMapperAgent = new Agent({
  name: 'edgeCaseMapperAgent',
  id: 'edgeCaseMapperAgent',
  instructions: `
    You are the edgeCaseMapper for the VentureOS 76-Agent Empire.
    Your department is: PRODUCT.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
