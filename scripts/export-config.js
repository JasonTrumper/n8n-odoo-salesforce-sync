const fs = require('fs');
const axios = require('axios');
const path = require('path');

const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const EXPORT_DIR = '../exports';
const CREDENTIALS_EXPORT_DIR = path.join(EXPORT_DIR, 'credentials');
const WORKFLOWS_EXPORT_DIR = path.join(EXPORT_DIR, 'workflows');

async function exportConfig() {
  try {
    console.log('Starting n8n configuration export...');
    
    // Create export directories
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
    if (!fs.existsSync(CREDENTIALS_EXPORT_DIR)) {
      fs.mkdirSync(CREDENTIALS_EXPORT_DIR, { recursive: true });
    }
    if (!fs.existsSync(WORKFLOWS_EXPORT_DIR)) {
      fs.mkdirSync(WORKFLOWS_EXPORT_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportSummary = {
      timestamp: timestamp,
      exported_at: new Date().toISOString(),
      items: {}
    };

    // Export Workflows
    console.log('Exporting workflows...');
    try {
      const workflowsResponse = await axios.get(`${N8N_BASE_URL}/workflows`);
      const workflows = workflowsResponse.data.data;
      
      exportSummary.items.workflows = workflows.length;
      
      for (const workflow of workflows) {
        const fileName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filePath = path.join(WORKFLOWS_EXPORT_DIR, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
        console.log(`✓ Exported workflow: ${workflow.name}`);
      }
    } catch (error) {
      console.error('✗ Failed to export workflows:', error.message);
      exportSummary.workflows_error = error.message;
    }

    // Export Credentials (metadata only - not the actual secrets)
    console.log('Exporting credentials metadata...');
    try {
      const credentialsResponse = await axios.get(`${N8N_BASE_URL}/credentials`);
      const credentials = credentialsResponse.data.data;
      
      exportSummary.items.credentials = credentials.length;
      
      const credentialsMetadata = credentials.map(cred => ({
        id: cred.id,
        name: cred.name,
        type: cred.type,
        created_at: cred.createdAt,
        updated_at: cred.updatedAt
      }));
      
      const credsFilePath = path.join(CREDENTIALS_EXPORT_DIR, `credentials-metadata-${timestamp}.json`);
      fs.writeFileSync(credsFilePath, JSON.stringify(credentialsMetadata, null, 2));
      console.log(`✓ Exported metadata for ${credentials.length} credentials`);
    } catch (error) {
      console.error('✗ Failed to export credentials:', error.message);
      exportSummary.credentials_error = error.message;
    }

    // Export Execution Data (optional)
    console.log('Exporting recent executions...');
    try {
      const executionsResponse = await axios.get(`${N8N_BASE_URL}/executions?limit=50`);
      const executions = executionsResponse.data.data;
      
      exportSummary.items.executions = executions.length;
      
      if (executions.length > 0) {
        const execsFilePath = path.join(EXPORT_DIR, `executions-${timestamp}.json`);
        fs.writeFileSync(execsFilePath, JSON.stringify(executions, null, 2));
        console.log(`✓ Exported ${executions.length} recent executions`);
      }
    } catch (error) {
      console.error('✗ Failed to export executions:', error.message);
      exportSummary.executions_error = error.message;
    }

    // Save export summary
    const summaryPath = path.join(EXPORT_DIR, `export-summary-${timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(exportSummary, null, 2));

    console.log('\n=== Export Summary ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Workflows: ${exportSummary.items.workflows || 0}`);
    console.log(`Credentials: ${exportSummary.items.credentials || 0}`);
    console.log(`Executions: ${exportSummary.items.executions || 0}`);
    console.log(`Export location: ${path.resolve(EXPORT_DIR)}`);
    console.log('=====================');

  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

// Also create a quick backup script variant
async function quickBackup() {
  console.log('Creating quick backup...');
  const backupDir = path.join(EXPORT_DIR, 'quick-backup', new Date().toISOString().split('T')[0]);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    // Just backup workflows for quick backup
    const workflowsResponse = await axios.get(`${N8N_BASE_URL}/workflows`);
    const workflows = workflowsResponse.data.data;
    
    for (const workflow of workflows) {
      const fileName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      const filePath = path.join(backupDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
    }
    
    console.log(`✓ Quick backup created: ${backupDir}`);
    console.log(`✓ Backed up ${workflows.length} workflows`);
    
  } catch (error) {
    console.error('Quick backup failed:', error.message);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--quick') || args.includes('-q')) {
  quickBackup();
} else {
  exportConfig();
}