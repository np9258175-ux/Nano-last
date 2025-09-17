-- Fix SQL scripts for Supabase permission configuration
-- Please run these commands in Supabase SQL Editor

-- 1. Check the current RLS policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- 2. Check whether the table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'history');

-- 3. Check whether RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- 4. If the users table does not exist, create it
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. If the history table does not exist, create it
CREATE TABLE IF NOT EXISTS public.history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    result_image TEXT,
    input_images JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- 7. Delete existing potential conflicting policies
DROP POLICY IF EXISTS "Allow anonymous access to users" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous access to history" ON public.history;
DROP POLICY IF EXISTS "Users can view own history" ON public.history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.history;
DROP POLICY IF EXISTS "Users can delete own history" ON public.history;

-- 8. Create a policy that allows anonymous access (for anon key)
-- Note: This allows all anonymous access and is only used for testing. Production environments should use stricter strategies

-- Allow anonymous users to all operations
CREATE POLICY "Allow anonymous access to users" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to history" ON public.history
    FOR ALL USING (true);

-- 9. Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.history(created_at DESC);

-- 10. Verify permission configuration
-- Check whether the policy was created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- 11. Test insert permission (optional)
-- INSERT INTO public.users (id, email, name) VALUES ('test_user', 'test@example.com', 'Test User');
-- SELECT * FROM public.users WHERE id = 'test_user';
-- DELETE FROM public.users WHERE id = 'test_user';