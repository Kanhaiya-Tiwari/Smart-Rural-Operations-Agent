SROA - Smart Rural Operations Agent
Complete System Architecture Documentation
1. System Overview
SROA is a production-grade, multi-agent AI platform designed to solve real-world agricultural problems in India. It uses autonomous AI agents to understand farmer goals, collect data, make decisions, and provide actionable recommendations.

2. Microservices Breakdown
2.1 agent-service (Port 8001)
Purpose: Orchestrates multi-agent workflows

agent-service/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── planner.py
│   │   ├── data_agent.py
│   │   ├── decision_agent.py
│   │   ├── execution_agent.py
│   │   └── communication_agent.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py
│   │   ├── agent_message.py
│   │   └── decision.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   ├── memory_store.py
│   │   └── feedback_loop.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   └── schemas.py
│   └── utils/
│       ├── logger.py
│       └── exceptions.py
├── tests/
├── Dockerfile
└── requirements.txt
API Endpoints:

POST /api/v1/goals - Submit a new goal
GET /api/v1/goals/{id}/status - Get goal processing status
GET /api/v1/goals/{id}/result - Get final recommendation
POST /api/v1/feedback - Submit feedback on recommendation
2.2 data-service (Port 8002)
Purpose: Fetches and caches external data

data-service/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── connectors/
│   │   ├── weather_api.py
│   │   ├── mandi_prices.py
│   │   ├── gov_schemes.py
│   │   └── soil_health.py
│   ├── models/
│   │   ├── weather.py
│   │   ├── price.py
│   │   └── scheme.py
│   ├── services/
│   │   ├── data_aggregator.py
│   │   └── cache_manager.py
│   ├── api/
│   │   └── routes.py
│   └── utils/
├── Dockerfile
└── requirements.txt
API Endpoints:

GET /api/v1/weather?location={lat,lng}&days={n}
GET /api/v1/prices?crop={name}&mandi={name}
GET /api/v1/schemes?state={state}&category={cat}
GET /api/v1/crop-advisory?crop={name}&season={season}
2.3 decision-service (Port 8003)
Purpose: LLM-powered reasoning and decision making

decision-service/
├── app/
│   ├── main.py
│   ├── llm/
│   │   ├── client.py
│   │   ├── prompts.py
│   │   └── validators.py
│   ├── models/
│   │   └── decision.py
│   ├── services/
│   │   ├── analyzer.py
│   │   └── hallucination_guard.py
│   ├── api/
│   │   └── routes.py
├── Dockerfile
└── requirements.txt
API Endpoints:

POST /api/v1/analyze - Analyze data and make decision
POST /api/v1/validate - Validate a previous decision
2.4 notification-service (Port 8004)
notification-service/
├── app/
│   ├── main.py
│   ├── channels/
│   │   ├── sms.py
│   │   ├── push.py
│   │   └── whatsapp.py
│   ├── models/
│   │   └── notification.py
│   ├── services/
│   │   ├── dispatcher.py
│   │   └── scheduler.py
│   ├── api/
│   │   └── routes.py
├── Dockerfile
└── requirements.txt
2.5 auth-service (Port 8005)
auth-service/
├── app/
│   ├── main.py
│   ├── models/
│   │   └── user.py
│   ├── services/
│   │   ├── auth.py
│   │   └── token.py
│   ├── api/
│   │   └── routes.py
├── Dockerfile
└── requirements.txt
API Endpoints:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET /api/v1/auth/me
3. Agent Communication Flow
User Goal: "Help me sell wheat at best price"

1. Communication Agent → Receives user input
2. Planner Agent → Breaks into sub-tasks:
   - Task 1: Fetch current wheat prices from top 5 mandis
   - Task 2: Check 3-day weather forecast
   - Task 3: Analyze price trend (7-day)
   - Task 4: Check transport costs
3. Data Agent → Executes Tasks 1-4 in parallel
4. Decision Agent → Analyzes all data:
   - Compares prices across mandis
   - Factors in weather (rain = quality risk)
   - Considers price trends
   - Outputs: "Sell at Azadpur Mandi in 2 days, price ₹2,650/q"
5. Execution Agent → Creates action plan + stores decision
6. Communication Agent → Formats and delivers to user
Structured Agent Message Format:
{
  "message_id": "uuid",
  "from_agent": "planner",
  "to_agent": "data",
  "type": "task_request",
  "payload": {
    "task_type": "fetch_prices",
    "params": { "crop": "wheat", "region": "NCR" }
  },
  "priority": "high",
  "timestamp": "2026-03-26T10:00:00Z",
  "trace_id": "goal-uuid"
}
4. Sample AI Prompts
Planner Agent Prompt:
You are a Task Planner for Indian agriculture. Given a farmer's goal, 
decompose it into specific, actionable sub-tasks.

Rules:
- Each task must have: type, description, required_data, priority
- Tasks should be parallelizable where possible
- Always include a data validation step
- Output JSON array of tasks

Goal: "{user_goal}"
Context: Farmer in {location}, growing {crops}, land: {acres} acres
Decision Agent Prompt:
You are an Agricultural Decision Advisor. Analyze the following data 
and provide a clear recommendation.

Data: {aggregated_data}
Goal: {original_goal}

Rules:
- Cite specific numbers (prices, dates, percentages)
- Explain your reasoning step-by-step
- Provide confidence score (0-100)
- List risks and mitigations
- Give a clear "Do This" action item

IMPORTANT: Only recommend based on provided data. 
If data is insufficient, say so and suggest what additional 
information is needed.
Hallucination Reduction Strategy:
Grounded responses: Only reference data from Data Agent
Validation layer: Cross-check prices against known ranges
Confidence scoring: Low confidence = request more data
Source attribution: Every claim linked to data source
5. DevOps Configuration
Dockerfile (agent-service example):
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
Docker Compose (Local Development):
version: "3.9"
services:
  agent-service:
    build: ./agent-service
    ports: ["8001:8001"]
    env_file: .env
    depends_on: [postgres, redis, kafka]

  data-service:
    build: ./data-service
    ports: ["8002:8002"]
    env_file: .env
    depends_on: [postgres, redis]

  decision-service:
    build: ./decision-service
    ports: ["8003:8003"]
    env_file: .env
    depends_on: [redis]

  notification-service:
    build: ./notification-service
    ports: ["8004:8004"]
    env_file: .env
    depends_on: [postgres, kafka]

  auth-service:
    build: ./auth-service
    ports: ["8005:8005"]
    env_file: .env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: sroa
      POSTGRES_USER: sroa_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: bitnami/kafka:latest
    environment:
      KAFKA_CFG_NODE_ID: 1
      KAFKA_CFG_PROCESS_ROLES: broker,controller
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
    ports: ["9092:9092"]

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf]
    depends_on: [agent-service, data-service, auth-service]

volumes:
  pgdata:
Kubernetes Deployment (agent-service):
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-service
  namespace: sroa
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-service
  template:
    metadata:
      labels:
        app: agent-service
    spec:
      containers:
        - name: agent-service
          image: registry/sroa-agent-service:latest
          ports:
            - containerPort: 8001
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8001
            initialDelaySeconds: 10
            periodSeconds: 30
          envFrom:
            - configMapRef:
                name: sroa-config
            - secretRef:
                name: sroa-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: agent-service
  namespace: sroa
spec:
  selector:
    app: agent-service
  ports:
    - port: 80
      targetPort: 8001
  type: ClusterIP
Kubernetes ConfigMap & Secrets:
apiVersion: v1
kind: ConfigMap
metadata:
  name: sroa-config
  namespace: sroa
data:
  ENVIRONMENT: production
  REDIS_HOST: redis-service
  KAFKA_BROKER: kafka-service:9092
  DB_HOST: postgres-service
---
apiVersion: v1
kind: Secret
metadata:
  name: sroa-secrets
  namespace: sroa
type: Opaque
data:
  DB_PASSWORD: <base64>
  GEMINI_API_KEY: <base64>
  JWT_SECRET: <base64>
GitHub Actions CI/CD:
name: SROA CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [agent-service, data-service, decision-service, notification-service, auth-service]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: |
          cd ${{ matrix.service }}
          pip install -r requirements.txt
          pytest tests/ -v --cov=app

  build-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [agent-service, data-service, decision-service, notification-service, auth-service]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/sroa-${{ matrix.service }}:latest
            ${{ secrets.DOCKER_USERNAME }}/sroa-${{ matrix.service }}:${{ github.sha }}

  deploy:
    needs: build-push
    runs-on: ubuntu-latest
    steps:
      - run: echo "ArgoCD auto-syncs from Git — deployment is automatic"
ArgoCD Application:
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: sroa
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/sroa-k8s-manifests
    targetRevision: main
    path: k8s/
  destination:
    server: https://kubernetes.default.svc
    namespace: sroa
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
Prometheus ServiceMonitor:
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sroa-services
  namespace: sroa
spec:
  selector:
    matchLabels:
      monitoring: enabled
  endpoints:
    - port: metrics
      interval: 15s
      path: /metrics
6. Advanced Features
Agent Memory
Each decision stored in PostgreSQL with full reasoning chain
Past decisions used as context for future recommendations
Memory decay: recent decisions weighted higher
Feedback Loop
User rates recommendations (thumbs up/down)
Feedback stored and used to improve prompts
Low-rated patterns trigger prompt refinement
Retry & Failure Handling
Exponential backoff for API failures
Circuit breaker pattern for external services
Dead letter queue for failed messages
Graceful degradation: cached data when APIs down
Async Task Queues
Kafka topics per agent type
Priority queues for urgent tasks (weather alerts)
Task deduplication by trace_id
7. Security
JWT with RS256 signing (access + refresh tokens)
API rate limiting: 100 req/min per user
Input validation with Pydantic schemas
Secrets in K8s Secrets / Vault
CORS configured per environment
SQL injection prevention via SQLAlchemy ORM
Request logging (no PII in logs)
8. Monitoring Dashboard (Grafana)
Key metrics:

Agent response latency (P50, P95, P99)
Goal completion rate
LLM token usage per goal
API error rates by service
Active users / goals per hour
Cache hit rate (Redis)
Kafka consumer lag
