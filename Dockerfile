# --- Stage 1: Build Stage ---
# This stage uses a full Node.js environment to install dependencies and build the React application.
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files first to leverage Docker's layer caching for node_modules.
COPY package*.json ./
RUN npm install

# Copy the rest of the source code and build the production bundle.
COPY . .
RUN npm run build

# --- Stage 2: Final Production Stage ---
# This stage uses a lightweight Nginx image to serve the static files generated in the build stage.
FROM nginx:stable-alpine

# Copy the build artifacts from the 'build' stage to Nginx's web root.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration to handle client-side routing.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the application port.
EXPOSE 8080

# Start Nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]
