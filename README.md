# Staircase Secret Message Box

A mobile-first Next.js + Supabase web app for a QR-code-based site-specific art project.

The site works like a temporary one-person-at-a-time digital note box:

1. A visitor opens the QR code link.
2. The app claims the oldest waiting note from Supabase.
3. The claimed note is deleted immediately and cannot be shown again.
4. The visitor leaves a new anonymous note for the next person.

There is no login, no public archive, and no collection of names, emails, or personal information.

## Tech Stack

- Next.js App Router
- React
- Supabase
- TypeScript
- Plain CSS

## Install

```bash
npm install
```

## Supabase Setup

Create a Supabase project, then open **SQL Editor** and run this SQL.

This creates the `secret_notes` table, enforces that only one note can wait at a time, and adds an atomic function that deletes and returns one note in a single database operation.

```sql
create extension if not exists pgcrypto;

create table if not exists public.secret_notes (
  id uuid primary key default gen_random_uuid(),
  mood text not null,
  message text not null,
  music_title text,
  music_url text,
  created_at timestamp with time zone not null default now()
);

create unique index if not exists secret_notes_single_waiting_note
on public.secret_notes ((true));

alter table public.secret_notes enable row level security;

drop policy if exists "Anyone can leave a note" on public.secret_notes;

create policy "Anyone can leave a note"
on public.secret_notes
for insert
to anon
with check (
  length(trim(mood)) > 0
  and length(trim(message)) > 0
  and char_length(message) <= 200
);

create or replace function public.claim_oldest_secret_note()
returns table (
  id uuid,
  mood text,
  message text,
  music_title text,
  music_url text,
  created_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  delete from public.secret_notes
  where id = (
    select id
    from public.secret_notes
    order by created_at asc
    for update skip locked
    limit 1
  )
  returning id, mood, message, music_title, music_url, created_at;
$$;

revoke all on public.secret_notes from anon, authenticated;
grant insert on public.secret_notes to anon;

revoke all on function public.claim_oldest_secret_note() from public;
grant execute on function public.claim_oldest_secret_note() to anon;
```

### Why the Function Is Used

A normal client-side `select` followed by `delete` can show the same note twice if two visitors open the QR code at the same moment. The `claim_oldest_secret_note()` function uses `delete ... returning` so reading and deleting happen as one database action.

## Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Find these values in Supabase under **Project Settings → API**.

Only the public publishable key is used. Do not put a service role key in this app.

## Run Locally

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Deploy

The simplest deployment target is Vercel.

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.
5. Use the deployed URL to generate the QR code.

## Project Structure

```text
app/
  globals.css      # Mobile-first visual design
  layout.tsx       # Metadata and root layout
  page.tsx         # Full note reading/writing flow
lib/
  supabase.ts      # Supabase client and local types
.env.example       # Required environment variables
README.md          # Setup and deployment instructions
```

## Notes

- Mood and message are required.
- Message length is limited to 200 characters.
- Music title is optional.
- Music URL is optional and validated if provided.
- Duplicate submissions are disabled while the insert is in progress.
- If another note is already waiting, Supabase rejects a second insert because of the single-row unique index.
