# HRM Pro - Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git repository pushed to GitHub
- Vercel account (free tier)
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)

## Option 1: Deploy to Vercel (Recommended)

### 1. Prepare PostgreSQL Database
Create a free PostgreSQL database on one of these platforms:
- **Neon** (https://neon.tech) - Free tier, 500MB
- **Supabase** (https://supabase.com) - Free tier, 500MB
- **Vercel Postgres** - Integrated with Vercel

Get the connection string (looks like: `postgresql://user:password@host:5432/dbname`)

### 2. Update Prisma Schema
Change `prisma/schema.prisma` line 8:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
}
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 4. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add these environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)

### 5. Run Database Migration
After deployment, run in Vercel CLI or locally with production DB:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Option 2: Local Production Build

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# Build
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://...` or `file:./dev.db` |
| `AUTH_SECRET` | NextAuth secret key | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL | `http://localhost:3000` or `https://...` |

## Post-Deployment Checklist
- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] Test login with seeded user: `narayan@company.com` / `password123`
- [ ] Verify all dashboard pages load correctly
- [ ] Test API routes

## Switching Between SQLite and PostgreSQL
The app supports both databases. Just change:
1. `prisma/schema.prisma` - `provider = "sqlite"` or `"postgresql"`
2. `.env` - `DATABASE_URL` connection string
3. Run `npx prisma migrate deploy` after switching
