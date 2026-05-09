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
3. `backend/agent-service/app/chat.py` - local LangChain + Ollama chat endpoint

Backend services:

1. `backend/auth-service` - register/login + JWT
2. `backend/user-profile-service` - profile CRUD + preferences
3. `backend/weather-service` - weather API aggregation + cache
4. `backend/market-service` - mandi API aggregation + cache
5. `backend/agent-service` - recommendation, crop insight, and chat logic (Ollama)
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
6. LangChain + Ollama (Local AI)

Infra and Ops:

1. Docker Compose (includes Ollama)
2. Kubernetes manifests (`backend/k8s`)
3. Prometheus + Grafana config
4. GitHub Actions workflow for backend

## Prerequisites

Install these before running:

1. Node.js 18+
2. npm
3. Docker Desktop (or Docker Engine + Compose)

## Environment Setup

Backend services use `backend/.env`.

Minimum required keys for live data:

1. `OPENWEATHER_API_KEY`
2. `AGMARKNET_API_KEY`
3. `OLLAMA_BASE_URL` (defaults to http://ollama:11434)

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

1. `8092` auth-service
2. `8093` user-profile-service
3. `8094` weather-service
4. `8095` market-service
5. `8096` agent-service
6. `8097` notification-service

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

## License

MIT

## DevOps Production Scaffold

The `devops/` directory is now aligned with the actual application architecture.

Included components:

1. Docker runtime files for frontend and frontend Dockerfile (`devops/docker/frontend.Dockerfile`)
2. Full backend microservices in `backend/<service>/Dockerfile`
3. Local compose orchestrator for full stack (`devops/docker-compose.yml`)
4. Kubernetes raw manifests (`devops/k8s`)
5. Helm chart (`devops/helm/sroa`)
6. AWS provisioning via Terraform (`devops/terraform`)
7. Ansible host provisioning and Kind cluster setup (`devops/ansible`)
8. GitHub Actions DevSecOps workflows (`.github/workflows`)

### What changed

- `devops/docker-compose.yml` now builds the six backend services plus frontend and local infra (Postgres, Redis, Kafka, Zookeeper).
- Terraform now targets the AWS default VPC and includes an autoscaling group with two EC2 instances and an application load balancer.
- `devops/ansible/playbook-kind.yml` installs Docker, kind, kubectl, Helm, MetalLB, Prometheus, and Grafana on a host in the `kind` inventory group.
- The CI/CD pipeline now builds and scans all backend service images, not only a legacy single backend image.

### Local dev with Docker Compose

From repository root:

```bash
docker compose -f devops/docker-compose.yml up -d --build
```

Then verify:

```bash
curl -f http://localhost:3000 || true
curl -f http://localhost:8092/health || true
```

### AWS / Terraform setup

1. Copy variables:

```bash
cp devops/terraform/terraform.tfvars.example devops/terraform/terraform.tfvars
```

2. Set values in `devops/terraform/terraform.tfvars`:
- `ami_id` (Ubuntu 22.04 or Amazon Linux 2023 recommended)
- `key_name`
- `ssh_cidr`

3. Run:

```bash
cd devops/terraform
terraform init
terraform plan
terraform apply
```

4. Use the Terraform outputs to connect to the EC2 instances and run Ansible.

### Kind cluster and monitoring

Use `devops/ansible/playbook-kind.yml` against the `kind` host group in `devops/ansible/inventory.ini.example`.

The playbook installs:
- Docker
- kind
- kubectl
- Helm
- MetalLB
- Prometheus + Grafana via Helm

### GitHub Actions DevSecOps pipeline

The main pipeline is in `.github/workflows/ci.yml`.
It now runs:
- ESLint and frontend tests
- Bandit security scan on backend Python code
- Hadolint Dockerfile validation for all service Dockerfiles
- Docker image build for frontend and all backend microservices
- Trivy vulnerability scan for all built images
- Kubernetes deploy via Helm
- Gmail notification after deployment

### Important notes

- The current application is a microservices stack. The frontend expects multiple backend services to be available on their mapped ports.
- For a production-grade Kubernetes deployment, the frontend and backend services should be exposed through a gateway or ingress controller rather than browser port-based service URLs.
- `devops/docker/backend.Dockerfile` is now a legacy placeholder; backend builds use the service-specific Dockerfiles under `backend/`.

## GitHub Actions security and deployment pipeline

This repository now has a single orchestrator workflow at `.github/workflows/ci.yml` that calls reusable jobs for:
- frontend linting and tests
- Python Bandit code security scanning
- Dockerfile scanning with Hadolint
- Docker image building
- Docker image vulnerability scanning with Trivy
- OWASP ZAP dynamic application security testing (DAST)
- Kubernetes deployment via Helm
- Gmail notification after deployment

### Required repository secrets

Add these secrets in GitHub Settings > Secrets and variables > Actions:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `FRONTEND_IMAGE_REPO` (example: `myorg/sroa-frontend`)
- `BACKEND_IMAGE_REPO` (example: `myorg/sroa-backend`)
- `KUBECONFIG` (base64-encoded kubeconfig for deployment cluster)
- `GMAIL_SMTP_USERNAME` (for example `knhapndt1@gmail.com`)
- `GMAIL_SMTP_PASSWORD` (Gmail app password or SMTP password)

### How to trigger the workflow

The workflow runs automatically on `push` and `pull_request` to `main`/`master`.
It can also be started manually from the Actions tab using `workflow_dispatch`.

When manually dispatching, set:
- `target_url` for OWASP ZAP DAST scanning
- `image_tag` for Docker images and deployment tags

### Notes for perfect setup

1. Use a Gmail app password for `GMAIL_SMTP_PASSWORD`.
2. Keep `backend/.env` secret. Do not commit it.
3. Verify Dockerfiles at `devops/docker/frontend.Dockerfile` and `devops/docker/backend.Dockerfile` before scanning.
4. Confirm the Kubernetes Helm values in `devops/helm/sroa/values.yaml` match your cluster and image repo.
5. If you only need local validation, `target_url` can point to a publicly accessible staging URL.
6. The pipeline fails if Trivy finds any `CRITICAL` or `HIGH` vulnerabilities.
