# ICMA.IO

**Live:** [https://icma.io](https://icma.io)

Event discovery platform, community dashboard, and hackathon management system. Browse trending tech events, create and manage communities, run hackathon submission sessions with QR code support, and more.

## Features

- **Event Discovery Feed** — Browse and filter upcoming tech events, hackathons, and workshops with timeline, type, and category filters
- **Authentication** — Full auth system with registration, login, and session management (NextAuth.js)
- **Community Dashboard** — Manage your community profile, logo, and events from one place
- **Event Management** — Create, edit, and publish events with banner images, categories, and registration links
- **Hackathon Session Management** — Create submission windows with start/end dates
- **QR Code Generation** — Auto-generated QR codes for easy participant access
- **Project Submissions** — Teams submit projects with demo URLs, GitHub links, and video uploads
- **Image & File Uploads** — Community logos and event banners stored on Cloudflare R2
- **Seed Data** — Pre-built seed script with demo users and events for quick setup

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** PostgreSQL (Neon) with MikroORM
- **Auth:** NextAuth.js with credentials provider
- **Storage:** Cloudflare R2 (S3-compatible)
- **Styling:** Tailwind CSS 4
- **Font:** Geist Mono
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (or [Neon](https://neon.tech) for serverless)
- Cloudflare R2 bucket (for file uploads)

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database

NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_BASE_URL=https://your-public-bucket-url.r2.dev

# Optional: Enable admin auth for hackathon endpoints
HACKATHON_ADMIN_API_KEY=your-secret-key
```

### Installation

```bash
npm install
```

### Database Setup

```bash
# Create tables
npm run db:create

# Or update existing schema
npm run db:update

# Seed demo data
npx tsx scripts/seed.ts
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — event discovery feed with filters |
| `/login` | Login page |
| `/join` | Community registration page |
| `/dashboard` | Community dashboard (profile + event management) |
| `/dashboard/create-event` | Create new event form |
| `/event/[id]` | Event detail page |
| `/hackathon/admin` | Hackathon session admin |
| `/hackathon/submit/[token]` | Participant submission page |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/events` | List all events (or `?mine=true` for user's events) |
| POST | `/api/events` | Create new event |
| GET | `/api/events/[id]` | Get event details |
| PUT | `/api/events/[id]` | Update event |
| GET | `/api/community-profile` | Get community profile |
| PUT | `/api/community-profile` | Update community profile |
| POST | `/api/upload` | Upload file to R2 |
| GET | `/api/hackathon/sessions` | List all sessions |
| POST | `/api/hackathon/sessions` | Create new session |
| GET | `/api/hackathon/sessions/[token]` | Get session details |
| GET | `/api/hackathon/sessions/[token]/status` | Public session status |
| GET | `/api/hackathon/sessions/[token]/submissions` | List submissions |
| POST | `/api/hackathon/sessions/[token]/submissions` | Submit project |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                  # Auth endpoints (NextAuth + register)
│   │   ├── community-profile/     # Community profile CRUD
│   │   ├── events/                # Event CRUD
│   │   ├── hackathon/             # Hackathon API routes
│   │   └── upload/                # File upload to R2
│   ├── dashboard/
│   │   ├── create-event/          # Create event page
│   │   └── page.tsx               # Community dashboard
│   ├── event/[id]/                # Event detail page
│   ├── hackathon/
│   │   ├── admin/                 # Session creation page
│   │   └── submit/[token]/        # Participant submission page
│   ├── join/                      # Registration page
│   ├── login/                     # Login page
│   └── page.tsx                   # Home — discovery feed
├── db/
│   ├── entities/                  # MikroORM entities
│   └── mikro-orm.config.ts        # ORM configuration
├── lib/                           # Utilities (auth, S3, QR, validation)
├── services/
│   └── hackathon/                 # Business logic
├── shared/                        # Shared types and constants
└── types/                         # TypeScript declarations
scripts/
└── seed.ts                        # Database seed script
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:create  # Create database schema
npm run db:update  # Update database schema
npm run db:drop    # Drop all tables
```

## License

MIT
