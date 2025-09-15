# n8n Odoo-Salesforce Sync

This repository provides workflows for **bidirectional, real-time synchronization** between a **Salesforce Sandbox** (custom `Lead__c` object) and **Odoo 17** (CRM leads) using **n8n**, an open-source workflow automation tool. It syncs leads with fields like Name, Email, and Company, with error handling and automated object discovery.

## Features
- **Bidirectional Sync**: Sync Salesforce `Lead__c` to Odoo CRM leads and vice versa.
- **Error Handling**: Logs sync failures for easy debugging.
- **Automated Object Discovery**: Dynamically maps fields between systems.
- **Easy Setup**: Uses n8n UI for credential setup and Docker for deployment.
- **Monitoring**: Tracks sync activities via n8n’s Executions tab.

## Prerequisites
- **Docker** and **Docker Compose** (Windows: Docker Desktop, preferably with WSL2).
- **Salesforce Sandbox** with API access (OAuth2 for `Lead__c` object).
- **Odoo 17** instance (local or hosted) with API key or username/password.
- Windows users: Use Command Prompt, PowerShell, or Git Bash for commands.
- Optional: **Node.js** (v16+) and **npm** (v8+) for scripts.

## Setup Instructions

### 1. Clone the Repository
Clone and navigate to the repository:
```bash
git clone https://github.com/JasonTrumper/n8n-odoo-salesforce-sync.git
cd n8n-odoo-salesforce-sync
```

### 2. Configure Environment Variables
1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
2. Edit `.env` with your n8n and system settings:
   ```
   # n8n
   N8N_HOST=http://localhost:5678  # Use http://host.docker.internal:5678 for WSL2
   N8N_BLOCK_ENV_ACCESS_IN_NODE=false

   # Salesforce (Sandbox)
   SF_CLIENT_ID=your_salesforce_client_id
   SF_CLIENT_SECRET=your_salesforce_client_secret
   SF_USERNAME=your_sandbox_username
   SF_PASSWORD=your_sandbox_password
   SF_TOKEN=your_security_token
   SF_INSTANCE_URL=https://test.salesforce.com

   # Odoo
   ODOO_URL=http://localhost:8069  # Update if hosted elsewhere
   ODOO_DB=your_odoo_database
   ODOO_USERNAME=your_odoo_username
   ODOO_PASSWORD=your_odoo_password
   # or ODOO_API_KEY=your_odoo_api_key
   ```
3. **Windows Users**: Save `.env` in UTF-8 with LF line endings:
   - VS Code: Set to LF (bottom-right corner).
   - Notepad++: Edit > EOL Conversion > Unix (LF).

### 3. Start n8n with Docker
1. Run Docker Compose:
   ```bash
   docker-compose up -d
   ```
2. Verify containers:
   ```bash
   docker ps
   ```
   Look for `n8n-odoo-salesforce-sync-n8n-1` (port 5678) and `postgres-1`.
3. Open n8n UI at `http://localhost:5678`. Create an admin account if prompted (first-time setup).

### 4. Set Up Credentials in n8n UI
Credentials must be configured manually in the n8n UI for security.

1. Go to **Credentials** > **Add Credential**.
2. **Salesforce Credential**:
   - Type: **Salesforce OAuth2 API**.
   - Name: `Salesforce account` (exact name, case-sensitive).
   - Environment: Sandbox.
   - Enter `Client ID`, `Client Secret`, and `Instance URL` from `.env`.
   - Complete the OAuth2 authentication flow.
   - Save and test the credential.
3. **Odoo Credential**:
   - Type: **Odoo**.
   - Name: `Odoo account` (exact name, case-sensitive).
   - Enter `ODOO_URL`, `ODOO_DB`, and `ODOO_USERNAME`/`ODOO_PASSWORD` or `ODOO_API_KEY` from `.env`.
   - Save and test the credential.

### 5. Import Workflows
The repository includes two workflows in the `workflows` folder:
- `salesforce-to-odoo-lead-sync.json`: Syncs Salesforce `Lead__c` to Odoo CRM leads.
- `odoo-to-salesforce-lead-sync.json`: Syncs Odoo CRM leads to Salesforce `Lead__c`.

1. Ensure the `workflows` folder exists:
   ```bash
   mkdir workflows
   ```
2. Copy or download the workflow JSON files to `n8n-odoo-salesforce-sync/workflows/`.
3. In n8n UI:
   - Go to **Workflows** > Click **+** > **Import from File**.
   - Select `salesforce-to-odoo-lead-sync.json` and `odoo-to-salesforce-lead-sync.json`.
4. Assign credentials:
   - Open each workflow.
   - For Salesforce nodes, select `Salesforce account` credential.
   - For Odoo nodes, select `Odoo account` credential.
   - Save each workflow.

### 6. Test Workflows
Test workflows manually before enabling real-time sync.

1. **Salesforce to Odoo**:
   - Open `salesforce-to-odoo-lead-sync` in n8n UI.
   - Replace the **Webhook** node with a **Manual Trigger** node (drag from nodes panel, connect to Salesforce node, delete Webhook).
   - In the Salesforce node, set `recordId` to a valid `Lead__c` ID (e.g., `a0KO500000QeLhtMAF`).
   - Click **Execute Workflow**.
   - Check Odoo’s CRM module for the synced lead (Name, Email, Company).
2. **Odoo to Salesforce**:
   - Open `odoo-to-salesforce-lead-sync`.
   - Replace **Webhook** with **Manual Trigger**.
   - In the Odoo node, set `id` to a valid Odoo CRM lead ID.
   - Click **Execute Workflow**.
   - Check Salesforce for the synced `Lead__c`.
3. Monitor results in the **Executions** tab for errors.

### 7. Set Up Real-Time Triggers
For real-time sync:
- **Salesforce**:
  - Create a Salesforce Flow or Apex trigger to send a POST request to `http://localhost:5678/webhook/salesforce-to-odoo-lead` with `{"Id": "your_lead_id"}`.
  - Test with:
    ```bash
    curl -X POST "http://localhost:5678/webhook/salesforce-to-odoo-lead" -H "Content-Type: application/json" -d "{\"Id\": \"your_lead_id\"}"
    ```
  - In PowerShell:
    ```powershell
    Invoke-RestMethod -Uri "http://localhost:5678/webhook/salesforce-to-odoo-lead" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"Id": "your_lead_id"}'
    ```
- **Odoo**:
  - Create an Odoo automated action to send a POST request to `http://localhost:5678/webhook/odoo-to-salesforce-lead` with `{"id": your_odoo_lead_id}`.
  - Test with:
    ```bash
    curl -X POST "http://localhost:5678/webhook/odoo-to-salesforce-lead" -H "Content-Type: application/json" -d "{\"id\": your_odoo_lead_id}"
    ```
- **Windows/WSL2**: If `localhost` fails, use `http://host.docker.internal:5678`. Update `N8N_HOST` in `.env` and restart:
  ```bash
  docker-compose down
  docker-compose up -d
  ```
- Revert to **Webhook** nodes and activate workflows (toggle **Active** to ON).

### Troubleshooting
- **Credentials Errors**: Ensure credential names are exactly `Salesforce account` and `Odoo account`.
- **Webhook 422 Error**: Use double quotes in JSON payloads (e.g., `{"Id": "your_lead_id"}`).
- **Field Mismatches**: If `Lead__c` fields (`name__c`, `email__c`, `company__c`) differ, update node parameters in n8n UI to match your Salesforce schema.
- **Logs**: Check n8n logs:
  ```bash
  docker-compose logs n8n
  ```
- **Windows**:
  - Save `.env` and JSON files in UTF-8 with LF line endings.
  - Verify Node.js (v16+) and npm (v8+):
    ```bash
    node --version
    npm --version
    ```
  - Install dependencies if running scripts:
    ```bash
    npm install
    ```

### Customization
- **Fields**: Edit nodes to sync additional fields (e.g., phone, address) in n8n UI.
- **Objects**: Modify workflows for other objects (e.g., opportunities, `sale.order`).
- **Scheduled Sync**: Replace Webhook with **Schedule** node (e.g., every 5 minutes).

### Support
- Issues: `https://github.com/JasonTrumper/n8n-odoo-salesforce-sync/issues`.
- n8n Community: `forum.n8n.io`.