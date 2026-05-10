# --- Stage 1: Builder Stage ---
# This stage installs the Python dependencies. Using a separate stage keeps the final image small
# by excluding build-time dependencies and the pip cache.
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies if needed (none required for this basic setup but good practice)
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Install requirements to a local directory
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Final Runtime Stage ---
# This stage creates the lightweight production image.
FROM python:3.11-slim

WORKDIR /app

# Copy only the installed dependencies from the builder stage
COPY --from=builder /install /usr/local

# Copy the application source code
COPY app ./app

# Set the entrypoint to run the FastAPI application with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
