// 📄 src/mastra/agents/staticCodeAnalysisReviewer.ts
import { Agent } from '@mastra/core/agent';

export const staticCodeAnalysisReviewerAgent = new Agent({
  name: 'staticCodeAnalysisReviewerAgent',
  id: 'staticCodeAnalysisReviewerAgent',
  instructions: `
    You are the staticCodeAnalysisReviewer for the VentureOS 76-Agent Empire.
    Your department is: CYBER.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
