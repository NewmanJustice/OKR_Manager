This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# OKR Manager

## Local Development Run Book

### 1. Prerequisites
- Node.js 20+
- npm
- Docker (optional, for local Postgres)

### 2. Environment Variables
Create a `.env` file in the project root with:
```
# For SQLite (local dev)
DATABASE_URL="file:./dev.db"
# For email, hCaptcha, JWT, etc. (replace with your own values)
EMAIL_USER="<your-email-user>"
EMAIL_PASS="<your-email-password>"
HCAPTCHA_SECRET="<your-hcaptcha-secret>"
JWT_SECRET="<your-jwt-secret>"
```
> **Never commit secrets to git.**

### 3. Install dependencies
```
npm install
```

### 4. Start the app (SQLite, local dev)
```
npm run dev
```

### 5. (Optional) Use local Postgres for dev
- Update `DATABASE_URL` in `.env` to your local Postgres connection string.
- Run `npm run prisma:postgres && npx prisma generate && npx prisma migrate dev`.

---

## Production Deployment to Azure Run Book

### 1. Prerequisites
- Azure Container Registry or Docker Hub
- Azure Web App for Containers
- Azure PostgreSQL Database

### 2. Secrets & Environment Variables
Set these in Azure Web App > Configuration:
- `DATABASE_URL` = `postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require`
- `EMAIL_USER`, `EMAIL_PASS`, `HCAPTCHA_SECRET`, `JWT_SECRET` (as above)

### 3. Build & Push Docker Image
```
docker build -t <your-registry>/okr-manager:latest .
docker push <your-registry>/okr-manager:latest
```

### 4. Deploy to Azure
- Set your Web App to use the pushed image.
- Ensure all environment variables are set in Azure.
- Azure will inject `DATABASE_URL` and other secrets at runtime.

### 5. Database Migrations
- The container runs `npx prisma migrate deploy` on startup (see `entrypoint.sh`).
- Only new migrations are applied; existing data is preserved.

### 6. Troubleshooting
- Check Azure Web App logs for errors.
- Ensure all secrets are set in Azure, not in code.
- If you see `.next` missing errors, check Docker build logs for build failures.
- **If you see a Prisma schema error (e.g., `Could not find Prisma Schema that is required for this command`):**
  - Make sure your Dockerfile copies the `prisma/` directory into the production image:
    ```dockerfile
    COPY --from=builder /app/prisma ./prisma/
    ```
  - The `prisma/schema.prisma` file must be present in the running container for migrations to work.
  - Rebuild and redeploy your Docker image after making this change.

---

## Security Notes
- **Never commit secrets or production connection strings to git.**
- Use environment variables for all secrets in both local and production.
- Rotate secrets regularly.

---

## Placeholders for Secrets
- `<your-email-user>`: Your SMTP/email username
- `<your-email-password>`: Your SMTP/email password
- `<your-hcaptcha-secret>`: Your hCaptcha secret key
- `<your-jwt-secret>`: Your JWT signing secret
- `<user>:<password>@<host>:5432/<db>`: Your Azure PostgreSQL credentials

---

For more details, see the comments in the Dockerfile and codebase.
