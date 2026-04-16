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

# Login to DockerHub
echo "=== Logging into DockerHub ==="
echo "${dockerhub_password}" | docker login -u "${dockerhub_username}" --password-stdin

# Create Kind cluster
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

echo "=== Kind cluster setup complete ==="
