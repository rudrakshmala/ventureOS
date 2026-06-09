// 📄 src/mastra/agents/refactoringProposer.ts
import { Agent } from '@mastra/core/agent';

export const refactoringProposerAgent = new Agent({
  name: 'refactoringProposerAgent',
  id: 'refactoringProposerAgent',
  instructions: `
    You are the refactoringProposer for the VentureOS 76-Agent Empire.
    Your department is: HEALING.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
