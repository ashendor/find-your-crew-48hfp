# Phase 1 — LikeMinds creator onboarding

## What is implemented
- `/auth`: email magic-link sign in / sign up.
- `/profile`: authenticated creator profile editor with role chips, skills, interests, availability, and profile photo upload.
- `/creators/[username]`: public creator profile.
- Homepage Create Profile and Join CTAs point to `/auth`.
- Reuses the existing LikeMinds `public.profiles` table and `auth.users` trigger.

## Vercel configuration (required before merge / launch)
Set these environment variables in Vercel for Production and Preview:
- `NEXT_PUBLIC_SUPABASE_URL`: the URL of the connected LikeMinds Supabase project
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (or `NEXT_PUBLIC_SUPABASE_ANON_KEY` legacy fallback)

**Never** add the service-role key or any secret key to `NEXT_PUBLIC_*`.

## Supabase Auth URL configuration (required)
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://find-your-crew-lake.vercel.app`
- Add redirect URL: `https://find-your-crew-lake.vercel.app/profile`
- Add Preview URLs only for trusted deployments, or use a scoped preview pattern.
- Keep any existing LikeMinds redirect URLs and consider how changing Site URL could affect the main LikeMinds application. If the shared project's Site URL already points to LikeMinds, **do not overwrite it**; add Find Your Crew as an allowed redirect URL only.

## Storage
Created `crew-avatars` public bucket with 3 MB cap and JPEG/PNG/WebP MIME allowlist. Insert policy requires first folder segment to equal authenticated user ID; delete is similarly owner restricted.

## Security and product notes
- Existing LikeMinds `profiles` RLS allows public SELECT and owner writes. This phase does not modify its existing policies.
- The existing `subscriptions` table has RLS disabled; review separately before launch.
- Profile pictures are publicly accessible by URL. Do not upload sensitive photos.
- No sample creators are inserted into the database.
- Test sign-in, refresh, avatar upload, profile save, public profile and sign-out on a Vercel preview before merging.
- Current public creator page shows all fields that the user enters in the profile editor, including their city and availability.
- Official 48 Hour Film Project registration remains separate.
