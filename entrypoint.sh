#!/bin/sh
# entrypoint.sh: Run Prisma migrations and start the app
set -e

# Run migrations (only new migrations are applied, existing data is preserved)
# npx prisma migrate deploy

# Start the Next.js app
npm start