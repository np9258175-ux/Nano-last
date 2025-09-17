-- Fixed the issue of saving history of unlogged users
-- Please run in Supabase SQL Editor

-- 1. Check the current table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'history'
ORDER BY ordinary_position;

-- 2. Modify the user_id field to allow NULL values
ALTER TABLE public.history
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add default value for unlogged users (optional)
-- If you want to use a special identifier for unlogged users
-- ALTER TABLE public.history
-- ALTER COLUMN user_id SET DEFAULT 'anonymous';

-- 4. Update RLS policy to support anonymous users
DROP POLICY IF EXISTS "Allow anonymous access to history" ON public.history;

-- Create new policies that allow anonymous users to insert and view their own records
CREATE POLICY "Allow anonymous access to history" ON public.history
    FOR ALL USING (true);

-- 5. Create index optimization query performance
CREATE INDEX IF NOT EXISTS idx_history_user_id_null ON public.history(user_id) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_history_user_id_not_null ON public.history(user_id) WHERE user_id IS NOT NULL;

-- 6. Verify the modification results
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'history'
AND column_name = 'user_id';

-- 7. Test insertion of anonymous user records
INSERT INTO public.history (user_id, type, prompt, result_image, created_at)
VALUES (NULL, 'text-to-image', 'test anonymous user record', 'test_image_data', NOW());

-- 8. Verify anonymous user records
SELECT * FROM public.history WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 5;

-- 9. Clean up test data
DELETE FROM public.history WHERE prompt = 'Test anonymous user record';