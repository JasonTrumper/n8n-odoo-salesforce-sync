# n8n - Odoo ⇄ Salesforce Sync (Docker)

This repository brings up an n8n instance (with Postgres) and includes starter data to connect to Salesforce (OAuth2) and Odoo.

## Quickstart

1. Copy `.env.example` to `.env` and fill in values (Salesforce client id/secret, Odoo URL/API key, etc.).
2. Generate an encryption key for n8n:
   ```
   openssl rand -hex 32
   ```
   Put the result in `N8N_ENCRYPTION_KEY` in your `.env`.
3. Start the stack:
   ```
   docker-compose up -d
   ```
4. (Optional) Import the starter credentials and workflow:
   ```
   ./scripts/import.sh
   ```
   The script will attempt to POST to n8n's import endpoints. If your n8n instance is protected by Basic Auth or is not yet ready, import may fail; you can instead import via n8n UI (_Credentials → Import_, _Workflows → Import_).

5. Open n8n at `http://localhost:5678` (or your configured `WEBHOOK_URL`). Use the Basic Auth credentials from `.env`.
6. For Salesforce OAuth: open **Credentials → Salesforce OAuth2** and click **Connect** to complete the OAuth consent flow.

## Notes & Limitations

* Salesforce OAuth cannot be fully automated because user consent is required. This repo creates credential stubs so you only need to "Connect" once in the UI.
* The included workflow is a minimal example. Update field mappings, models, domains, and upsert keys to match your org.
* If running locally, use `ngrok` or an HTTP reverse proxy to provide a public `WEBHOOK_URL` for Salesforce OAuth redirection.

## Files

* `docker-compose.yml` - n8n + Postgres stack
* `.env.example` - env variables to populate
* `init-data/credentials.json` - credential stubs for import
* `init-data/workflows.json` - starter workflow
* `scripts/import.sh` - convenience script to call n8n import endpoints
