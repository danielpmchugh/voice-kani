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
RUN if [ -d /app/public ]; then mkdir -p ./public && cp -r /app/public/* ./public/; else mkdir -p ./public; fi
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy public directory if it exists (required for Next.js standalone builds)
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 80

# Set the command to run the app with startup logging
CMD ["sh", "-c", "echo 'Container starting...' && echo 'Node version:' $(node --version) && echo 'Starting Next.js server on port ${PORT:-3000}...' && node server.js"]
