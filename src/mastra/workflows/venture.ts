// 📄 src/mastra/workflows/venture.ts
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { resilientGenerate } from '../services/aiEngine.js'; // Import our new resilient handler

const generationStep = createStep({
  id: 'generation-step',
  inputSchema: z.object({
    ventureId: z.string(),
    prompt: z.string(),
  }),
  outputSchema: z.object({
    status: z.string(),
  }),
  execute: async ({ inputData, mastra }: any) => {
    const { ventureId = 'workspace', prompt = '' } = inputData || {};

    console.log(`\n🤖 [AI Active] Launching production workflow step via Resilient Engine Pool...`);

    const generationPrompt = `
      Task: Write a standard, valid JavaScript backend file using Express.
      Context: Building a 10-minute grocery delivery app for premium organic pet food.
      Requirements: "${prompt}"

      CRITICAL OUTPUT RULE: Return ONLY the standard JavaScript code lines. 
      Do not output any tags, XML elements, markdown fences, backticks (\`\`\`), or conversational explanations. Start directly with the code.
    `;

    try {
      // CALL THE CENTRALIZED RESILIENT WRAPPER SERVICE
      const generatedCode = await resilientGenerate(mastra, 'coderAgent', generationPrompt);

      console.log(`💾 [Writing Data] Committing code matrix to disk...`);

      const targetDir = path.resolve(process.cwd(), 'workspaces', ventureId, 'src', 'api');
      const targetFile = path.join(targetDir, 'users.js');

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetFile, generatedCode, 'utf8');
      
      console.log(`✅ [SUCCESS] Production asset successfully committed to: ${targetFile}`);

    } catch (engineError: any) {
      console.error(`❌ Critical Workflow Engine Failure:`, engineError.message);
      throw engineError; // Bubble up execution errors safely to the workflow state tracker
    }

    return {
      status: 'Core modules compiled successfully.',
    };
  },
});

export const ventureWorkflow = createWorkflow({
  id: 'ventureWorkflow',
  inputSchema: z.object({
    ventureId: z.string(),
    prompt: z.string(),
  }),
  outputSchema: z.object({
    status: z.string(),
  }),
})
  .then(generationStep)
  .commit();