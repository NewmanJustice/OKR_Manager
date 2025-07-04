# Use official Node.js image as build environment
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Copy .env file for build-time environment variables
COPY .env .env

# Debug: print .env contents to verify hCaptcha sitekey
RUN cat .env

# Set dummy DATABASE_URL for build (Azure will override at runtime)
ENV DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Run Prisma migrations (if needed)
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Only copy necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma/

# Add entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]