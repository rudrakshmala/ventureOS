// 📄 src/mastra/tools/compiler.ts

// CHANGED: Added '/tools' to the import path
import { createTool } from '@mastra/core/tools'; 
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export const writeModuleFile = createTool({
  id: 'writeModuleFile',
  description: 'Safely writes compiled code blocks directly to the specified venture workspace.',
  inputSchema: z.object({
    ventureId: z.string().describe('Unique slug for the user business application'),
    filePath: z.string().describe('Relative file path, e.g., src/components/Navbar.tsx'),
    content: z.string().describe('The complete source code string to execute'),
  }),
  execute: async ({ input }) => {
    if (!input) {
      return {
        success: false,
        error: "Execution failed: No input parameters were provided to the tool.",
      };
    }

    const { ventureId, filePath, content } = input;

    try {
      const baseDir = path.resolve(process.cwd(), 'workspaces', ventureId);
      const targetPath = path.join(baseDir, filePath);

      // Ensure directory path components exist
      await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

      // Write compiled block explicitly
      await fs.promises.writeFile(targetPath, content, 'utf8');

      return {
        success: true,
        message: `Successfully wrote module file to ${filePath} inside workspace ${ventureId}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Disk write operation failed: ${error.message}`,
      };
    }
  },
});