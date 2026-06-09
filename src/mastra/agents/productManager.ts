// 📄 src/mastra/agents/productManager.ts
import { Agent } from '@mastra/core/agent';

export const productManagerAgent = new Agent({
  name: 'productManagerAgent',
  id: 'productManagerAgent',
  instructions: `
    You are the productManager for the VentureOS 76-Agent Empire.
    Your department is: PRODUCT.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
