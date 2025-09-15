const fs = require('fs');
const axios = require('axios');
const path = require('path');

const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const WORKFLOWS_DIR = '../workflows';

async function checkCredentials() {
  try {
    const response = await axios.get(`${N8N_BASE_URL}/credentials`);
    const credentials = response.data.data;
    
    const hasSalesforce = credentials.some(c => c.name === 'Salesforce account - Odoo Sandbox');
    const hasOdoo = credentials.some(c => c.name === 'Odoo account - Local');
    
    if (!hasSalesforce) {
      console.log('⚠️  Warning: Salesforce credential "Salesforce account - Odoo Sandbox" not found');
    }
    
    if (!hasOdoo) {
      console.log('⚠️  Warning: Odoo credential "Odoo account - Local" not found');
    }
    
    if (hasSalesforce && hasOdoo) {
      console.log('✓ Both credentials found and ready for use');
    }
    
    return { hasSalesforce, hasOdoo };
  } catch (error) {
    console.error('Could not check credentials:', error.message);
    return { hasSalesforce: false, hasOdoo: false };
  }
}

async function deployWorkflows() {
  try {
    console.log('Starting workflow deployment...');

    // Check credentials first
    const credentialStatus = await checkCredentials();
    
    const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
      .filter(file => file.endsWith('.json'))
      .sort(); // Deploy in order

    for (const file of workflowFiles) {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`Processing: ${workflowData.name}`);

      try {
        // Check if workflow exists
        const existingResponse = await axios.get(`${N8N_BASE_URL}/workflows`);
        const existingWorkflow = existingResponse.data.data.find(w => w.name === workflowData.name);
        
        if (existingWorkflow) {
          // Update existing
          await axios.put(`${N8N_BASE_URL}/workflows/${existingWorkflow.id}`, workflowData);
          console.log(`✓ Updated: ${workflowData.name}`);
        } else {
          // Create new
          await axios.post(`${N8N_BASE_URL}/workflows`, workflowData);
          console.log(`✓ Created: ${workflowData.name}`);
        }
      } catch (error) {
        console.error(`✗ Failed to deploy ${workflowData.name}:`, error.message);
      }
      
      // Small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Deployment completed!');
  } catch (error) {
    console.error('Deployment failed:', error.message);
  }
}

deployWorkflows();