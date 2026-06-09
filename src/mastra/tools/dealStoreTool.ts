// 📄 src/mastra/tools/dealStoreTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '../../db.js';

export const dealStoreTool = createTool({
  id: 'dealStoreTool',
  description: 'Read and write Deal, Invoice, and OutreachCampaign records',
  inputSchema: z.object({
    action: z.enum([
      'CREATE_DEAL', 'UPDATE_DEAL', 'GET_DEAL', 'LIST_DEALS',
      'CREATE_INVOICE', 'UPDATE_INVOICE', 'LIST_INVOICES',
      'CREATE_OUTREACH', 'UPDATE_OUTREACH', 'LIST_OUTREACH',
      'REVENUE_SUMMARY'
    ]),
    dealId: z.string().optional(),
    leadId: z.string().optional(),
    invoiceId: z.string().optional(),
    outreachId: z.string().optional(),
    data: z.any().optional(),
  }),
  execute: async ({ input }) => {
    const { action, dealId, leadId, invoiceId, outreachId, data } = input;
    try {

      // ── DEALS ──────────────────────────────────────────────────────────────
      if (action === 'CREATE_DEAL' && leadId) {
        const deal = await prisma.deal.create({
          data: {
            leadId,
            title: data?.title || 'New Deal',
            value: data?.value || 0,
            currency: data?.currency || 'USD',
            status: data?.status || 'NEGOTIATING',
            proposalText: data?.proposalText,
          }
        });
        await prisma.lead.update({ where: { id: leadId }, data: { status: 'REPLIED' } });
        return { success: true, deal };
      }

      if (action === 'UPDATE_DEAL' && dealId) {
        const deal = await prisma.deal.update({
          where: { id: dealId },
          data: { ...data, updatedAt: new Date() }
        });
        return { success: true, deal };
      }

      if (action === 'GET_DEAL' && dealId) {
        const deal = await prisma.deal.findUnique({
          where: { id: dealId },
          include: { lead: true, invoices: true, project: true }
        });
        return { success: true, deal };
      }

      if (action === 'LIST_DEALS') {
        const deals = await prisma.deal.findMany({
          where: data?.status ? { status: data.status } : undefined,
          orderBy: { createdAt: 'desc' },
          take: data?.limit || 50,
          include: { lead: { select: { authorUsername: true, niche: true } }, invoices: true }
        });
        return { success: true, deals, count: deals.length };
      }

      // ── INVOICES ───────────────────────────────────────────────────────────
      if (action === 'CREATE_INVOICE' && dealId) {
        const invoice = await prisma.invoice.create({
          data: {
            dealId,
            amount: data?.amount || 0,
            currency: data?.currency || 'USD',
            status: 'UNPAID',
            invoiceText: data?.invoiceText || '',
            dueDate: data?.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 86400000),
          }
        });
        return { success: true, invoice };
      }

      if (action === 'UPDATE_INVOICE' && invoiceId) {
        const invoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data
        });
        return { success: true, invoice };
      }

      if (action === 'LIST_INVOICES') {
        const invoices = await prisma.invoice.findMany({
          where: dealId ? { dealId } : undefined,
          orderBy: { createdAt: 'desc' },
          include: { deal: { select: { title: true, lead: { select: { authorUsername: true } } } } }
        });
        return { success: true, invoices };
      }

      // ── OUTREACH ───────────────────────────────────────────────────────────
      if (action === 'CREATE_OUTREACH' && leadId) {
        const campaign = await prisma.outreachCampaign.create({
          data: {
            leadId,
            sequence: data?.sequence || 1,
            subject: data?.subject || '',
            body: data?.body || '',
            status: data?.status || 'DRAFT',
          }
        });
        return { success: true, campaign };
      }

      if (action === 'UPDATE_OUTREACH' && outreachId) {
        const campaign = await prisma.outreachCampaign.update({
          where: { id: outreachId },
          data
        });
        return { success: true, campaign };
      }

      if (action === 'LIST_OUTREACH') {
        const campaigns = await prisma.outreachCampaign.findMany({
          where: leadId ? { leadId } : undefined,
          orderBy: { createdAt: 'desc' },
          include: { lead: { select: { authorUsername: true, painPoint: true } } }
        });
        return { success: true, campaigns };
      }

      // ── REVENUE SUMMARY ────────────────────────────────────────────────────
      if (action === 'REVENUE_SUMMARY') {
        const invoices = await prisma.invoice.findMany();
        const deals = await prisma.deal.findMany({ include: { lead: true } });
        const totalBilled = invoices.reduce((s: number, i: any) => s + i.amount, 0);
        const totalPaid = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.amount, 0);
        const outstanding = invoices.filter((i: any) => i.status === 'SENT').reduce((s: number, i: any) => s + i.amount, 0);
        const overdue = invoices.filter((i: any) => i.status === 'OVERDUE').reduce((s: number, i: any) => s + i.amount, 0);
        const pipelineValue = deals.filter((d: any) => d.status === 'NEGOTIATING').reduce((s: number, d: any) => s + d.value, 0);
        return {
          success: true,
          summary: { totalBilled, totalPaid, outstanding, overdue, pipelineValue,
            dealCount: deals.length, wonDeals: deals.filter((d: any) => d.status === 'WON').length }
        };
      }

      return { success: false, error: 'Invalid action or missing parameters' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});
