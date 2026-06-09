// 📄 test-run.ts
import * as dotenv from 'dotenv';
// Load environment variables immediately before anything else imports!
dotenv.config();

import { runMNCCorporateGrid } from './src/mastra/services/mncOrchestrator.js';
import { mastra } from './src/mastra/index.js';

// Bind mastra to the global runtime scope so our cascading 
// round-robin algorithm can pull agent profiles dynamically.
(global as any).mastra = mastra;

async function runMNCEnterprisePipeline() {
  console.log("🏢 [VentureOS SaaS Core] Initializing Enterprise Agent Engine...\n");

  const enterpriseDirective = `
    Build a multi-tenant subscription tracking engine. 
    It needs a secure Stripe checkout payment web hook endpoint, 
    automatic metadata subscription database updates, and localized data isolation patterns.
  `;

  try {
    // Fire the multi-agent corporate grid (CEO -> VPs -> 4-Agent Engineering Line)
    const reportingMetrics = await runMNCCorporateGrid({
      tenantId: 'saas_premium_user_88',
      projectName: 'Billing Microservice',
      corporateDirective: enterpriseDirective
    });

    console.log("\n📈 --- ENTERPRISE OPERATION COMPLETE (AUDIT LOG GENERATED) ---");
    console.log(JSON.stringify(reportingMetrics, null, 2));

  } catch (error: any) {
    console.error("\n🔴 MNC Enterprise Pipeline Execution Crash:", error?.message || error);
  }
}

runMNCEnterprisePipeline();