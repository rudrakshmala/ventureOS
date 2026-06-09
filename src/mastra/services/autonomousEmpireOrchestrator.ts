// 📄 src/mastra/services/autonomousEmpireOrchestrator.ts
// 👑 THE MASTER AUTONOMOUS BUSINESS LOOP
// Runs all 4 corporate divisions simultaneously to find clients, pitch, deliver, and collect revenue

import { resilientGenerate } from './aiEngine.js';
import { scrapeAllPlatforms, type RawPost } from './leadScraper.js';
import { sendEmail, DEMO_MODE } from './emailService.js';
import { prisma } from '../../db.js';

export type EmpireEventCallback = (msg: string) => void;

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function safeParseJson(raw: string, fallback: any): any {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

function log(msg: string, onEvent?: EmpireEventCallback) {
  console.log(msg);
  if (onEvent) onEvent(msg);
}

// ─── DIVISION 1: INTELLIGENCE SWEEP ──────────────────────────────────────────
async function runIntelligenceDivision(
  runId: string,
  onEvent?: EmpireEventCallback
): Promise<{ newLeads: number; topLeadIds: string[] }> {

  log('\n🔵 [DIV-1: INTELLIGENCE] Market Scout activating — scanning Reddit & HN...', onEvent);

  // Step 1: Scrape all platforms
  const { posts, totalFound } = await scrapeAllPlatforms();
  log(` ├─ 🌐 Raw posts found across platforms: ${totalFound}`, onEvent);

  if (posts.length === 0) {
    log(' └─ ⚠️ No posts found this sweep. Will retry next cycle.', onEvent);
    return { newLeads: 0, topLeadIds: [] };
  }

  // Step 2: Check for duplicate leads (by sourceUrl)
  const existingUrls = await prisma.lead.findMany({ select: { sourceUrl: true } });
  const existingUrlSet = new Set(existingUrls.map(l => l.sourceUrl).filter(Boolean));
  const newPosts = posts.filter(p => !existingUrlSet.has(p.url));
  log(` ├─ 🆕 New (unseen) posts: ${newPosts.length} | Skipped duplicates: ${posts.length - newPosts.length}`, onEvent);

  if (newPosts.length === 0) {
    return { newLeads: 0, topLeadIds: [] };
  }

  // Step 3: Have Lead Profiler enrich posts (batch them 5 at a time)
  const savedLeadIds: string[] = [];
  const batchSize = 5;

  for (let i = 0; i < Math.min(newPosts.length, 20); i += batchSize) {
    const batch = newPosts.slice(i, i + batchSize);
    log(` ├─ 🧠 [Lead Profiler] Enriching batch ${Math.floor(i/batchSize)+1}...`, onEvent);

    const profilePromises = batch.map(async (post) => {
      try {
        const profileRaw = await resilientGenerate(
          (global as any).mastra,
          'leadProfilerAgent',
          `Analyze this post and produce a lead enrichment profile:\n\nTitle: ${post.title}\nContent: ${post.content}\nPlatform: ${post.platform}\nAuthor: ${post.author}`,
          { onEvent }
        );
        const profile = safeParseJson(profileRaw, {
          estimatedDealValue: 500,
          budgetSignal: 'unknown',
          niche: 'web',
          painPoint: post.title,
          recommendedApproach: 'standard'
        });

        const lead = await prisma.lead.create({
          data: {
            source: post.platform,
            sourceUrl: post.url,
            authorUsername: post.author,
            postTitle: post.title,
            postContent: post.content.slice(0, 2000),
            painPoint: profile.painPoint || post.title,
            budgetSignal: profile.estimatedDealValue ? String(profile.estimatedDealValue) : 'unknown',
            niche: profile.niche || 'web',
            score: 0,
            status: 'NEW',
          }
        });
        return lead.id;
      } catch (err: any) {
        log(` │   ⚠️ Failed to profile post: ${err.message}`, onEvent);
        return null;
      }
    });

    const ids = await Promise.all(profilePromises);
    savedLeadIds.push(...ids.filter((id): id is string => id !== null));
  }

  log(` ├─ 💾 Saved ${savedLeadIds.length} new leads to database`, onEvent);

  // Step 4: Opportunity Ranker scores ALL new leads
  log(' ├─ 📊 [Opportunity Ranker] Scoring and prioritizing new leads...', onEvent);
  const newLeads = await prisma.lead.findMany({
    where: { id: { in: savedLeadIds } }
  });

  const rankRaw = await resilientGenerate(
    (global as any).mastra,
    'opportunityRankerAgent',
    `Score and rank these ${newLeads.length} leads by close probability:\n${JSON.stringify(newLeads.map(l => ({
      id: l.id, title: l.postTitle, painPoint: l.painPoint,
      budgetSignal: l.budgetSignal, niche: l.niche
    })), null, 2)}`,
    { onEvent }
  );

  const rankings = safeParseJson(rankRaw, []);
  const topLeadIds: string[] = [];

  // Update scores in DB
  for (const rank of rankings) {
    if (!rank.leadId) continue;
    await prisma.lead.update({
      where: { id: rank.leadId },
      data: { score: rank.score || 0 }
    }).catch(() => {});
    if (rank.recommendation === 'PITCH_NOW') topLeadIds.push(rank.leadId);
  }

  log(` └─ 🎯 Top leads to pitch NOW: ${topLeadIds.length}`, onEvent);
  return { newLeads: savedLeadIds.length, topLeadIds };
}

// ─── DIVISION 2: SALES & OUTREACH ────────────────────────────────────────────
async function runSalesDivision(
  topLeadIds: string[],
  onEvent?: EmpireEventCallback
): Promise<{ pitchesSent: number }> {

  log('\n🟢 [DIV-2: SALES] Pitch Crafter & Email Corps activating...', onEvent);
  if (topLeadIds.length === 0) {
    log(' └─ ℹ️ No top leads to pitch this cycle.', onEvent);
    return { pitchesSent: 0 };
  }

  let pitchesSent = 0;

  // Process top leads in parallel
  const pitchTasks = topLeadIds.slice(0, 5).map(async (leadId) => {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead || lead.status !== 'NEW') return;

      log(` ├─ ✍️ [Pitch Crafter] Crafting pitch for @${lead.authorUsername}...`, onEvent);

      const pitchRaw = await resilientGenerate(
        (global as any).mastra,
        'pitchCrafterAgent',
        `Write a cold pitch for this lead:\n\nUsername: ${lead.authorUsername}\nPost: ${lead.postTitle}\nPain Point: ${lead.painPoint}\nBudget Signal: ${lead.budgetSignal}\nNiche: ${lead.niche}\nPlatform: ${lead.source}`,
        { onEvent }
      );

      const pitch = safeParseJson(pitchRaw, {
        subject: 'Quick question about your project',
        body: pitchRaw,
        platform: 'email'
      });

      // Save outreach campaign to DB
      const campaign = await prisma.outreachCampaign.create({
        data: {
          leadId,
          sequence: 1,
          subject: pitch.subject || 'Quick question about your project',
          body: pitch.body || pitchRaw,
          status: 'DRAFT',
        }
      });

      // Send/log the email (demo mode: log to disk)
      const emailResult = await sendEmail({
        to: lead.contactEmail || `${lead.authorUsername}@reddit-lead.ventureos.internal`,
        subject: pitch.subject,
        textBody: pitch.body || pitchRaw,
        leadId: lead.id,
        campaignId: campaign.id,
      });

      // Update campaign and lead status
      await prisma.outreachCampaign.update({
        where: { id: campaign.id },
        data: {
          status: emailResult.success ? 'SENT' : 'DRAFT',
          sentAt: emailResult.success ? new Date() : null
        }
      });

      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'PITCHED', updatedAt: new Date() }
      });

      const modeTag = DEMO_MODE ? '📁 [DEMO LOG]' : '📧 [SENT]';
      log(` │   ${modeTag} Pitch for @${lead.authorUsername}: "${pitch.subject}"`, onEvent);
      pitchesSent++;

    } catch (err: any) {
      log(` │   ⚠️ Pitch failed for lead ${leadId}: ${err.message}`, onEvent);
    }
  });

  await Promise.all(pitchTasks);

  // Also check for follow-ups needed
  const pitchedLeads = await prisma.lead.findMany({
    where: { status: 'PITCHED' },
    include: { outreachCampaigns: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  const followUpNeeded = pitchedLeads.filter(l => {
    const lastCampaign = l.outreachCampaigns[0];
    if (!lastCampaign?.sentAt) return false;
    const daysSince = (Date.now() - lastCampaign.sentAt.getTime()) / 86400000;
    return daysSince >= 2 && lastCampaign.sequence < 4;
  });

  if (followUpNeeded.length > 0) {
    log(` ├─ 📬 [Follow-Up Agent] ${followUpNeeded.length} leads need follow-up sequences...`, onEvent);
    for (const lead of followUpNeeded.slice(0, 3)) {
      try {
        const lastSeq = lead.outreachCampaigns[0].sequence;
        const nextSeq = lastSeq + 1;

        const followUpRaw = await resilientGenerate(
          (global as any).mastra,
          'followUpAgent',
          `Write follow-up sequence #${nextSeq} for this lead:\nUsername: ${lead.authorUsername}\nOriginal pain point: ${lead.painPoint}\nLast contacted: ${lead.outreachCampaigns[0].sentAt?.toISOString()}`,
          { onEvent }
        );
        const followUp = safeParseJson(followUpRaw, { subject: 'Following up', body: followUpRaw, sequence: nextSeq });

        await prisma.outreachCampaign.create({
          data: {
            leadId: lead.id,
            sequence: nextSeq,
            subject: followUp.subject,
            body: followUp.body,
            status: 'SENT',
            sentAt: new Date()
          }
        });

        await sendEmail({
          to: lead.contactEmail || `${lead.authorUsername}@follow-up.ventureos.internal`,
          subject: followUp.subject,
          textBody: followUp.body,
          leadId: lead.id,
        });

        log(` │   📨 Follow-up #${nextSeq} sent to @${lead.authorUsername}`, onEvent);
        pitchesSent++;
      } catch {}
    }
  }

  log(` └─ ✅ Sales division complete. Total pitches sent: ${pitchesSent}`, onEvent);
  return { pitchesSent };
}

// ─── DIVISION 3: DELIVERY MANAGEMENT ─────────────────────────────────────────
async function runDeliveryDivision(onEvent?: EmpireEventCallback): Promise<void> {
  log('\n🟡 [DIV-3: DELIVERY] Checking active project deliveries...', onEvent);

  const activeDeals = await prisma.deal.findMany({
    where: { status: 'WON' },
    include: { lead: true, project: true }
  });

  if (activeDeals.length === 0) {
    log(' └─ ℹ️ No active won deals requiring delivery oversight.', onEvent);
    return;
  }

  log(` ├─ 📋 Found ${activeDeals.length} won deals to manage...`, onEvent);

  for (const deal of activeDeals) {
    if (!deal.project) {
      log(` │   🔄 [Project Planner] Planning delivery for: ${deal.title}`, onEvent);
      try {
        const planRaw = await resilientGenerate(
          (global as any).mastra,
          'projectPlannerAgent',
          `Create a sprint plan for: ${deal.title}\nClient requirement: ${deal.lead.postContent}\nBudget: $${deal.value}`,
          { onEvent }
        );
        const plan = safeParseJson(planRaw, { engineeringDirective: deal.lead.postContent });

        // Create the workspace project
        const tenantId = `empire_deal_${deal.id.slice(0, 8)}`;
        await prisma.tenant.upsert({ where: { id: tenantId }, update: {}, create: { id: tenantId } });
        await prisma.project.create({
          data: {
            tenantId,
            projectName: deal.title,
            workspacePath: `workspaces/deal_${deal.id.slice(0, 8)}`,
            corporateDirective: plan.engineeringDirective || deal.lead.postContent,
            status: 'PENDING',
            dealId: deal.id,
          }
        });

        log(` │   ✅ Project created for deal: ${deal.title}`, onEvent);
      } catch (err: any) {
        log(` │   ⚠️ Planning failed: ${err.message}`, onEvent);
      }
    } else {
      // Send client update
      log(` │   📧 [Client Update] Sending progress update for: ${deal.title}`, onEvent);
      try {
        const updateRaw = await resilientGenerate(
          (global as any).mastra,
          'clientUpdateAgent',
          `Write a MILESTONE update email for client ${deal.lead.authorUsername} on project: ${deal.title}. Status: ${deal.project.status}. Healing attempts: ${deal.project.healingAttempts}.`,
          { onEvent }
        );
        const update = safeParseJson(updateRaw, { subject: 'Project Update', body: updateRaw });
        await sendEmail({
          to: deal.lead.contactEmail || `${deal.lead.authorUsername}@client.ventureos.internal`,
          subject: update.subject,
          textBody: update.body,
        });
      } catch {}
    }
  }
}

// ─── DIVISION 4: REVENUE & GROWTH ────────────────────────────────────────────
async function runRevenueDivision(
  cycleStats: { leadsFound: number; pitchesSent: number },
  onEvent?: EmpireEventCallback
): Promise<{ revenue: number }> {

  log('\n🔴 [DIV-4: REVENUE & GROWTH] Financial sync and growth analysis...', onEvent);

  // Revenue summary
  const invoices = await prisma.invoice.findMany();
  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'SENT').reduce((s, i) => s + i.amount, 0);

  log(` ├─ 💰 Total Collected: $${totalCollected.toFixed(2)} | Outstanding: $${outstanding.toFixed(2)}`, onEvent);

  // Generate invoices for delivered-but-not-invoiced deals
  const deliveredDeals = await prisma.deal.findMany({
    where: { status: 'DELIVERED' },
    include: { invoices: true, lead: true }
  });

  for (const deal of deliveredDeals.filter(d => d.invoices.length === 0)) {
    log(` ├─ 🧾 [Invoice Agent] Generating invoice for: ${deal.title}`, onEvent);
    try {
      const invoiceRaw = await resilientGenerate(
        (global as any).mastra,
        'invoiceAgent',
        `Generate a professional invoice for:\nClient: ${deal.lead.authorUsername}\nProject: ${deal.title}\nAmount: $${deal.value}\nCurrency: ${deal.currency}`,
        { onEvent }
      );
      const invoiceData = safeParseJson(invoiceRaw, { invoiceText: invoiceRaw });

      const invoice = await prisma.invoice.create({
        data: {
          dealId: deal.id,
          amount: deal.value,
          currency: deal.currency,
          status: 'UNPAID',
          invoiceText: invoiceData.invoiceText || invoiceRaw,
          dueDate: new Date(Date.now() + 7 * 86400000),
        }
      });

      await sendEmail({
        to: deal.lead.contactEmail || `${deal.lead.authorUsername}@billing.ventureos.internal`,
        subject: `Invoice for ${deal.title} — $${deal.value}`,
        textBody: invoiceData.invoiceText || `Please find attached invoice for ${deal.title}. Amount due: $${deal.value}`,
        leadId: deal.leadId,
      });

      log(` │   📄 Invoice generated: $${deal.value} for ${deal.lead.authorUsername}`, onEvent);
    } catch (err: any) {
      log(` │   ⚠️ Invoice failed: ${err.message}`, onEvent);
    }
  }

  // Growth hacker analysis (run if we have enough data)
  const leadsCount = await prisma.lead.count();
  if (leadsCount >= 5) {
    log(' ├─ 📈 [Growth Hacker] Analyzing performance patterns...', onEvent);
    try {
      const deals = await prisma.deal.findMany({ include: { lead: true } });
      const growthRaw = await resilientGenerate(
        (global as any).mastra,
        'growthHackerAgent',
        `Analyze this business performance data and provide growth directives:\nTotal Leads: ${leadsCount}\nDeals Won: ${deals.filter(d => d.status === 'WON').length}\nRevenue: $${totalCollected}\nThis cycle: ${cycleStats.leadsFound} leads found, ${cycleStats.pitchesSent} pitches sent`,
        { onEvent }
      );
      const growth = safeParseJson(growthRaw, {});
      if (growth.insights) {
        log(` │   💡 Growth Insight: ${growth.insights}`, onEvent);
      }
    } catch {}
  }

  log(` └─ ✅ Revenue division complete.`, onEvent);
  return { revenue: totalCollected };
}

// ─── MASTER EMPIRE CYCLE ──────────────────────────────────────────────────────
export async function runAutonomousEmpireCycle(
  options: { onEvent?: EmpireEventCallback } = {}
): Promise<{
  status: string;
  leadsFound: number;
  pitchesSent: number;
  dealsWon: number;
  revenue: number;
  duration: number;
}> {
  const { onEvent } = options;
  const startTime = Date.now();

  log('\n👑 ══════════════════════════════════════════════════════', onEvent);
  log('   VENTUREOS AUTONOMOUS EMPIRE CYCLE INITIATED', onEvent);
  log('   76-AGENT CORPORATE GRID — ALL DIVISIONS ACTIVE', onEvent);
  log('══════════════════════════════════════════════════════════\n', onEvent);

  // Create run log entry
  const runLog = await prisma.agentRunLog.create({
    data: { runType: 'EMPIRE_CYCLE', status: 'RUNNING' }
  });

  let leadsFound = 0;
  let pitchesSent = 0;
  let dealsWon = 0;
  let revenue = 0;

  try {
    // ─── All 4 divisions run sequentially (Division 1 feeds Division 2)
    const { newLeads, topLeadIds } = await runIntelligenceDivision(runLog.id, onEvent);
    leadsFound = newLeads;

    // Divisions 2, 3, 4 run in parallel after intelligence sweep
    const [salesResult, , revenueResult] = await Promise.all([
      runSalesDivision(topLeadIds, onEvent),
      runDeliveryDivision(onEvent),
      runRevenueDivision({ leadsFound, pitchesSent }, onEvent)
    ]);

    pitchesSent = salesResult.pitchesSent;
    revenue = revenueResult.revenue;
    dealsWon = await prisma.deal.count({ where: { status: 'WON' } });

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Update run log
    await prisma.agentRunLog.update({
      where: { id: runLog.id },
      data: {
        status: 'SUCCESS',
        leadsFound,
        pitchesSent,
        dealsWon,
        revenue,
        logs: `Cycle completed in ${duration}s`,
        completedAt: new Date()
      }
    });

    log('\n👑 ══════════════════════════════════════════════════════', onEvent);
    log(`   EMPIRE CYCLE COMPLETE in ${duration}s`, onEvent);
    log(`   📊 Leads Found: ${leadsFound} | Pitches Sent: ${pitchesSent}`, onEvent);
    log(`   💰 Deals Won: ${dealsWon} | Revenue: $${revenue.toFixed(2)}`, onEvent);
    log('══════════════════════════════════════════════════════════\n', onEvent);

    return { status: 'SUCCESS', leadsFound, pitchesSent, dealsWon, revenue, duration };

  } catch (error: any) {
    await prisma.agentRunLog.update({
      where: { id: runLog.id },
      data: { status: 'FAILED', logs: error.message, completedAt: new Date() }
    });
    log(`\n❌ [Empire] Cycle failed: ${error.message}`, onEvent);
    throw error;
  }
}

/**
 * Quick scout-only run — just find and save leads without pitching
 */
export async function runScoutOnly(onEvent?: EmpireEventCallback) {
  log('🔵 [Empire] Running intelligence-only sweep...', onEvent);
  const result = await runIntelligenceDivision('scout_only', onEvent);
  return result;
}
