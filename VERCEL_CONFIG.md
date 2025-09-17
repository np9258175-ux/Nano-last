# Vercel environment variable configuration description

## Problem Solving

Because Supabase RLS (Row Level Security) is enabled, the `service_role` key is required to bypass permission restrictions.

## Environment variables that need to be configured on Vercel

Add the following environment variables to the Vercel project settings:

### Required environment variables

1. **SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY** ⭐ **New**
   - Your Supabase service role key
   - In Supabase Dashboard → Settings → API → Project API keys → `service_role` key
   - This key has administrator privileges and can bypass RLS restrictions

3. **SUPABASE_ANON_KEY**
   - Your Supabase anon key
   - In Supabase Dashboard → Settings → API → Project API keys → `anon` key
   - as an alternative option

4. **GEMINI_API_KEY**
   - Google Gemini API key

### Optional environment variables

5. **GOOGLE_CLIENT_ID**
   - Google OAuth Client ID (if logged in with Google)

## How to get Supabase Service Role Key

1. Log in [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Enter **Settings** → **API**
4. Find the `service_role` key in the **Project API keys** section
5. Copy this key and add it to the Vercel environment variable

## Code modification instructions

The following files have been modified to support the `service_role` key:

- `api/user-sync.js` - User Sync API
- `api/user-history.js` - User History API
- `api/clear-history.js` - Clear History API

The code will use `SUPABASE_SERVICE_ROLE_KEY` first, and fall back to `SUPABASE_ANON_KEY` if there is no configuration.

## Safety precautions

⚠️ **Important**: `service_role` key has administrator privileges, please make sure:

1. Use only in the backend API, do not expose it on the frontend
2. Safely store in Vercel environment variables
3. Regular rotation of keys
4. Monitor API usage

## Test steps

1. Configure `SUPABASE_SERVICE_ROLE_KEY` in Vercel
2. Redeploy the project
3. Test user login and history functions
4. Check the Vercel function log to confirm that there is no 401 error