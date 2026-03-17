# MedCare API (Elysia + Bun)

## Prerequisites

Install Bun first:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Install Dependencies

```bash
cd api
bun add @supabase/supabase-js @elysiajs/bearer @elysiajs/jwt
bun install
```

## Database Setup

1. Open Supabase SQL Editor.
2. Run [`src/db/schema.sql`](./src/db/schema.sql).
3. Run [`src/db/seed.sql`](./src/db/seed.sql) for development seed data.

## Environment

```bash
cp .env.example .env
```

Required variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

## Run

```bash
bun run dev
```

The API listens on `http://localhost:4000` by default.

## Implemented Routes

- `GET /health`
- `GET /auth/me`
- `GET /residents`
- `GET /residents/:id`
- `POST /residents`
- `PATCH /residents/:id`
- `GET /residents/:id/medications`
- `GET /residents/:id/weekly-summary`
- `POST /dispense`
- `GET /dispense/history`
- `GET /stock`
- `PATCH /stock/:id`
