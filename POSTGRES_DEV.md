# PostgreSQL Only

This project now uses PostgreSQL for all environments (development and production).

## Local Development

1. Start a local PostgreSQL instance (see Docker instructions below).
2. Set your DATABASE_URL in .env to your local Postgres connection string.
3. Run migrations:
   ```sh
   npm run prisma:migrate
   ```
4. Start the app:
   ```sh
   npm run dev
   ```

## Production
- Use your production PostgreSQL connection string in Azure.
- Migrations are applied automatically on deploy.

## Docker for Local Development

You can use Docker Compose or a simple Docker command to run a local Postgres instance. Example:

```sh
docker run --name okr-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=okr -p 5432:5432 -d postgres:15
```

Set your .env:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/okr"
```

## Migration Reset
If you need to reset migrations (e.g., after switching from SQLite):
```sh
bash scripts/reset-prisma-migrations.sh
```

---

For more, see README.md.
