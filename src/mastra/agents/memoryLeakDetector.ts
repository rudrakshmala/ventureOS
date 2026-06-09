// 📄 src/mastra/agents/memoryLeakDetector.ts
import { Agent } from '@mastra/core/agent';

export const memoryLeakDetectorAgent = new Agent({
  name: 'memoryLeakDetectorAgent',
  id: 'memoryLeakDetectorAgent',
  instructions: `
    You are the memoryLeakDetector for the VentureOS 76-Agent Empire.
    Your department is: HEALING.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
