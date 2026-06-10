// 📄 src/memory/context-bridge.ts — Runtime MemoryBus injection for all agents
// Wraps the Mastra container initialization to inject MemoryBus context
// into every agent WITHOUT editing individual agent files.
import { memoryBus, type MemoryScope } from './bus.js';

// Department → Scope mapping for all 76 agents
const AGENT_SCOPE_MAP: Record<string, MemoryScope> = {
  // Sales (14)
  marketScoutAgent: 'sales', leadProfilerAgent: 'sales', opportunityRankerAgent: 'sales',
  pitchCrafterAgent: 'sales', emailSenderAgent: 'sales', followUpAgent: 'sales',
  closingAgent: 'sales', projectPlannerAgent: 'sales', deliveryOrchestratorAgent: 'sales',
  clientUpdateAgent: 'sales', invoiceAgent: 'sales', revenueTrackerAgent: 'sales',
  retrospectiveAgent: 'sales', growthHackerAgent: 'sales',
  // Executive (3)
  ceoAgent: 'executive', cooAgent: 'executive', caoAgent: 'executive',
  // Product Guild (7)
  brdAuthorAgent: 'engineering', userStoryArchitectAgent: 'engineering',
  edgeCaseMapperAgent: 'engineering', uiUxFlowDesignerAgent: 'engineering',
  productManagerAgent: 'engineering', marketAnalystAgent: 'engineering',
  customerPersonaAgent: 'engineering',
  // Software Engineering (15)
  coderAgent: 'engineering', architectAgent: 'engineering',
  frontendEngineerAgent: 'engineering', databaseDesignerAgent: 'engineering',
  apiIntegratorAgent: 'engineering', uiDesignerAgent: 'engineering',
  authEngineerAgent: 'engineering', paymentEngineerAgent: 'engineering',
  notificationEngineerAgent: 'engineering', backendNodeSpecialistAgent: 'engineering',
  packageDependencyResolverAgent: 'engineering', graphqlSpecialistAgent: 'engineering',
  websocketEngineerAgent: 'engineering', stateManagementEngineerAgent: 'engineering',
  accessibilityEngineerAgent: 'engineering',
  // QA (10)
  qaAgent: 'qa', bugHunterAgent: 'qa', performanceOptimizerAgent: 'qa',
  unitTestGeneratorAgent: 'qa', integrationTestRunnerAgent: 'qa',
  boundaryConditionEvaluatorAgent: 'qa', mockDataProviderAgent: 'qa',
  chaosEngineeringTesterAgent: 'qa', loadTesterAgent: 'qa',
  accessibilityTesterAgent: 'qa',
  // DevOps (8)
  deploymentAgent: 'devops', devOpsEngineerAgent: 'devops',
  dockerfileCreatorAgent: 'devops', ciCdWorkflowAuthorAgent: 'devops',
  environmentVariablesAuditAgent: 'devops', pathNormalizerAgent: 'devops',
  kubernetesOrchestratorAgent: 'devops', infrastructureAsCodeAgent: 'devops',
  // Security (10)
  securityAgent: 'security', dependencyVulnerabilityScannerAgent: 'security',
  staticCodeAnalysisReviewerAgent: 'security', sqlInjectionBlockerAgent: 'security',
  secretTokenLeakDetectorAgent: 'security', dataPrivacyAuditorAgent: 'security',
  penetrationTesterAgent: 'security', iamRoleAuditorAgent: 'security',
  encryptionSpecialistAgent: 'security', zeroTrustArchitectAgent: 'security',
  // Self-Healing (7)
  runtimeErrorLogParserAgent: 'engineering', stackTraceDecoderAgent: 'engineering',
  refactoringProposerAgent: 'engineering', loopBreakMonitorAgent: 'engineering',
  memoryLeakDetectorAgent: 'engineering', deadlockResolverAgent: 'engineering',
  dependencyConflictResolverAgent: 'engineering',
};

export function getAgentScope(agentId: string): MemoryScope {
  return AGENT_SCOPE_MAP[agentId] || 'global';
}

/**
 * Initialize the MemoryBus and make it globally available.
 * Call this once at server startup AFTER the Mastra container is created.
 * This does NOT modify any agent files — it attaches the bus to the global scope.
 */
export async function initMemoryBridge(): Promise<void> {
  await memoryBus.init();

  // Attach to global scope so orchestrators can access it
  (globalThis as any).__ventureMemoryBus = memoryBus;
  (globalThis as any).__ventureAgentScopeMap = AGENT_SCOPE_MAP;

  // Set up cross-department promotion rules:
  // When sales writes a lead profile, promote to global once project confirmed
  memoryBus.subscribe('sales', (entry) => {
    if (entry.key === 'project_confirmed') {
      // Auto-write to global so engineering can pick it up
      memoryBus.write(
        'context-bridge',
        `confirmed_project_${entry.value?.dealId || 'unknown'}`,
        entry.value,
        'global',
        86400 // 24hr TTL
      ).catch(console.error);
      console.log(`🧠 [ContextBridge] Promoted confirmed project to global scope`);
    }
  });

  console.log(`🧠 [ContextBridge] Memory bridge active — ${Object.keys(AGENT_SCOPE_MAP).length} agents mapped to scopes`);
}

/**
 * Helper: write to the bus with automatic scope detection from agentId
 */
export async function agentWrite(agentId: string, key: string, value: any, ttl?: number) {
  const scope = getAgentScope(agentId);
  return memoryBus.write(agentId, key, value, scope, ttl);
}

/**
 * Helper: read from the bus
 */
export async function agentRead(agentId: string, key: string) {
  return memoryBus.read(agentId, key);
}

export { AGENT_SCOPE_MAP };
