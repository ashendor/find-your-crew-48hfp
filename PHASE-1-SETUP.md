# Phase 1 — Standalone Find Your Crew Supabase project

New isolated Supabase project: `gtytlzylsohpeuewqjuw` (Mumbai).
Dashboard: https://supabase.com/dashboard/project/gtytlzylsohpeuewqjuw

## Implemented
- `/auth`: email magic-link sign-in / signup
- `/profile`: authenticated creator profile editing, photo, roles, skills and availability
- `/creators/[username]`: public creator profile
- Homepage Create Profile CTAs
- New standalone `public.profiles` table with row-level security and automatic signup trigger
- Dedicated `crew-avatars` storage bucket with per-user upload/delete policies

## Required Vercel setup
In Vercel → Settings → Environment Variables for this site (Preview and Production):
- `NEXT_PUBLIC_SUPABASE_URL=https://gtytlzylsohpeuewqjuw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: copy the **publishable** key from the new Find Your Crew Supabase project → Connect / API Keys.

Never use a service role or secret key in a `NEXT_PUBLIC_` variable.

## Required Auth setup
In the **new Find Your Crew project only**, Supabase → Authentication → URL Configuration:
- Site URL: `https://find-your-crew-lake.vercel.app`
- Allowed redirect URL: `https://find-your-crew-lake.vercel.app/profile`
- Add trusted Preview deployment redirects for QA if required.

## Before merge
- Validate Next.js build and TypeScript.
- QA sign-in email, redirect, session persistence, photo upload, profile saving, public creator page and sign-out.
- The new project security advisor returned no findings at setup.
- Do not insert illustrative profiles into the live database.
- Official 48 Hour Film Project event registration is separate from Find Your Crew.
