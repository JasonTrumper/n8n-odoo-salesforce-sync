const fs = require('fs');
const path = require('path');

// Update these to match your actual credential names
const ACTUAL_CREDENTIAL_NAMES = {
  salesforce: 'Your Actual Salesforce Credential Name',
  odoo: 'Your Actual Odoo Credential Name'
};

function updateWorkflowCredentialNames() {
  const workflowsDir = '../workflows';
  const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
  
  workflowFiles.forEach(file => {
    const filePath = path.join(workflowsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update Salesforce credential name
    content = content.replace(/"name": "Salesforce Sandbox"/g, `"name": "${ACTUAL_CREDENTIAL_NAMES.salesforce}"`);
    
    // Update Odoo credential name
    content = content.replace(/"name": "Odoo 17 Local"/g, `"name": "${ACTUAL_CREDENTIAL_NAMES.odoo}"`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${file}`);
  });
  
  console.log('Credential names updated in all workflow files');
}

// Run after you determine your actual credential names
updateWorkflowCredentialNames();