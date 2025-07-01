# Production Dockerfile for Next.js (Node 20, Prisma, hCaptcha, Gov Notify)
# Multi-stage for minimal image size and security

# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (with caching for package.json/package-lock.json)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all source code
COPY . .

# Build Next.js app (static and server)
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built app and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Prisma: generate client (if needed at runtime)
RUN npx prisma generate

# Expose port (default for Next.js)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
