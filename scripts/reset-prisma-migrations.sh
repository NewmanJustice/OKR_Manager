# This script will clean up all SQLite migration history and lock files, and create a new initial migration for PostgreSQL.
# Usage: bash scripts/reset-prisma-migrations.sh

set -e

# Remove old migrations and lock file
rm -rf prisma/migrations prisma/migration_lock.toml

# Ensure schema.prisma is set to postgresql (already set in your repo)

# Create new initial migration for PostgreSQL (requires DATABASE_URL to be set for your Azure/local Postgres)
npx prisma migrate dev --name init

echo "Prisma migrations reset for PostgreSQL. Commit and push the new migrations."
