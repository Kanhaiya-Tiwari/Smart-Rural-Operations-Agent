# This backend Dockerfile is no longer the source of truth for the microservices.
# Each backend service has its own Dockerfile under backend/<service>/Dockerfile.
# Use devops/docker-compose.yml or backend/docker-compose.yml to build the full stack.
FROM scratch
