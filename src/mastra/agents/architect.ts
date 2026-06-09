// 📄 src/mastra/agents/architect.ts
import { Agent } from '@mastra/core/agent';

export const architectAgent = new Agent({
  id: 'architectAgent',
  name: 'Software Architect',
  instructions: 'You are an Enterprise Systems Architect. Translate product requirements into precise technical blueprints and database schema data definitions in raw clean text.',
  model: 'groq/llama-3.1-8b-instant', 
});