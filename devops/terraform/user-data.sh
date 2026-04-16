#!/bin/bash
set -e

# Update system
echo "=== Updating system ==="
yum update -y || apt-get update -y

# Install Docker
echo "=== Installing Docker ==="
if command -v yum &> /dev/null; then
  yum install -y docker
  systemctl start docker
  systemctl enable docker
else
  apt-get install -y docker.io
  systemctl start docker
  systemctl enable docker
fi

# Install kubectl
echo "=== Installing kubectl ==="
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Install Kind
echo "=== Installing Kind ==="
curl -Lo ./kind "https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64"
chmod +x ./kind
mv ./kind /usr/local/bin/kind

# Install Helm
echo "=== Installing Helm ==="
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Login to DockerHub
echo "=== Logging into DockerHub ==="
echo "${dockerhub_password}" | docker login -u "${dockerhub_username}" --password-stdin

# Create Kind cluster with port mappings
echo "=== Creating Kind cluster ==="
cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
      - containerPort: 3000
        hostPort: 3000
        protocol: TCP
      - containerPort: 8092
        hostPort: 8092
        protocol: TCP
      - containerPort: 8093
        hostPort: 8093
        protocol: TCP
      - containerPort: 8094
        hostPort: 8094
        protocol: TCP
      - containerPort: 8095
        hostPort: 8095
        protocol: TCP
      - containerPort: 8096
        hostPort: 8096
        protocol: TCP
      - containerPort: 8097
        hostPort: 8097
        protocol: TCP
EOF

kind create cluster --config kind-config.yaml

# Wait for cluster to be ready
echo "=== Waiting for cluster to be ready ==="
kubectl wait --for=condition=ready node --all --timeout=300s

# Create namespace
kubectl create namespace sroa

# Create Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=${dockerhub_username} \
  --docker-password=${dockerhub_password} \
  --namespace=sroa

# Pull Docker images
echo "=== Pulling Docker images ==="
docker pull ${dockerhub_username}/sroa-frontend:latest
docker pull ${dockerhub_username}/sroa-backend-auth:latest
docker pull ${dockerhub_username}/sroa-backend-user-profile:latest
docker pull ${dockerhub_username}/sroa-backend-weather:latest
docker pull ${dockerhub_username}/sroa-backend-market:latest
docker pull ${dockerhub_username}/sroa-backend-agent:latest
docker pull ${dockerhub_username}/sroa-backend-notification:latest

# Load images into Kind cluster
echo "=== Loading images into Kind cluster ==="
kind load docker-image ${dockerhub_username}/sroa-frontend:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-auth:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-user-profile:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-weather:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-market:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-agent:latest --name kind
kind load docker-image ${dockerhub_username}/sroa-backend-notification:latest --name kind

# Deploy using Docker Compose (simpler than Helm for now)
echo "=== Deploying application with Docker Compose ==="
mkdir -p /opt/sroa
cd /opt/sroa

cat <<'EOF' > docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: sroa
      POSTGRES_PASSWORD: sroa
      POSTGRES_DB: sroa
    ports:
      - "5434:5432"
    network_mode: host

  redis:
    image: redis:7
    ports:
      - "6380:6379"
    network_mode: host

  auth-service:
    image: ${dockerhub_username}/sroa-backend-auth:latest
    ports:
      - "8092:8000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://sroa:sroa@localhost:5434/sroa
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  user-profile-service:
    image: ${dockerhub_username}/sroa-backend-user-profile:latest
    ports:
      - "8093:8000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://sroa:sroa@localhost:5434/sroa
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  weather-service:
    image: ${dockerhub_username}/sroa-backend-weather:latest
    ports:
      - "8094:8000"
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  market-service:
    image: ${dockerhub_username}/sroa-backend-market:latest
    ports:
      - "8095:8000"
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  agent-service:
    image: ${dockerhub_username}/sroa-backend-agent:latest
    ports:
      - "8096:8000"
    environment:
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  notification-service:
    image: ${dockerhub_username}/sroa-backend-notification:latest
    ports:
      - "8097:8000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://sroa:sroa@localhost:5434/sroa
      - REDIS_URL=redis://localhost:6380
    network_mode: host

  frontend:
    image: ${dockerhub_username}/sroa-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - auth-service
      - user-profile-service
      - weather-service
      - market-service
      - agent-service
      - notification-service
    network_mode: host
EOF

# Start services
echo "=== Starting all services ==="
docker compose up -d

# Wait for services to be ready
echo "=== Waiting for services to be ready ==="
sleep 30

echo "=== Deployment complete ==="
echo "Frontend: http://localhost:3000"
echo "Auth Service: http://localhost:8092"
echo "User Profile: http://localhost:8093"
echo "Weather: http://localhost:8094"
echo "Market: http://localhost:8095"
echo "Agent: http://localhost:8096"
echo "Notification: http://localhost:8097"
