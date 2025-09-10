#!/bin/bash
set -euo pipefail

N8N_URL="${N8N_URL:-http://localhost:5678}"
echo "Waiting for n8n to be ready at $N8N_URL ..."
# simple wait loop (no auth) - adjust if using basic auth
for i in {1..30}; do
  if curl -sSf "$N8N_URL" > /dev/null; then
    echo "n8n is up"
    break
  fi
  sleep 2
done

echo "Importing credentials..."
curl -s -X POST "$N8N_URL/rest/credentials/import" \
  -H "Content-Type: application/json" \
  --data-binary @init-data/credentials.json || true

echo "Importing workflows..."
curl -s -X POST "$N8N_URL/rest/workflows/import" \
  -H "Content-Type: application/json" \
  --data-binary @init-data/workflows.json || true

echo "Done. Visit $N8N_URL to complete OAuth authorization for Salesforce (click Connect on the credential)."
