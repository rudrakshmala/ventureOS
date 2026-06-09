// 📄 src/mastra/agents/uiUxFlowDesigner.ts
import { Agent } from '@mastra/core/agent';

export const uiUxFlowDesignerAgent = new Agent({
  name: 'uiUxFlowDesignerAgent',
  id: 'uiUxFlowDesignerAgent',
  instructions: `
    You are the uiUxFlowDesigner for the VentureOS 76-Agent Empire.
    Your department is: PRODUCT.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
