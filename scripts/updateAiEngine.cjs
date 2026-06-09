const fs = require('fs');
const path = require('path');

const agentsList = [
  'marketScoutAgent', 'leadProfilerAgent', 'opportunityRankerAgent', 'pitchCrafterAgent', 'emailSenderAgent', 'followUpAgent', 'closingAgent', 'projectPlannerAgent', 'deliveryOrchestratorAgent', 'clientUpdateAgent', 'invoiceAgent', 'revenueTrackerAgent', 'retrospectiveAgent', 'growthHackerAgent',
  'ceoAgent', 'cooAgent', 'caoAgent',
  'brdAuthorAgent', 'userStoryArchitectAgent', 'edgeCaseMapperAgent', 'uiUxFlowDesignerAgent', 'productManagerAgent', 'marketAnalystAgent', 'customerPersonaAgent',
  'coderAgent', 'architectAgent', 'frontendEngineerAgent', 'databaseDesignerAgent', 'apiIntegratorAgent', 'uiDesignerAgent', 'authEngineerAgent', 'paymentEngineerAgent', 'notificationEngineerAgent', 'backendNodeSpecialistAgent', 'packageDependencyResolverAgent', 'graphqlSpecialistAgent', 'websocketEngineerAgent', 'stateManagementEngineerAgent', 'accessibilityEngineerAgent',
  'qaAgent', 'bugHunterAgent', 'performanceOptimizerAgent', 'unitTestGeneratorAgent', 'integrationTestRunnerAgent', 'boundaryConditionEvaluatorAgent', 'mockDataProviderAgent', 'chaosEngineeringTesterAgent', 'loadTesterAgent', 'accessibilityTesterAgent',
  'deploymentAgent', 'devOpsEngineerAgent', 'dockerfileCreatorAgent', 'ciCdWorkflowAuthorAgent', 'environmentVariablesAuditAgent', 'pathNormalizerAgent', 'kubernetesOrchestratorAgent', 'infrastructureAsCodeAgent',
  'securityAgent', 'dependencyVulnerabilityScannerAgent', 'staticCodeAnalysisReviewerAgent', 'sqlInjectionBlockerAgent', 'secretTokenLeakDetectorAgent', 'dataPrivacyAuditorAgent', 'penetrationTesterAgent', 'iamRoleAuditorAgent', 'encryptionSpecialistAgent', 'zeroTrustArchitectAgent',
  'runtimeErrorLogParserAgent', 'stackTraceDecoderAgent', 'refactoringProposerAgent', 'loopBreakMonitorAgent', 'memoryLeakDetectorAgent', 'deadlockResolverAgent', 'dependencyConflictResolverAgent'
];

let imports = `// 📄 src/mastra/services/aiEngine.ts — VentureOS 76-Agent Registry\nimport { EventEmitter } from 'events';\nEventEmitter.defaultMaxListeners = 200;\nimport dotenv from 'dotenv';\ndotenv.config();\n\n`;

for (const name of agentsList) {
  let file = name.replace('Agent', '');
  if (name === 'deploymentAgent') file = 'deploymentAgent'; // special case
  imports += `import { ${name} } from '../agents/${file}.js';\n`;
}

let registry = `\n// ─── UNIFIED 76-AGENT REGISTRY ────────────────────────────────────────────────\nconst LOCAL_AGENT_REGISTRY: Record<string, any> = {\n`;
for (const name of agentsList) {
  registry += `  ${name},\n`;
}
registry += `};\n\nconsole.log(\`🤖 [AI Engine] Registry loaded: \${Object.keys(LOCAL_AGENT_REGISTRY).length} agents online\`);\n`;

const targetFile = path.join(__dirname, '..', 'src', 'mastra', 'services', 'aiEngine.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace top part up to // ─── MODEL POOL
content = imports + registry + '\n// ─── MODEL POOL' + content.split('// ─── MODEL POOL')[1];

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated aiEngine.ts');
