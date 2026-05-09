#!/usr/bin/env bash
# Run AFTER PostgreSQL + Redis are installed and the `voxora` DB user exists (see README).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f apps/backend/.env ]]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "Created apps/backend/.env — edit JWT_SECRET before production."
fi
if [[ ! -f apps/frontend/.env.local ]]; then
  cp apps/frontend/.env.example apps/frontend/.env.local
  echo "Created apps/frontend/.env.local — use localhost URLs for local API/WebSocket."
fi

mkdir -p /tmp/voxora-uploads

npm install
npm run prisma:generate
( cd apps/backend && npx prisma db push )
( cd apps/backend && npm run prisma:seed )

echo ""
echo "Bootstrap complete. Start everything (ESL mock + API + web):"
echo "  npm run dev:full"
echo ""
