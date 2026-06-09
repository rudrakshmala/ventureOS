// 📄 src/mastra/agents/qa.ts
import { Agent } from '@mastra/core/agent';

export const qaAgent = new Agent({
  id: 'qaAgent',
  name: 'QA Engineer',
  instructions: 'You are an Automated Testing Engineer. Consume software files and write complete execution testing validation scripts using modern assertion patterns.',
  model: 'groq/llama-3.1-8b-instant',
});