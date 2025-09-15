
## 9. Main README

**`README.md`**
```markdown
# Salesforce-Odoo Bidirectional Sync with n8n

Complete solution for synchronizing data between Salesforce Sandbox and Odoo 17.

## Features

- 🔄 Bidirectional real-time sync
- 🛡️ Comprehensive error handling
- 📊 Automated object discovery
- 🔧 Easy configuration management
- 📝 Detailed logging and monitoring

## Quick Start

```bash
# 1. Clone and setup
git clone <this-repo>
cd n8n-odoo-salesforce-sync

# 2. Configure environment
cp .env.example .env
copy .env.example .env
# Edit .env with your settings

# 3. Start n8n
docker-compose up -d

# 4. Set up connections in n8n UI
# Open http://localhost:5678

# 5. Deploy workflows
npm install
node scripts/deploy-workflows.js