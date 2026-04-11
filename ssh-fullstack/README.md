# Student Support Hub — Full-Stack Application

A production-grade academic research platform built with **Next.js 14**, **Prisma**, **Supabase**, and **PostgreSQL**.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Next.js    │────▶│   Prisma     │────▶│   PostgreSQL     │
│   Frontend   │     │   ORM        │     │   (Supabase)     │
│   + API      │     └──────────────┘     └──────────────────┘
│   Routes     │
│              │────▶ Supabase Auth (email + password login)
│              │────▶ Supabase Storage (PDF files)
└─────────────┘
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Supabase account (free tier works)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, set a database password, pick a region
3. Wait for project to provision (~2 minutes)
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings → Database** and copy:
   - `Connection string (URI)` → this is your `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Create Storage Bucket

1. In Supabase dashboard → **Storage**
2. Click **New Bucket**
3. Name: `papers`
4. Toggle **Public bucket** ON
5. Click **Create**

### Step 3: Set up the project

```bash
# Clone or copy this project
cd student-support-hub

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your Supabase values in .env.local
# (edit the file with your actual keys)
```

### Step 4: Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase (creates all tables)
npm run db:push

# Seed initial data (creates admin user, clubs, books, sample papers)
npm run db:seed
```

### Step 5: Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Import all 200 papers

1. From the old static site, open browser console and run:
   ```js
   copy(JSON.stringify(SEED_PAPERS))
   ```
2. Save the output as `scripts/papers-data.json`
3. (Optional) Copy all paper PDFs into a `pdf-source/` folder
4. Run:
   ```bash
   npx tsx scripts/bulk-import.ts
   # Or with PDF upload:
   npx tsx scripts/bulk-import.ts --upload-pdfs
   ```

---

## Admin Login

After seeding, log in with:
- **Email:** basil.mustafa@amg.sch.ae (or whatever you set in .env.local)
- **Password:** Basilmustafa265

The admin dashboard is at `/admin`.

---

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (13 models)
├── scripts/
│   ├── seed.ts                # Seeds admin user, clubs, books, chapters
│   └── bulk-import.ts         # Imports all 200 papers + PDFs
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage (server component)
│   │   ├── layout.tsx         # Root layout
│   │   ├── (public)/          # Public pages (wrapped with Navbar+Footer)
│   │   │   ├── dashboard/     # Student dashboard
│   │   │   ├── research/      # Research centre
│   │   │   │   ├── papers/    # All papers (search/filter)
│   │   │   │   ├── book/[id]/ # Book detail with chapters
│   │   │   │   └── paper/[id]/# Paper detail with PDF viewer
│   │   │   ├── resources/     # Academic resources
│   │   │   └── community/     # Mentorship, alumni, incubator
│   │   ├── admin/             # Admin portal (auth-guarded)
│   │   │   ├── papers/        # Paper management table
│   │   │   ├── books/         # Book management
│   │   │   ├── analytics/     # Traffic & content analytics
│   │   │   └── upload/        # PDF upload interface
│   │   ├── auth/login/        # Login page (email OTP + password)
│   │   └── api/               # API routes
│   │       ├── papers/        # CRUD for papers
│   │       ├── books/         # Read books
│   │       ├── clubs/         # Read clubs
│   │       ├── upload/        # PDF upload to Supabase Storage
│   │       ├── analytics/     # Analytics data
│   │       └── search/        # Full-text search
│   ├── components/            # Shared UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── PaperCard.tsx
│   ├── lib/                   # Core utilities
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Auth helpers (getSession, requireAdmin)
│   │   ├── storage.ts         # PDF upload/download helpers
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── supabase/          # Supabase client instances
│   │       ├── client.ts      # Browser client
│   │       ├── server.ts      # Server client (cookies)
│   │       └── admin.ts       # Service role client
│   └── middleware.ts          # Auth middleware (protects /admin)
├── .env.example               # Environment variable template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

| Table | Purpose | Key Relations |
|-------|---------|--------------|
| `clubs` | Research clubs (AMG, AMO2, AMAG) | → books, papers |
| `academic_years` | Year periods (2023-2024, etc.) | → books, papers |
| `books` | Publications | → club, year, parts, chapters, papers |
| `book_parts` | Part 1, Part 2, Full Book | → book, chapters, papers |
| `chapters` | Chapter within a part | → book, part, papers |
| `papers` | Individual research papers | → book, part, chapter, club, year |
| `profiles` | User profiles (extends Supabase Auth) | → resources, posts, actions |
| `resources` | Academic materials | → createdBy profile |
| `community_posts` | Forum posts | → author profile |
| `mentorship_requests` | Mentorship matching | → student, mentor profiles |
| `page_views` | Analytics: page visits | → paper, user |
| `admin_actions` | Audit log for admin actions | → admin profile |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/papers` | — | List papers (with filters) |
| GET | `/api/papers/[id]` | — | Get single paper (increments views) |
| POST | `/api/papers` | Admin | Create paper |
| PUT | `/api/papers/[id]` | Admin | Update paper |
| DELETE | `/api/papers/[id]` | Admin | Delete paper |
| GET | `/api/books` | — | List all books with relations |
| GET | `/api/clubs` | — | List all clubs with counts |
| POST | `/api/upload` | Admin | Upload PDF to Supabase Storage |
| GET | `/api/analytics` | Admin | Dashboard analytics data |
| GET | `/api/search?q=...` | — | Full-text search across papers |

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# DATABASE_URL

# Deploy to production
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Authentication Flow

### Students
1. Enter school email (`@amg.sch.ae`)
2. Receive magic link via email
3. Click link → redirects to `/api/auth/callback`
4. Callback creates/updates profile in database
5. Session stored in cookies

### Admins
1. Go to `/auth/login` → click "Admin login"
2. Enter email + password (created by seed script)
3. Session stored in cookies
4. Middleware checks role on `/admin/*` routes

### Guests
1. Click "Continue as Guest"
2. Can browse all public content
3. No profile created

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Prisma over raw SQL** | Type-safe queries, auto-generated types, easy migrations |
| **Server Components** | Pages fetch data directly from DB — no API round-trip |
| **Supabase Auth** | Built-in email OTP, password auth, session management |
| **Supabase Storage** | S3-compatible, public URLs, integrated with auth |
| **ISR (revalidate: 60)** | Pages rebuild every 60s — fresh data without rebuilds |
| **Middleware auth** | Protects admin routes at the edge before page loads |

---

## Cost (Free Tier)

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| Supabase | 500MB DB, 1GB storage, 2GB bandwidth | ~1000 papers + PDFs |
| Vercel | Unlimited static, 100GB bandwidth | Full deployment |
| **Total** | **$0/month** | **Production use** |
