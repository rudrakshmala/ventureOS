const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '..', 'src', 'mastra', 'agents');

const departments = {
  exec: ['ceo', 'coo', 'cao'],
  product: ['brdAuthor', 'userStoryArchitect', 'edgeCaseMapper', 'uiUxFlowDesigner', 'productManager', 'marketAnalyst', 'customerPersona'],
  eng: ['coder', 'architect', 'frontendEngineer', 'databaseDesigner', 'apiIntegrator', 'uiDesigner', 'authEngineer', 'paymentEngineer', 'notificationEngineer', 'backendNodeSpecialist', 'packageDependencyResolver', 'graphqlSpecialist', 'websocketEngineer', 'stateManagementEngineer', 'accessibilityEngineer'],
  qa: ['qa', 'bugHunter', 'performanceOptimizer', 'unitTestGenerator', 'integrationTestRunner', 'boundaryConditionEvaluator', 'mockDataProvider', 'chaosEngineeringTester', 'loadTester', 'accessibilityTester'],
  devops: ['deployment', 'devOpsEngineer', 'dockerfileCreator', 'ciCdWorkflowAuthor', 'environmentVariablesAudit', 'pathNormalizer', 'kubernetesOrchestrator', 'infrastructureAsCode'],
  cyber: ['security', 'dependencyVulnerabilityScanner', 'staticCodeAnalysisReviewer', 'sqlInjectionBlocker', 'secretTokenLeakDetector', 'dataPrivacyAuditor', 'penetrationTester', 'iamRoleAuditor', 'encryptionSpecialist', 'zeroTrustArchitect'],
  healing: ['runtimeErrorLogParser', 'stackTraceDecoder', 'refactoringProposer', 'loopBreakMonitor', 'memoryLeakDetector', 'deadlockResolver', 'dependencyConflictResolver']
};

let allAgents = [];
let indexExports = [];
let indexImports = [];

for (const [dept, names] of Object.entries(departments)) {
  for (const name of names) {
    allAgents.push(name + 'Agent');
    const filename = `${name}.ts`;
    const filePath = path.join(agentsDir, filename);

    indexImports.push(`import { ${name}Agent } from './agents/${name}.js';`);

    if (!fs.existsSync(filePath)) {
      const code = `// 📄 src/mastra/agents/${filename}
import { Agent } from '@mastra/core/agent';

export const ${name}Agent = new Agent({
  name: '${name}Agent',
  instructions: \`
    You are the ${name} for the VentureOS 76-Agent Empire.
    Your department is: ${dept.toUpperCase()}.
    Analyze the instructions and return output tailored strictly to your domain.
    Never output markdown code blocks unnecessarily unless code is specifically requested.
  \`,
  model: 'groq/llama-3.1-8b-instant',
  tools: {},
});
`;
      fs.writeFileSync(filePath, code, 'utf8');
      console.log(`Created: ${filename}`);
    }
  }
}

console.log('\n--- ALL AGENT IMPORTS ---');
console.log(indexImports.join('\n'));

console.log('\n--- MASTRA AGENT REGISTRY OBJECT ---');
console.log('agents: {\n  ' + allAgents.join(', ') + '\n}');
