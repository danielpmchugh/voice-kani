# Use Node.js LTS as the base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy public directory if it exists (required for Next.js standalone builds)
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Install diagnostic tools
RUN apk add --no-cache curl

# Create startup script with diagnostics
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "=== Starting Voice-Kani Application ===" ' >> /app/startup.sh && \
    echo 'echo "Node version: $(node -v)" ' >> /app/startup.sh && \
    echo 'echo "Current directory: $(pwd)" ' >> /app/startup.sh && \
    echo 'echo "Directory contents: $(ls -la)" ' >> /app/startup.sh && \
    echo 'echo "Environment variables: " ' >> /app/startup.sh && \
    echo 'echo "NODE_ENV: $NODE_ENV" ' >> /app/startup.sh && \
    echo 'echo "WANIKANI_API_KEY set: $(if [ -n \"$WANIKANI_API_KEY\" ]; then echo Yes; else echo No; fi)" ' >> /app/startup.sh && \
    echo 'echo "WANIKANI_API_VERSION set: $(if [ -n \"$WANIKANI_API_VERSION\" ]; then echo Yes; else echo No; fi)" ' >> /app/startup.sh && \
    echo 'echo "NEXT_PUBLIC_API_URL set: $(if [ -n \"$NEXT_PUBLIC_API_URL\" ]; then echo Yes; else echo No; fi)" ' >> /app/startup.sh && \
    echo 'echo "=== Testing health endpoint ===" ' >> /app/startup.sh && \
    echo 'echo "Waiting for server to start..." ' >> /app/startup.sh && \
    echo 'node server.js &' >> /app/startup.sh && \
    echo 'SERVER_PID=$!' >> /app/startup.sh && \
    echo 'sleep 5' >> /app/startup.sh && \
    echo 'echo "Checking health endpoint..." ' >> /app/startup.sh && \
    echo 'if curl -s http://localhost:3000/api/health; then' >> /app/startup.sh && \
    echo '  echo "Health check successful"' >> /app/startup.sh && \
    echo 'else' >> /app/startup.sh && \
    echo '  echo "Health check failed"' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo 'echo "=== Continuing with server process ===" ' >> /app/startup.sh && \
    echo 'wait $SERVER_PID' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Set the command to run the app with diagnostics
CMD ["/app/startup.sh"]
