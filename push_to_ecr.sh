#!/bin/bash

# Configuration
set -e # Exit immediately if a command exits with a non-zero status
AWS_ACCOUNT_ID="815210276744"
AWS_REGION="eu-west-1"
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
PROJECT_NAME="sroa"

# Authenticate with ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}

# List of services and their build contexts
# Format: "service_name:context"
SERVICES=(
    "frontend:."
    "auth-service:./backend/auth-service"
    "user-profile-service:./backend/user-profile-service"
    "weather-service:./backend/weather-service"
    "market-service:./backend/market-service"
    "agent-service:./backend/agent-service"
    "notification-service:./backend/notification-service"
)

# Process each service
for ITEM in "${SERVICES[@]}"; do
    SERVICE=$(echo "$ITEM" | cut -d: -f1)
    CONTEXT=$(echo "$ITEM" | cut -d: -f2)
    
    REPO_NAME="${PROJECT_NAME}-${SERVICE}"
    
    echo "----------------------------------------------------"
    echo "Processing Service: ${SERVICE}"
    echo "----------------------------------------------------"

    # Create repository if it doesn't exist
    if ! aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" > /dev/null 2>&1; then
        echo "Creating ECR repository: ${REPO_NAME}"
        aws ecr create-repository --repository-name "${REPO_NAME}" --region "${AWS_REGION}"
    else
        echo "Repository ${REPO_NAME} already exists."
    fi

    # Build the Docker image for the correct platform (EKS nodes are x86_64)
    echo "Building image for ${SERVICE} (linux/amd64)..."
    docker build --platform linux/amd64 -t "${REPO_NAME}" "${CONTEXT}"

    # Tag the image for ECR
    echo "Tagging image..."
    docker tag "${REPO_NAME}:latest" "${ECR_URL}/${REPO_NAME}:latest"

    # Push to ECR
    echo "Pushing to ECR..."
    docker push "${ECR_URL}/${REPO_NAME}:latest"

    echo "Done with ${SERVICE}!"
done

echo "All images have been pushed to ECR."
