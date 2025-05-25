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

# Set the command to run the app
CMD ["sh", "-c", "echo 'Starting Next.js application...' && echo 'Node version:' && node --version && echo 'Environment variables:' && env | grep -E '(NODE_ENV|WANIKANI|NEXT_PUBLIC)' && node server.js"]
