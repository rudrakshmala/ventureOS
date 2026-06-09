// 📄 src/mastra/agents/security.ts
import { Agent } from '@mastra/core/agent';

export const securityAgent = new Agent({
  id: 'securityAgent',
  name: 'Security Compliance Auditor',
  instructions: 'You are an Elite Security Audit Specialist. Check implementation code files for open vulnerability holes, secret credential leaks, or dependency bugs.',
  model: 'groq/llama-3.1-8b-instant',
});