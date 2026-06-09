// 📄 src/mastra/index.ts
import { Agent } from '@mastra/core/agent';

export const coderAgent = new Agent({
  id: 'coderAgent',
  name: 'Coder Agent',
  instructions: `
    You are an expert full-stack engineer. 
    You are building an on-demand pet food delivery app matching Blinkit's architecture (dark stores, rapid inventory, express cart routing).
  `,
  // USE A NATIVELY RECOGNIZED IN-STOCK FALLBACK FOR THE UI PLAYGROUND
  model: 'groq/llama-3.1-8b-instant', 
  tools: {},
});