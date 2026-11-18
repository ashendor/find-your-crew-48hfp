-- Record that a profile was created only after the person accepted the Terms.
-- Run in the Supabase SQL editor. Existing profiles are left as they are.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;
