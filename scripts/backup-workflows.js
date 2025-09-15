const fs = require('fs');
const axios = require('axios');
const path = require('path');

const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const BACKUP_DIR = '../backups';

async function backupWorkflows() {
  try {
    console.log('Starting backup...');
    
    const response = await axios.get(`${N8N_BASE_URL}/workflows`);
    const workflows = response.data.data;
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupFolder);
    
    for (const workflow of workflows) {
      const fileName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      const filePath = path.join(backupFolder, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
      console.log(`✓ Backed up: ${workflow.name}`);
    }
    
    console.log(`Backup completed! Saved ${workflows.length} workflows to ${backupFolder}`);
  } catch (error) {
    console.error('Backup failed:', error.message);
  }
}

backupWorkflows();