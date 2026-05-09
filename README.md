
# Voxora — Cloud SIP Voice Broadcasting Platform

> Enterprise-grade outbound SIP voice broadcasting. Direct SIP protocol. No telecom APIs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

Voxora is a multi-tenant SaaS platform for outbound voice broadcasting. Bring your own SIP provider; campaigns, contacts, analytics, and realtime monitoring run in this stack.

### Key Features

- **Direct SIP** — FreeSWITCH + Kamailio, any SIP provider
- **AMD** — Answering Machine Detection (human vs voicemail)
- **Realtime** — Socket.io live dashboard, live call monitoring
- **Multi-tenant** — Organization-scoped accounts
- **Campaign Engine** — BullMQ queues, concurrent call control, CPS limiter
- **Analytics** — Call outcomes, RTP quality (MOS), timeline charts
- **Billing** — Stripe subscription management

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Nginx Proxy                             │
│                    (SSL termination + routing)                   │
└────────────┬──────────────────────────────┬────────────────────┘
             │                              │
    ┌────────▼──────────┐        ┌─────────▼──────────┐
    │   Next.js 14      │        │   NestJS 10 API     │
    │   Frontend        │        │   + Socket.io       │
    │   (TypeScript)    │        │   (TypeScript)      │
    └───────────────────┘        └─────────┬──────────┘
                                           │
               ┌───────────────────────────┼───────────────────────┐
               │                           │                       │
    ┌──────────▼──────┐       ┌────────────▼──────┐   ┌──────────▼──────┐
    │   PostgreSQL 16  │       │   Redis 7          │   │   BullMQ        │
    │   (Prisma ORM)   │       │   (cache + pub/sub)│   │   (job queues)  │
    └──────────────────┘       └────────────────────┘   └─────────────────┘

                    Telephony Stack
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │  ┌────────────┐   ┌──────────────┐   ┌───────────┐ │
    │  │ FreeSWITCH │   │   Kamailio   │   │ RTPengine │ │
    │  │  (ESL API) │   │ (SIP proxy)  │   │ (RTP relay│ │
    │  └────────────┘   └──────────────┘   └───────────┘ │
    │                                                     │
    │  ┌────────────────────────────────────────────────┐ │
    │  │           Coturn (STUN/TURN)                   │ │
    │  └────────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, Recharts |
| Backend | NestJS 10, TypeScript, PostgreSQL, Prisma ORM |
| Realtime | Socket.io, Redis Pub/Sub |
| Queue | BullMQ (Redis-backed) |
| Telephony | FreeSWITCH, Kamailio, RTPengine, Coturn |
| Infrastructure | Docker, Docker Compose, Nginx |

---

## Project Structure

```
voxora/
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # JWT auth, refresh tokens, email verification
│   │   │   │   ├── users/          # User profile management
│   │   │   │   ├── sip-accounts/   # SIP provider management
│   │   │   │   ├── contacts/       # CSV import, contact lists
│   │   │   │   ├── audio-files/    # MP3/WAV upload & management
│   │   │   │   ├── campaigns/      # Campaign CRUD + BullMQ processor
│   │   │   │   ├── live-monitor/   # Real-time stats API
│   │   │   │   ├── recordings/     # Call recording archive
│   │   │   │   ├── analytics/      # Dashboard + performance data
│   │   │   │   └── billing/        # Stripe subscriptions
│   │   │   ├── services/
│   │   │   │   └── sip/            # FreeSWITCH ESL client
│   │   │   ├── gateways/           # Socket.io WebSocket gateway
│   │   │   └── prisma/             # Database client
│   │   └── prisma/
│   │       └── schema.prisma       # Database schema
│   │
│   └── frontend/                   # Next.js 14 app
│       └── src/
│           ├── app/
│           │   ├── (auth)/         # Login, signup, forgot password
│           │   └── (dashboard)/    # All dashboard pages
│           ├── components/         # Reusable UI components
│           ├── hooks/              # Custom hooks (useLiveStats)
│           ├── lib/                # API client, utilities
│           └── store/              # Zustand state management
│
├── infra/
│   ├── freeswitch/                 # FreeSWITCH config + Lua scripts
│   ├── kamailio/                   # Kamailio SIP proxy config
│   ├── rtpengine/                  # RTPengine config
│   ├── coturn/                     # STUN/TURN server config
│   └── nginx/                      # Reverse proxy config
│
├── packages/
│   └── shared/                     # Shared TypeScript types
│
├── docker-compose.yml              # Production stack
├── docker-compose.dev.yml          # Development overrides
└── .env.example                    # Environment template
```

---

## Setup on Ubuntu (native — recommended for day-to-day dev)

These steps target **Ubuntu 22.04 / 24.04 LTS**. You run PostgreSQL and Redis on the host, Node.js for the API and UI, and the included **ESL mock** so the backend can connect to a dialer command channel without installing full telephony binaries.

### 1. System packages

```bash
sudo apt update
sudo apt install -y curl git build-essential postgresql postgresql-contrib redis-server
```

### 2. Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should be v20+
```

### 3. PostgreSQL database and user

```bash
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
CREATE USER voxora WITH PASSWORD 'voxora_pass';
CREATE DATABASE voxora_db OWNER voxora;
GRANT ALL PRIVILEGES ON DATABASE voxora_db TO voxora;
\c voxora_db
GRANT ALL ON SCHEMA public TO voxora;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO voxora;
SQL
```

Adjust the password in both PostgreSQL and `apps/backend/.env` if you change `voxora_pass`.

If `CREATE USER` or `CREATE DATABASE` fails because they already exist, keep your existing cluster and only ensure `GRANT ALL ON SCHEMA public TO voxora;` was applied inside `voxora_db`.

### 4. Redis

The default Ubuntu Redis package listens on `127.0.0.1:6379` with **no password**, which matches `apps/backend/.env.example` (`REDIS_PASSWORD` empty).

```bash
sudo systemctl enable --now redis-server
redis-cli ping   # PONG
```

### 5. Clone and install JS dependencies

```bash
git clone <your-repo-url> voxora
cd voxora
npm install
```

### 6. Environment files

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/backend/.env` and set **`JWT_SECRET`** and **`JWT_REFRESH_SECRET`** to long random strings (32+ characters).

**Important:** `apps/frontend/.env.local` must use **`http://localhost:3001`** for **`NEXT_PUBLIC_API_URL`** and **`NEXT_PUBLIC_WS_URL`** when the API runs locally. If these point at an old tunnel URL, the UI on `http://localhost:3000` will load but login and data will fail.

### 7. Database schema and demo user

From the repo root:

```bash
chmod +x scripts/ubuntu-bootstrap.sh   # once
npm run bootstrap:ubuntu
```

Or manually:

```bash
npm run prisma:generate
cd apps/backend && npx prisma db push && npm run prisma:seed && cd ../..
```

`prisma db push` syncs the schema without requiring Prisma’s shadow database (which needs `CREATEDB` on some Postgres installs). For production, prefer versioned migrations (`prisma migrate deploy`) once you maintain a migration history.

### 8. Run the stack

**Option A — one terminal (ESL mock + API + Next.js):**

```bash
npm run dev:full
```

**Option B — separate terminals:**

```bash
npm run dev:esl          # Terminal 1 — ESL mock on port 8021
npm run dev:backend      # Terminal 2 — NestJS on port 3001
npm run dev:frontend     # Terminal 3 — Next.js on port 3000
```

The frontend dev server listens on **`0.0.0.0:3000`** so SSH port forwarding and remote IDEs can expose it reliably.

### 9. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health | http://localhost:3001/health |
| Swagger | http://localhost:3001/api/docs |

**Demo login:** `demo@voxora.io` / `demo123456` (created by `prisma/seed.ts`).

---

## Quick Start with Docker Compose

### Prerequisites

- Docker Engine + Docker Compose v2

### 1. Configure

```bash
cp .env.example .env
# Point DATABASE_URL / REDIS_* at compose service names when running everything in Docker
```

### 2. Start services

```bash
docker compose up -d
# Optional: docker-compose.dev.yml for lighter dev stacks
```

### 3. Migrations and seed

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

### 4. URLs

Same table as above (`localhost:3000` / `3001` depending on published ports).

---

## Local development (reference)

```bash
npm install
npm run prisma:generate
cd apps/backend && npx prisma db push && cd ../..

# API + web (run ESL mock separately if you need dial simulation):
npm run dev

# ESL mock + API + web together:
npm run dev:full
```

---

## Configuration

### Required Environment Variables

```bash
# Core
JWT_SECRET=<32+ char random string>
DATABASE_URL=postgresql://voxora:pass@localhost:5432/voxora_db

# FreeSWITCH ESL (for telephony)
FREESWITCH_HOST=localhost
FREESWITCH_ESL_PORT=8021
FREESWITCH_ESL_PASSWORD=ClueCon

# Stripe (for billing, optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See **`.env.example`** (compose-oriented) and **`apps/backend/.env.example`** / **`apps/frontend/.env.example`** for native Ubuntu development.

---

## Campaign Flow

```
1. User adds SIP account → FreeSWITCH gateway registration
2. User uploads contacts (CSV) → Phone validation + deduplication
3. User uploads audio (MP3/WAV) → Stored + duration analysis
4. User creates campaign → Links SIP + contacts + audio
5. User starts campaign → BullMQ job queued
6. Campaign processor → Dials contacts via FreeSWITCH ESL
7. AMD detection → Human/machine/voicemail decision
8. Audio playback → Full call recording
9. Realtime updates → Socket.io events to dashboard
10. Campaign complete → Analytics stored
```

---

## API Documentation

Interactive Swagger UI: `http://localhost:3001/api/docs`

### Key Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/sip-accounts
POST   /api/sip-accounts
POST   /api/sip-accounts/:id/test

GET    /api/contacts/lists
POST   /api/contacts/lists/:id/import

GET    /api/audio-files
POST   /api/audio-files/upload

GET    /api/campaigns
POST   /api/campaigns
POST   /api/campaigns/:id/start
POST   /api/campaigns/:id/pause
POST   /api/campaigns/:id/stop

GET    /api/analytics/dashboard
GET    /api/live-monitor/stats

GET    /api/billing/plans
POST   /api/billing/checkout
```

---

## WebSocket Events

Connect to `ws://localhost:3001` with JWT auth token.

```javascript
// Subscribe to live monitor
socket.emit('join:live-monitor')
socket.on('call:answered', (data) => { ... })
socket.on('call:hangup', (data) => { ... })
socket.on('stats:update', (data) => { ... })

// Subscribe to specific campaign
socket.emit('join:campaign', { campaignId: 'xxx' })
socket.on('campaign:completed', (data) => { ... })
```

---

## Billing Plans

| Plan | Concurrent | Monthly |
|------|-----------|---------|
| Trial | 2 | Free (3-day trial in product UI) |
| Starter | 10 | $49 |
| Growth | 50 | $149 |
| Pro | 200 | $399 |
| Enterprise | 1,000+ | Custom |

---

## Production Deployment

1. **Set all environment variables** in `.env`
2. **Configure SSL certificates** in `infra/nginx/ssl/`
3. **Update domain** in `infra/nginx/conf.d/voxora.conf`
4. **Set FreeSWITCH external IP** for NAT traversal
5. **Configure Coturn** with your public IP
6. **Point DNS** to your server IP

```bash
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

---

## Troubleshooting

### Frontend loads but login or data fails

- Confirm **`NEXT_PUBLIC_API_URL`** and **`NEXT_PUBLIC_WS_URL`** in **`apps/frontend/.env.local`** are **`http://localhost:3001`** when developing locally.
- Restart **`npm run dev:frontend`** after changing env files.

### `localhost:3000` refused in browser

- Ensure **`npm run dev:frontend`** or **`npm run dev:full`** is running.
- On a **remote VM / SSH**, open the forwarded URL from your editor’s **Ports** panel; your laptop’s `localhost` is not the server’s unless ports are forwarded.

### Backend cannot connect to ESL / FreeSWITCH

- Run **`npm run dev:esl`** or **`npm run dev:full`** so **`infra/esl-mock/server.js`** listens on **`8021`** with password **`ClueCon`** (defaults in `.env.example`).
- Check **`GET http://localhost:3001/health`** — `freeswitch` should report **`connected`** when the mock is up.

### Prisma migrate dev fails on “shadow database”

- Use **`npx prisma db push`** inside **`apps/backend`** for local iteration (see Ubuntu steps), or grant the Postgres user **`CREATEDB`** for shadow DB creation.

### PostgreSQL connection refused

- **`sudo systemctl start postgresql`**
- Verify **`DATABASE_URL`** user, password, database name, and port **`5432`**.

---

## License

MIT © Voxora
