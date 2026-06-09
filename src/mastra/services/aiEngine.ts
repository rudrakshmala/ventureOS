// 📄 src/mastra/services/aiEngine.ts — VentureOS 76-Agent Registry
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 200;
import dotenv from 'dotenv';
dotenv.config();

import { marketScoutAgent } from '../agents/marketScout.js';
import { leadProfilerAgent } from '../agents/leadProfiler.js';
import { opportunityRankerAgent } from '../agents/opportunityRanker.js';
import { pitchCrafterAgent } from '../agents/pitchCrafter.js';
import { emailSenderAgent } from '../agents/emailSender.js';
import { followUpAgent } from '../agents/followUp.js';
import { closingAgent } from '../agents/closing.js';
import { projectPlannerAgent } from '../agents/projectPlanner.js';
import { deliveryOrchestratorAgent } from '../agents/deliveryOrchestrator.js';
import { clientUpdateAgent } from '../agents/clientUpdate.js';
import { invoiceAgent } from '../agents/invoice.js';
import { revenueTrackerAgent } from '../agents/revenueTracker.js';
import { retrospectiveAgent } from '../agents/retrospective.js';
import { growthHackerAgent } from '../agents/growthHacker.js';
import { ceoAgent } from '../agents/ceo.js';
import { cooAgent } from '../agents/coo.js';
import { caoAgent } from '../agents/cao.js';
import { brdAuthorAgent } from '../agents/brdAuthor.js';
import { userStoryArchitectAgent } from '../agents/userStoryArchitect.js';
import { edgeCaseMapperAgent } from '../agents/edgeCaseMapper.js';
import { uiUxFlowDesignerAgent } from '../agents/uiUxFlowDesigner.js';
import { productManagerAgent } from '../agents/productManager.js';
import { marketAnalystAgent } from '../agents/marketAnalyst.js';
import { customerPersonaAgent } from '../agents/customerPersona.js';
import { coderAgent } from '../agents/coder.js';
import { architectAgent } from '../agents/architect.js';
import { frontendEngineerAgent } from '../agents/frontendEngineer.js';
import { databaseDesignerAgent } from '../agents/databaseDesigner.js';
import { apiIntegratorAgent } from '../agents/apiIntegrator.js';
import { uiDesignerAgent } from '../agents/uiDesigner.js';
import { authEngineerAgent } from '../agents/authEngineer.js';
import { paymentEngineerAgent } from '../agents/paymentEngineer.js';
import { notificationEngineerAgent } from '../agents/notificationEngineer.js';
import { backendNodeSpecialistAgent } from '../agents/backendNodeSpecialist.js';
import { packageDependencyResolverAgent } from '../agents/packageDependencyResolver.js';
import { graphqlSpecialistAgent } from '../agents/graphqlSpecialist.js';
import { websocketEngineerAgent } from '../agents/websocketEngineer.js';
import { stateManagementEngineerAgent } from '../agents/stateManagementEngineer.js';
import { accessibilityEngineerAgent } from '../agents/accessibilityEngineer.js';
import { qaAgent } from '../agents/qa.js';
import { bugHunterAgent } from '../agents/bugHunter.js';
import { performanceOptimizerAgent } from '../agents/performanceOptimizer.js';
import { unitTestGeneratorAgent } from '../agents/unitTestGenerator.js';
import { integrationTestRunnerAgent } from '../agents/integrationTestRunner.js';
import { boundaryConditionEvaluatorAgent } from '../agents/boundaryConditionEvaluator.js';
import { mockDataProviderAgent } from '../agents/mockDataProvider.js';
import { chaosEngineeringTesterAgent } from '../agents/chaosEngineeringTester.js';
import { loadTesterAgent } from '../agents/loadTester.js';
import { accessibilityTesterAgent } from '../agents/accessibilityTester.js';
import { deploymentAgent } from '../agents/deploymentAgent.js';
import { devOpsEngineerAgent } from '../agents/devOpsEngineer.js';
import { dockerfileCreatorAgent } from '../agents/dockerfileCreator.js';
import { ciCdWorkflowAuthorAgent } from '../agents/ciCdWorkflowAuthor.js';
import { environmentVariablesAuditAgent } from '../agents/environmentVariablesAudit.js';
import { pathNormalizerAgent } from '../agents/pathNormalizer.js';
import { kubernetesOrchestratorAgent } from '../agents/kubernetesOrchestrator.js';
import { infrastructureAsCodeAgent } from '../agents/infrastructureAsCode.js';
import { securityAgent } from '../agents/security.js';
import { dependencyVulnerabilityScannerAgent } from '../agents/dependencyVulnerabilityScanner.js';
import { staticCodeAnalysisReviewerAgent } from '../agents/staticCodeAnalysisReviewer.js';
import { sqlInjectionBlockerAgent } from '../agents/sqlInjectionBlocker.js';
import { secretTokenLeakDetectorAgent } from '../agents/secretTokenLeakDetector.js';
import { dataPrivacyAuditorAgent } from '../agents/dataPrivacyAuditor.js';
import { penetrationTesterAgent } from '../agents/penetrationTester.js';
import { iamRoleAuditorAgent } from '../agents/iamRoleAuditor.js';
import { encryptionSpecialistAgent } from '../agents/encryptionSpecialist.js';
import { zeroTrustArchitectAgent } from '../agents/zeroTrustArchitect.js';
import { runtimeErrorLogParserAgent } from '../agents/runtimeErrorLogParser.js';
import { stackTraceDecoderAgent } from '../agents/stackTraceDecoder.js';
import { refactoringProposerAgent } from '../agents/refactoringProposer.js';
import { loopBreakMonitorAgent } from '../agents/loopBreakMonitor.js';
import { memoryLeakDetectorAgent } from '../agents/memoryLeakDetector.js';
import { deadlockResolverAgent } from '../agents/deadlockResolver.js';
import { dependencyConflictResolverAgent } from '../agents/dependencyConflictResolver.js';

// ─── UNIFIED 76-AGENT REGISTRY ────────────────────────────────────────────────
const LOCAL_AGENT_REGISTRY: Record<string, any> = {
  marketScoutAgent,
  leadProfilerAgent,
  opportunityRankerAgent,
  pitchCrafterAgent,
  emailSenderAgent,
  followUpAgent,
  closingAgent,
  projectPlannerAgent,
  deliveryOrchestratorAgent,
  clientUpdateAgent,
  invoiceAgent,
  revenueTrackerAgent,
  retrospectiveAgent,
  growthHackerAgent,
  ceoAgent,
  cooAgent,
  caoAgent,
  brdAuthorAgent,
  userStoryArchitectAgent,
  edgeCaseMapperAgent,
  uiUxFlowDesignerAgent,
  productManagerAgent,
  marketAnalystAgent,
  customerPersonaAgent,
  coderAgent,
  architectAgent,
  frontendEngineerAgent,
  databaseDesignerAgent,
  apiIntegratorAgent,
  uiDesignerAgent,
  authEngineerAgent,
  paymentEngineerAgent,
  notificationEngineerAgent,
  backendNodeSpecialistAgent,
  packageDependencyResolverAgent,
  graphqlSpecialistAgent,
  websocketEngineerAgent,
  stateManagementEngineerAgent,
  accessibilityEngineerAgent,
  qaAgent,
  bugHunterAgent,
  performanceOptimizerAgent,
  unitTestGeneratorAgent,
  integrationTestRunnerAgent,
  boundaryConditionEvaluatorAgent,
  mockDataProviderAgent,
  chaosEngineeringTesterAgent,
  loadTesterAgent,
  accessibilityTesterAgent,
  deploymentAgent,
  devOpsEngineerAgent,
  dockerfileCreatorAgent,
  ciCdWorkflowAuthorAgent,
  environmentVariablesAuditAgent,
  pathNormalizerAgent,
  kubernetesOrchestratorAgent,
  infrastructureAsCodeAgent,
  securityAgent,
  dependencyVulnerabilityScannerAgent,
  staticCodeAnalysisReviewerAgent,
  sqlInjectionBlockerAgent,
  secretTokenLeakDetectorAgent,
  dataPrivacyAuditorAgent,
  penetrationTesterAgent,
  iamRoleAuditorAgent,
  encryptionSpecialistAgent,
  zeroTrustArchitectAgent,
  runtimeErrorLogParserAgent,
  stackTraceDecoderAgent,
  refactoringProposerAgent,
  loopBreakMonitorAgent,
  memoryLeakDetectorAgent,
  deadlockResolverAgent,
  dependencyConflictResolverAgent,
};

console.log(`🤖 [AI Engine] Registry loaded: ${Object.keys(LOCAL_AGENT_REGISTRY).length} agents online`);

// ─── MODEL POOL (resilient rotation across Groq models) ────────────────────
const MODEL_POOL = [
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-8b-instant',
  'groq/llama-3.1-8b-instant',
  'groq/llama-3.1-8b-instant',
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-8b-instant',
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-8b-instant',
  'groq/llama-3.3-70b-versatile',
];

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function resilientGenerate(
  mastraInstance: any,
  agentId: string,
  prompt: string,
  options: { onEvent?: (msg: string) => void; [key: string]: any } = {}
) {
  let lastError: any = null;
  const agent = LOCAL_AGENT_REGISTRY[agentId];

  if (!agent) {
    throw new Error(`Agent '${agentId}' not found in AI Engine Registry. Available: ${Object.keys(LOCAL_AGENT_REGISTRY).join(', ')}`);
  }

  for (let i = 0; i < MODEL_POOL.length; i++) {
    const targetModel = MODEL_POOL[i];
    let attempts = 0;
    const maxRetries = 2;

    while (attempts < maxRetries) {
      try {
        const targetLog = `🤖 [Model Pool ${i+1}/${MODEL_POOL.length}] ${targetModel} → [${agentId}] (attempt ${attempts+1})`;
        console.log(targetLog);
        if (options.onEvent) options.onEvent(targetLog);

        const originalTools = agent.tools || [];
        agent.tools = [];

        let response;
        try {
          response = await agent.generate(prompt, { ...options, model: targetModel });
        } finally {
          agent.tools = originalTools;
        }

        const text = response?.text || response?.content || (typeof response === 'string' ? response : '');
        if (text && text.trim()) return text;
        throw new Error('Empty response from LLM provider');

      } catch (error: any) {
        lastError = error;
        const msg = error?.message || String(error);

        if (msg.includes('try again in') || msg.includes('Rate limit')) {
          attempts++;
          if (attempts < maxRetries) {
            const warn = `⏳ [Rate Limit] Backing off 5s on ${targetModel}...`;
            console.warn(warn);
            if (options.onEvent) options.onEvent(warn);
            await sleep(5000);
            continue;
          }
        }

        const skip = `⚠️ Slot ${i+1} [${targetModel}] skipped: ${msg}`;
        console.warn(skip);
        if (options.onEvent) options.onEvent(skip);
        break;
      }
    }
  }

  throw new Error(`🔴 ALL ${MODEL_POOL.length} models exhausted for [${agentId}]: ${lastError?.message || lastError}`);
}

// Export registry for external use
export { LOCAL_AGENT_REGISTRY };