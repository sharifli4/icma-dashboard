# ICMA.IO

**Live:** [https://icma.io](https://icma.io)

Event discovery platform and hackathon management system. Browse trending tech events, hackathons, and workshops — or create and manage hackathon submission sessions with QR code support.

## Features

- **Event Discovery Feed** — Browse and filter upcoming tech events, hackathons, and workshops
- **Hackathon Session Management** — Create submission windows with start/end dates
- **QR Code Generation** — Auto-generated QR codes for easy participant access
- **Project Submissions** — Teams submit projects with demo URLs, GitHub links, and video uploads
- **Cloud Storage** — Video uploads stored on Cloudflare R2

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with MikroORM
- **Storage:** Cloudflare R2 (S3-compatible)
- **Styling:** Tailwind CSS 4
- **Font:** Geist Mono

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) for serverless)
- Cloudflare R2 bucket (for video uploads)

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database

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
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── hackathon/          # Hackathon API routes
│   ├── hackathon/
│   │   ├── admin/              # Session creation page
│   │   └── submit/[token]/     # Participant submission page
│   └── page.tsx                # Main discovery feed
├── db/
│   └── entities/               # MikroORM entities
├── services/
│   └── hackathon/              # Business logic
├── lib/                        # Utilities (S3, QR, validation)
└── shared/                     # Shared types and constants
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hackathon/sessions` | List all sessions |
| POST | `/api/hackathon/sessions` | Create new session |
| GET | `/api/hackathon/sessions/[token]` | Get session details |
| GET | `/api/hackathon/sessions/[token]/status` | Public session status |
| GET | `/api/hackathon/sessions/[token]/submissions` | List submissions |
| POST | `/api/hackathon/sessions/[token]/submissions` | Submit project |

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
