# SROA DevOps Guide

This directory contains production-style DevOps scaffolding for Smart Rural Operations Agent.

## Structure

- `docker/`: Dockerfiles for frontend and backend runtime images.
- `nginx/`: Reverse proxy and static frontend routing configuration.
- `docker-compose.yml`: Local orchestration for frontend, backend, and PostgreSQL.
- `k8s/`: Kubernetes manifests (Deployments, Services, secret template).
- `helm/sroa/`: Helm chart for templated Kubernetes deployment of frontend and six backend microservices.
- `terraform/`: Infrastructure provisioning on AWS (VPC, subnet, SG, EC2).
- `ansible/`: Host provisioning playbook and inventory example.

## 1. Local Run (Docker Compose)

From repository root:

```bash
docker compose -f devops/docker-compose.yml up -d --build
```

Check:

```bash
docker compose -f devops/docker-compose.yml ps
curl -f http://localhost:5173 || true
curl -f http://localhost:8000/health || true
```

Stop:

```bash
docker compose -f devops/docker-compose.yml down
```

## 2. Kubernetes Run (Raw Manifests)

```bash
kubectl create namespace sroa || true
kubectl apply -f devops/k8s/backend-secret.example.yaml -n sroa
kubectl apply -f devops/k8s/backend-deployment.yaml -n sroa
kubectl apply -f devops/k8s/backend-service.yaml -n sroa
kubectl apply -f devops/k8s/frontend-deployment.yaml -n sroa
kubectl apply -f devops/k8s/frontend-service.yaml -n sroa
kubectl get all -n sroa
```

## 3. Kubernetes Run (Helm)

```bash
helm upgrade --install sroa devops/helm/sroa -n sroa --create-namespace
helm status sroa -n sroa
```

## 4. Terraform Provisioning (AWS)

The Terraform configuration now targets the AWS default VPC and provisions:
- an Application Load Balancer
- 2 EC2 instances in an Auto Scaling Group
- `t3.large` EC2 instances by default for better capacity
- security group rules for SSH, HTTP, HTTPS, and app traffic

1) Copy vars:

```bash
cp devops/terraform/terraform.tfvars.example devops/terraform/terraform.tfvars
```

2) Update these fields in `terraform.tfvars`:
- `ami_id`
- `key_name`
- `ssh_cidr`

3) Run:

```bash
cd devops/terraform
terraform init
terraform plan
terraform apply
```

Outputs include the load balancer DNS name and the EC2 instance details.

## 5. Ansible Host Provisioning and Kind cluster

1) Copy and edit inventory:

```bash
cp devops/ansible/inventory.ini.example devops/ansible/inventory.ini
```

2) Run the Kind provisioning playbook:

```bash
ansible-playbook -i devops/ansible/inventory.ini devops/ansible/playbook-kind.yml
```

This playbook installs:
- Docker
- kind
- kubectl
- Helm
- MetalLB for LoadBalancer support inside kind
- Prometheus + Grafana via Helm

## 6. GitHub Actions

Configured workflows:
- `.github/workflows/ci.yml`: lint, test, build.
- `.github/workflows/docker-build-push.yml`: build and push frontend/backend images on tags.
- `.github/workflows/deploy-k8s.yml`: manual Helm deployment to cluster.

Required repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `KUBECONFIG` (base64 encoded)
- `FRONTEND_IMAGE_REPO`
- `BACKEND_IMAGE_REPO`
- `IMAGE_TAG`

## Notes

- Replace example image repositories before production deployment.
- Keep sensitive values out of git; use secrets managers or CI secret store.
- Use managed PostgreSQL in production instead of local container DB.
