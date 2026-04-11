# SROA - Smart Rural Operations Agent

SROA is a full-stack agriculture assistant platform with:

1. React + Vite frontend
2. FastAPI microservices backend
3. Live weather and mandi integrations
4. Auth, profile, alerts, and AI recommendation workflow

The goal is to provide practical, real-time guidance for farmers using profile-aware weather, market, and alert data.

## Core Features

1. User registration and login
2. Editable farmer profile (location, crops, language, notification preferences, privacy)
3. Live weather data (OpenWeather primary, Open-Meteo fallback)
4. Live mandi price data (Government of India Open Data / AGMARKNET)
5. AI recommendation and risk insight based on weather + market
6. In-app notification alerts with backend evaluation logic
7. Animated mobile-first dashboard UI

## Project Structure

Top-level:

1. `src/` - frontend app (React + TypeScript)
2. `backend/` - microservices, infra, db schema, compose, k8s, monitoring
3. `supabase/functions/sroa-chat/` - edge chat function

Backend services:

1. `backend/auth-service` - register/login + JWT
2. `backend/user-profile-service` - profile CRUD + preferences
3. `backend/weather-service` - weather API aggregation + cache
4. `backend/market-service` - mandi API aggregation + cache
5. `backend/agent-service` - recommendation and crop insight logic
6. `backend/notification-service` - alert evaluation + alert feed

## Tech Stack

Frontend:

1. React 18
2. Vite 5
3. TypeScript
4. Tailwind CSS
5. Framer Motion
6. TanStack Query

Backend:

1. Python 3.11
2. FastAPI
3. PostgreSQL
4. Redis
5. Kafka (infra present)

Infra and Ops:

1. Docker Compose
2. Kubernetes manifests (`backend/k8s`)
3. Prometheus + Grafana config
4. GitHub Actions workflow for backend

## Prerequisites

Install these before running:

1. Node.js 18+
2. npm
3. Docker Desktop (or Docker Engine + Compose)

Optional:

1. Supabase CLI (only needed to deploy edge function changes)

## Environment Setup

Backend services use `backend/.env`.

Minimum required keys for live data:

1. `OPENWEATHER_API_KEY`
2. `AGMARKNET_API_KEY`

You can copy from example:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` values.

Important:

1. `backend/.env` is local and should not be committed
2. Invalid weather key returns provider 401/404 and breaks weather section

## Run Locally

### 1) Start backend microservices

```bash
docker compose -f backend/docker-compose.yml up -d --build
```

### 2) Start frontend

```bash
npm --prefix . run dev
```

If your shell is not in project root, use full path form:

```bash
npm --prefix /Users/kanha/SRROA/Smart-Rural-Operations-Agent run dev
```

### 3) Open app

Vite may choose 5173/5174/5175 depending on free ports. Use the URL printed in terminal.

## Default Service Ports

Frontend:

1. `5173` to `5175` (Vite auto fallback)

Backend APIs:

1. `8001` auth-service
2. `8002` user-profile-service
3. `8003` weather-service
4. `8004` market-service
5. `8005` agent-service
6. `8006` notification-service

Data + infra:

1. `5433` postgres
2. `6380` redis
3. `29092` kafka

Monitoring:

1. Prometheus and Grafana containers run internally in compose

## Expected User Flow

1. Register a new user
2. Login
3. Open Profile and set:
	1. valid location
	2. crops
4. Save profile
5. Go to Home dashboard
6. Verify:
	1. weather card is live
	2. mandi card is live
	3. AI recommendation appears
	4. alerts update

If profile location/crop is empty, live dashboard data cannot be computed.

## Date and Time Behavior

1. Home page shows full day/date/year (India locale format)
2. Date updates automatically over time in UI
3. Chat path injects current India date/time context to reduce stale-date AI responses

## Live Data Reliability Notes

Weather:

1. Primary source: OpenWeather
2. Fallback source: Open-Meteo geocoding/weather for difficult city strings

Mandi:

1. Source: AGMARKNET via Government Open Data API
2. Matching includes fallback logic when exact district+commodity pair is unavailable

## Useful Commands

Build frontend:

```bash
npm run build
```

View backend service status:

```bash
docker compose -f backend/docker-compose.yml ps
```

View backend logs:

```bash
docker compose -f backend/docker-compose.yml logs --tail=100 weather-service
```

Restart one service:

```bash
docker compose -f backend/docker-compose.yml up -d --build weather-service
```

Stop backend:

```bash
docker compose -f backend/docker-compose.yml down
```

## Troubleshooting

### Login button does nothing

1. Ensure auth-service is running on `8001`
2. Hard refresh browser
3. Clear site local storage if stale auth state exists

### Weather shows city not found

1. Check `OPENWEATHER_API_KEY` is valid
2. Restart weather service after env changes
3. Use realistic location strings (city, city+state)

### Home shows "Analyzing weather and market data..."

1. Confirm profile has location and crop
2. Check weather and market APIs are returning 200
3. Inspect notification/agent service logs if weather+market are healthy

### Mandi not found for some crop/location

1. Some exact combinations may not have same-day records
2. Service uses best available live match fallback, but can still fail for sparse inputs

## Supabase Chat Function Note

Code is in:

1. `supabase/functions/sroa-chat/index.ts`

If you edit it, you must deploy it with Supabase CLI for remote effect.

## License

MIT

## DevOps Production Scaffold

A production-oriented DevOps scaffold is available in `devops/`.

Included components:

1. Docker runtime files for frontend/backend (`devops/docker`)
2. Local full-stack compose (`devops/docker-compose.yml`)
3. Kubernetes raw manifests (`devops/k8s`)
4. Helm chart (`devops/helm/sroa`)
5. Terraform AWS modules (`devops/terraform`)
6. Ansible provisioning playbook (`devops/ansible/playbook.yml`)
7. GitHub Actions CI/CD workflows (`.github/workflows`)

Quick start for DevOps stack:

```bash
docker compose -f devops/docker-compose.yml up -d --build
```

For complete infra and deployment steps, see `devops/README.md`.
