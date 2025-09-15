# Salesforce-Odoo Sync Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- n8n running on port 5678
- Salesforce Sandbox with API access
- Odoo 17 running locally

## Setup Steps

1. **Clone and configure**
   ```bash
   git clone <repository>
   cd n8n-odoo-salesforce-sync
   cp .env.example .env
   copy .env.example .env
   # Edit .env with your encryption key