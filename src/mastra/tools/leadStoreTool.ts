// 📄 src/mastra/tools/leadStoreTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '../../db.js';

export const leadStoreTool = createTool({
  id: 'leadStoreTool',
  description: 'Read and write Lead records to the database',
  inputSchema: z.object({
    action: z.enum(['CREATE', 'UPDATE', 'GET', 'LIST', 'MARK_PITCHED']).describe('DB operation'),
    leadId: z.string().optional(),
    data: z.object({
      source: z.string().optional(),
      sourceUrl: z.string().optional(),
      authorUsername: z.string().optional(),
      contactEmail: z.string().optional(),
      postTitle: z.string().optional(),
      postContent: z.string().optional(),
      painPoint: z.string().optional(),
      budgetSignal: z.string().optional(),
      niche: z.string().optional(),
      score: z.number().optional(),
      status: z.string().optional(),
    }).optional(),
    filters: z.object({
      status: z.string().optional(),
      minScore: z.number().optional(),
      source: z.string().optional(),
      limit: z.number().optional(),
    }).optional(),
  }),
  execute: async ({ input }) => {
    const { action, leadId, data, filters } = input;
    try {
      if (action === 'CREATE' && data) {
        const lead = await prisma.lead.create({
          data: {
            source: data.source || 'unknown',
            sourceUrl: data.sourceUrl,
            authorUsername: data.authorUsername || 'unknown',
            contactEmail: data.contactEmail,
            postTitle: data.postTitle || '',
            postContent: data.postContent || '',
            painPoint: data.painPoint,
            budgetSignal: data.budgetSignal || 'unknown',
            niche: data.niche,
            score: data.score || 0,
            status: data.status || 'NEW',
          }
        });
        return { success: true, lead };
      }

      if (action === 'UPDATE' && leadId && data) {
        const lead = await prisma.lead.update({
          where: { id: leadId },
          data: { ...data, updatedAt: new Date() }
        });
        return { success: true, lead };
      }

      if (action === 'GET' && leadId) {
        const lead = await prisma.lead.findUnique({
          where: { id: leadId },
          include: { outreachCampaigns: true, deal: true }
        });
        return { success: true, lead };
      }

      if (action === 'LIST') {
        const where: any = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.source) where.source = filters.source;
        if (filters?.minScore) where.score = { gte: filters.minScore };
        const leads = await prisma.lead.findMany({
          where,
          orderBy: { score: 'desc' },
          take: filters?.limit || 50,
          include: { outreachCampaigns: { take: 1 } }
        });
        return { success: true, leads, count: leads.length };
      }

      if (action === 'MARK_PITCHED' && leadId) {
        const lead = await prisma.lead.update({
          where: { id: leadId },
          data: { status: 'PITCHED', updatedAt: new Date() }
        });
        return { success: true, lead };
      }

      return { success: false, error: 'Invalid action or missing parameters' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});
