const fs = require('fs');

console.log('=== n8n Credential Check ===');
console.log('\nTo check your credentials:');
console.log('1. Open n8n in your browser: http://localhost:5678');
console.log('2. Go to "Credentials" in the left sidebar');
console.log('3. Note down the exact names of your credentials');
console.log('\nExpected credential names in workflow files:');
console.log('Salesforce: "Salesforce account - Odoo Sandbox"');
console.log('Odoo: "Odoo account - Local"');
console.log('\nIf your actual credential names are different, you need to:');
console.log('1. Update the names in your workflow JSON files, or');
console.log('2. Create new credentials with the expected names');
console.log('\nYou can also manually check by:');
console.log('1. Importing one workflow');
console.log('2. Checking if it shows "Credential found" or "Credential not found"');