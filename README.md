# Project Magang Binus

A modern web dashboard built with React + Vite, Shadcn/ui, Supabase, and Recharts.

## Tech Stack

| Layer | Technology |
|---|---|
| Package Manager | Bun |
| Frontend | React + Vite (TypeScript) |
| UI Components | Shadcn/ui |
| Backend / DB / Auth | Supabase |
| Charts | Recharts |
| Hosting | Vercel |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Pand3gar/project-magang-binus.git
cd project-magang-binus
```

### 2. Install dependencies

```bash
bun install
```

### 3. Setup environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your [Supabase project settings](https://supabase.com/dashboard).

### 4. Run dev server

```bash
bun run dev
```

### 5. Build for production

```bash
bun run build
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the following environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

> The `vercel.json` already includes SPA routing config so page refreshes work correctly.
