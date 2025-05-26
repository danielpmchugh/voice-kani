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

# Expose port
EXPOSE 80

# Set the command to run the app
CMD ["node", "server.js"]
