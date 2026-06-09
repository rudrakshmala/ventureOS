// 📄 src/mastra/agents/stackTraceDecoder.ts
import { Agent } from '@mastra/core/agent';

export const stackTraceDecoderAgent = new Agent({
  name: 'stackTraceDecoderAgent',
  id: 'stackTraceDecoderAgent',
  instructions: `
    You are the stackTraceDecoder for the VentureOS 76-Agent Empire.
    Your department is: HEALING.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  `,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
