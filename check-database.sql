-- Database inspection and optimization scripts
-- Please run in Supabase SQL Editor

-- 1. Check whether the table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'history');

-- 2. Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'history'
ORDER BY ordinary_position;

-- 3. Check the index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'history';

-- 4. Check the amount of data
SELECT
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT
    'history' as table_name,
    COUNT(*) as row_count
FROM history;

-- 5. Check RLS policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- 6. If the history table does not exist, create it
CREATE TABLE IF NOT EXISTS public.history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    result_image TEXT,
    input_images JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. If the users table does not exist, create it
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON public.history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 9. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- 10. Delete possible conflicting policies
DROP POLICY IF EXISTS "Allow anonymous access to users" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous access to history" ON public.history;

-- 11. Create a policy that allows all operations (for service_role key)
CREATE POLICY "Allow all operations on users" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on history" ON public.history
    FOR ALL USING (true);

-- 12. Verify the configuration
SELECT
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'history');

-- 13. Test query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, type, prompt, result_image, created_at
FROM history
WHERE user_id = 'test_user'
ORDER BY created_at DESC
LIMIT 20;