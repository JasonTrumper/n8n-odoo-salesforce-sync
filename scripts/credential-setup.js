const https = require('https');
const fs = require('fs');

const N8N_BASE_URL = 'http://localhost:5678';
const API_PATH = '/api/v1/credentials';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function getCredentialIds() {
  try {
    console.log('Fetching credential information from n8n...');
    
    // For HTTP (not HTTPS) we need to handle it differently
    // Since we're using localhost, we can use the http module
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: 5678,
      path: API_PATH,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const data = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Failed to parse response: ' + data));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    const credentials = data.data || [];
    
    console.log('\n=== Available Credentials ===');
    if (credentials.length === 0) {
      console.log('No credentials found.');
      console.log('Please create credentials in the n8n UI first.');
      return [];
    }
    
    credentials.forEach(cred => {
      console.log(`Name: ${cred.name}`);
      console.log(`Type: ${cred.type}`);
      console.log(`ID: ${cred.id}`);
      console.log('---');
    });
    
    return credentials;
  } catch (error) {
    console.error('Failed to fetch credentials:', error.message);
    console.log('\nMake sure:');
    console.log('1. n8n is running on http://localhost:5678');
    console.log('2. You have created credentials in the n8n UI');
    return [];
  }
}

async function updateWorkflowCredentials() {
  const credentials = await getCredentialIds();
  
  const salesforceCred = credentials.find(c => c.name === 'Salesforce account - Odoo Sandbox');
  const odooCred = credentials.find(c => c.name === 'Odoo account - Local');
  
  console.log('\n=== Credential Status ===');
  if (salesforceCred) {
    console.log('✓ Salesforce credential found');
  } else {
    console.log('⚠️  Salesforce credential "Salesforce account - Odoo Sandbox" not found');
  }
  
  if (odooCred) {
    console.log('✓ Odoo credential found');
  } else {
    console.log('⚠️  Odoo credential "Odoo account - Local" not found');
  }
  
  console.log('\n=== Current Credential Names in Workflows ===');
  console.log('Salesforce: "Salesforce account - Odoo Sandbox"');
  console.log('Odoo: "Odoo account - Local"');
  
  if (!salesforceCred || !odooCred) {
    console.log('\n=== Available Credential Names ===');
    credentials.forEach(cred => {
      console.log(`- ${cred.name} (${cred.type})`);
    });
    
    console.log('\nIf your credentials have different names, you need to:');
    console.log('1. Update the workflow files with the correct names, or');
    console.log('2. Create new credentials with the expected names in n8n UI');
  } else {
    console.log('\n✓ Credentials are properly configured!');
    console.log('You can now deploy your workflows.');
  }
}

// Run the setup
updateWorkflowCredentials();