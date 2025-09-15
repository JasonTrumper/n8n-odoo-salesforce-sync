const fs = require('fs');
const path = require('path');

function verifyWorkflowCredentials() {
  const workflowsDir = './workflows';
  const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
  
  console.log('=== Verifying Workflow Credential Configuration ===\n');
  
  workflowFiles.forEach(file => {
    console.log(`Checking: ${file}`);
    const filePath = path.join(workflowsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    
    workflow.nodes.forEach(node => {
      if (node.parameters && node.parameters.credentials) {
        Object.values(node.parameters.credentials).forEach(credConfig => {
          if (credConfig.id !== null) {
            console.log(`   ⚠️  WARNING: ${node.name} has hardcoded ID: ${credConfig.id}`);
          } else if (credConfig.name) {
            console.log(`   ✓ ${node.name}: ${credConfig.name} (ID: null - correct)`);
          }
        });
      }
    });
    console.log('');
  });
}

verifyWorkflowCredentials();