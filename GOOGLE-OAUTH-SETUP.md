# Find Your Crew — Google OAuth launch checklist

## Why

Google OAuth avoids Supabase's built-in email service for normal Google logins. It still counts towards Supabase Auth MAU and is subject to provider and abuse limits. Email magic links remain as a fallback during migration.

## 1. Create a Google OAuth client (Google Cloud)

Open https://console.cloud.google.com/auth/overview and create/select a Google Cloud project for **Find Your Crew**. Under Google Auth Platform:

- Branding: application name **Find Your Crew** and your support/contact email.
- Audience: **External**. Make sure the application is available to users you intend to invite. An app left in Testing mode only allows designated test users.
- Data access: basic scopes `openid`, `email` and `profile` (no additional sensitive scopes).
- Clients → Create client → **Web application**.
- Authorized JavaScript origin: `https://find-your-crew-lake.vercel.app`
- Authorized redirect URI: **`https://gtytlzylsohpeuewqjuw.supabase.co/auth/v1/callback`**.

The Google callback is the **Supabase Auth URL**, not the Vercel app callback. Keep the client secret in Google Cloud and Supabase only. Do not paste it into GitHub, Vercel public environment variables, chat or client-side code.

## 2. Enable the provider in the dedicated Supabase project

Go to https://supabase.com/dashboard/project/gtytlzylsohpeuewqjuw/auth/providers and enable **Google**, entering the Google Cloud **Client ID** and **Client secret** in the provider configuration. Save.

Go to https://supabase.com/dashboard/project/gtytlzylsohpeuewqjuw/auth/url-configuration and retain:

- Site URL: `https://find-your-crew-lake.vercel.app`
- Redirect URL: `https://find-your-crew-lake.vercel.app/profile`

For previews, add an appropriately scoped preview redirect allowlist if needed, e.g. an exact preview `/profile` URL. Avoid uncontrolled redirect wildcards for production.

## 3. Activate the Google button in Vercel

Only **after** Google Cloud and Supabase provider setup are complete:

Set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` in Vercel project `find-your-crew` (Production and, if testing, Preview). This is a public feature flag, not a secret. Redeploy to bake the new variable into the Next.js client bundle. Do **not** add the Google OAuth client secret to Vercel.

Without this flag, the existing magic-link sign-in remains available and working. With the flag, Google is shown first and the email link is tucked behind **Continue with email instead**.

## 4. Test

- First-time Google account: `/auth` → Google consent → `/profile` → `/onboarding` → `/dashboard`.
- Returning Google account: existing profile and dashboard.
- Existing email-link account with the same verified Google email: confirm whether Supabase links the identities and retains the existing profile (do not assume identity linking in all configurations).
- Sign out, sign back in, browser reload and mobile login.
- Verify non-Google email-link fallback still works during migration.
- Look for `redirect_uri_mismatch` or Google test-user restrictions if a provider login fails.

Official 48 Hour Film Project registration is separate from Find Your Crew.

**Do not turn off email auth before old accounts and OAuth linking are verified.**
