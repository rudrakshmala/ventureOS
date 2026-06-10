// 📄 src/mastra/index.ts — VentureOS 76-Agent Mastra Registry
import { Mastra } from '@mastra/core';

// Core Business & Sales (14)
import { marketScoutAgent } from './agents/marketScout.js';
import { leadProfilerAgent } from './agents/leadProfiler.js';
import { opportunityRankerAgent } from './agents/opportunityRanker.js';
import { pitchCrafterAgent } from './agents/pitchCrafter.js';
import { emailSenderAgent } from './agents/emailSender.js';
import { followUpAgent } from './agents/followUp.js';
import { closingAgent } from './agents/closing.js';
import { projectPlannerAgent } from './agents/projectPlanner.js';
import { deliveryOrchestratorAgent } from './agents/deliveryOrchestrator.js';
import { clientUpdateAgent } from './agents/clientUpdate.js';
import { invoiceAgent } from './agents/invoice.js';
import { revenueTrackerAgent } from './agents/revenueTracker.js';
import { retrospectiveAgent } from './agents/retrospective.js';
import { growthHackerAgent } from './agents/growthHacker.js';

// Executive Strategy Core (3)
import { ceoAgent } from './agents/ceo.js';
import { cooAgent } from './agents/coo.js';
import { caoAgent } from './agents/cao.js';

// Product & Requirements Guild (7)
import { brdAuthorAgent } from './agents/brdAuthor.js';
import { userStoryArchitectAgent } from './agents/userStoryArchitect.js';
import { edgeCaseMapperAgent } from './agents/edgeCaseMapper.js';
import { uiUxFlowDesignerAgent } from './agents/uiUxFlowDesigner.js';
import { productManagerAgent } from './agents/productManager.js';
import { marketAnalystAgent } from './agents/marketAnalyst.js';
import { customerPersonaAgent } from './agents/customerPersona.js';

// Core Software Engineering (15)
import { coderAgent } from './agents/coder.js';
import { architectAgent } from './agents/architect.js';
import { frontendEngineerAgent } from './agents/frontendEngineer.js';
import { databaseDesignerAgent } from './agents/databaseDesigner.js';
import { apiIntegratorAgent } from './agents/apiIntegrator.js';
import { uiDesignerAgent } from './agents/uiDesigner.js';
import { authEngineerAgent } from './agents/authEngineer.js';
import { paymentEngineerAgent } from './agents/paymentEngineer.js';
import { notificationEngineerAgent } from './agents/notificationEngineer.js';
import { backendNodeSpecialistAgent } from './agents/backendNodeSpecialist.js';
import { packageDependencyResolverAgent } from './agents/packageDependencyResolver.js';
import { graphqlSpecialistAgent } from './agents/graphqlSpecialist.js';
import { websocketEngineerAgent } from './agents/websocketEngineer.js';
import { stateManagementEngineerAgent } from './agents/stateManagementEngineer.js';
import { accessibilityEngineerAgent } from './agents/accessibilityEngineer.js';

// Quality Assurance & Verification Matrix (10)
import { qaAgent } from './agents/qa.js';
import { bugHunterAgent } from './agents/bugHunter.js';
import { performanceOptimizerAgent } from './agents/performanceOptimizer.js';
import { unitTestGeneratorAgent } from './agents/unitTestGenerator.js';
import { integrationTestRunnerAgent } from './agents/integrationTestRunner.js';
import { boundaryConditionEvaluatorAgent } from './agents/boundaryConditionEvaluator.js';
import { mockDataProviderAgent } from './agents/mockDataProvider.js';
import { chaosEngineeringTesterAgent } from './agents/chaosEngineeringTester.js';
import { loadTesterAgent } from './agents/loadTester.js';
import { accessibilityTesterAgent } from './agents/accessibilityTester.js';

// DevOps & Infrastructure Fleet (8)
import { deploymentAgent } from './agents/deploymentAgent.js';
import { devOpsEngineerAgent } from './agents/devOpsEngineer.js';
import { dockerfileCreatorAgent } from './agents/dockerfileCreator.js';
import { ciCdWorkflowAuthorAgent } from './agents/ciCdWorkflowAuthor.js';
import { environmentVariablesAuditAgent } from './agents/environmentVariablesAudit.js';
import { pathNormalizerAgent } from './agents/pathNormalizer.js';
import { kubernetesOrchestratorAgent } from './agents/kubernetesOrchestrator.js';
import { infrastructureAsCodeAgent } from './agents/infrastructureAsCode.js';

// Cybersecurity & Hardening Vanguard (10)
import { securityAgent } from './agents/security.js';
import { dependencyVulnerabilityScannerAgent } from './agents/dependencyVulnerabilityScanner.js';
import { staticCodeAnalysisReviewerAgent } from './agents/staticCodeAnalysisReviewer.js';
import { sqlInjectionBlockerAgent } from './agents/sqlInjectionBlocker.js';
import { secretTokenLeakDetectorAgent } from './agents/secretTokenLeakDetector.js';
import { dataPrivacyAuditorAgent } from './agents/dataPrivacyAuditor.js';
import { penetrationTesterAgent } from './agents/penetrationTester.js';
import { iamRoleAuditorAgent } from './agents/iamRoleAuditor.js';
import { encryptionSpecialistAgent } from './agents/encryptionSpecialist.js';
import { zeroTrustArchitectAgent } from './agents/zeroTrustArchitect.js';

// Self-Healing Automation Core (7)
import { runtimeErrorLogParserAgent } from './agents/runtimeErrorLogParser.js';
import { stackTraceDecoderAgent } from './agents/stackTraceDecoder.js';
import { refactoringProposerAgent } from './agents/refactoringProposer.js';
import { loopBreakMonitorAgent } from './agents/loopBreakMonitor.js';
import { memoryLeakDetectorAgent } from './agents/memoryLeakDetector.js';
import { deadlockResolverAgent } from './agents/deadlockResolver.js';
import { dependencyConflictResolverAgent } from './agents/dependencyConflictResolver.js';

// Re-export all agents for direct use
export {
  marketScoutAgent, leadProfilerAgent, opportunityRankerAgent, pitchCrafterAgent, emailSenderAgent, followUpAgent, closingAgent, projectPlannerAgent, deliveryOrchestratorAgent, clientUpdateAgent, invoiceAgent, revenueTrackerAgent, retrospectiveAgent, growthHackerAgent,
  ceoAgent, cooAgent, caoAgent,
  brdAuthorAgent, userStoryArchitectAgent, edgeCaseMapperAgent, uiUxFlowDesignerAgent, productManagerAgent, marketAnalystAgent, customerPersonaAgent,
  coderAgent, architectAgent, frontendEngineerAgent, databaseDesignerAgent, apiIntegratorAgent, uiDesignerAgent, authEngineerAgent, paymentEngineerAgent, notificationEngineerAgent, backendNodeSpecialistAgent, packageDependencyResolverAgent, graphqlSpecialistAgent, websocketEngineerAgent, stateManagementEngineerAgent, accessibilityEngineerAgent,
  qaAgent, bugHunterAgent, performanceOptimizerAgent, unitTestGeneratorAgent, integrationTestRunnerAgent, boundaryConditionEvaluatorAgent, mockDataProviderAgent, chaosEngineeringTesterAgent, loadTesterAgent, accessibilityTesterAgent,
  deploymentAgent, devOpsEngineerAgent, dockerfileCreatorAgent, ciCdWorkflowAuthorAgent, environmentVariablesAuditAgent, pathNormalizerAgent, kubernetesOrchestratorAgent, infrastructureAsCodeAgent,
  securityAgent, dependencyVulnerabilityScannerAgent, staticCodeAnalysisReviewerAgent, sqlInjectionBlockerAgent, secretTokenLeakDetectorAgent, dataPrivacyAuditorAgent, penetrationTesterAgent, iamRoleAuditorAgent, encryptionSpecialistAgent, zeroTrustArchitectAgent,
  runtimeErrorLogParserAgent, stackTraceDecoderAgent, refactoringProposerAgent, loopBreakMonitorAgent, memoryLeakDetectorAgent, deadlockResolverAgent, dependencyConflictResolverAgent
};

// Boot the global Mastra container with all 74 agents
export const mastra = new Mastra({
  agents: {
    marketScoutAgent, leadProfilerAgent, opportunityRankerAgent, pitchCrafterAgent, emailSenderAgent, followUpAgent, closingAgent, projectPlannerAgent, deliveryOrchestratorAgent, clientUpdateAgent, invoiceAgent, revenueTrackerAgent, retrospectiveAgent, growthHackerAgent,
    ceoAgent, cooAgent, caoAgent,
    brdAuthorAgent, userStoryArchitectAgent, edgeCaseMapperAgent, uiUxFlowDesignerAgent, productManagerAgent, marketAnalystAgent, customerPersonaAgent,
    coderAgent, architectAgent, frontendEngineerAgent, databaseDesignerAgent, apiIntegratorAgent, uiDesignerAgent, authEngineerAgent, paymentEngineerAgent, notificationEngineerAgent, backendNodeSpecialistAgent, packageDependencyResolverAgent, graphqlSpecialistAgent, websocketEngineerAgent, stateManagementEngineerAgent, accessibilityEngineerAgent,
    qaAgent, bugHunterAgent, performanceOptimizerAgent, unitTestGeneratorAgent, integrationTestRunnerAgent, boundaryConditionEvaluatorAgent, mockDataProviderAgent, chaosEngineeringTesterAgent, loadTesterAgent, accessibilityTesterAgent,
    deploymentAgent, devOpsEngineerAgent, dockerfileCreatorAgent, ciCdWorkflowAuthorAgent, environmentVariablesAuditAgent, pathNormalizerAgent, kubernetesOrchestratorAgent, infrastructureAsCodeAgent,
    securityAgent, dependencyVulnerabilityScannerAgent, staticCodeAnalysisReviewerAgent, sqlInjectionBlockerAgent, secretTokenLeakDetectorAgent, dataPrivacyAuditorAgent, penetrationTesterAgent, iamRoleAuditorAgent, encryptionSpecialistAgent, zeroTrustArchitectAgent,
    runtimeErrorLogParserAgent, stackTraceDecoderAgent, refactoringProposerAgent, loopBreakMonitorAgent, memoryLeakDetectorAgent, deadlockResolverAgent, dependencyConflictResolverAgent
  },
});

import { initMemoryBridge } from '../memory/context-bridge.js';
// Fire and forget initialization
initMemoryBridge().catch(console.error);

console.log('🏢 [VentureOS] 76-Agent Corporate Grid registered in Mastra container');