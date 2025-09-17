-- Database optimization scripts - Improve history viewing function
-- Please run in Supabase SQL Editor

-- 1. Check the current table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('users', 'history')
ORDER BY table_name, ordinal_position;

-- 2. Add indexes to history tables to improve query performance
CREATE INDEX IF NOT EXISTS idx_history_created_at_desc ON public.history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_type ON public.history(type);
CREATE INDEX IF NOT EXISTS idx_history_user_id_created_at ON public.history(user_id, created_at DESC);

-- 3. Create a view: History is associated with user information
CREATE OR REPLACE VIEW history_with_users AS
SELECT
    h.id,
    h.user_id,
    h.type,
    h.prompt,
    h.result_image,
    h.input_images,
    h.created_at,
    u.email as user_email,
    u.name as user_name,
    u.avatar_url as user_avatar,
    CASE
        WHEN u.name IS NOT NULL AND u.name != '' THEN u.name
        WHEN u.email IS NOT NULL THEN split_part(u.email, '@', 1)
        ELSE 'Anonymous User'
    END as display_name
FROM public.history h
LEFT JOIN public.users u ON h.user_id = u.id;

-- 4. Create function: Get historical statistics
CREATE OR REPLACE FUNCTION get_history_stats()
RETURNS TABLE (
    Total_records bigint,
    logged_in_users bigint,
    anonymous_users bigint,
    by_type jsonb
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as logged_in,
            COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous
        FROM public.history
    ),
    type_stats AS (
        SELECT jsonb_object_agg(type, count) as type_counts
        FROM (
            SELECT type, COUNT(*) as count
            FROM public.history
            GROUP BY type
        ) t
    )
    SELECT
        s.total,
        s.logged_in,
        s.anonymous,
        COALESCE(ts.type_counts, '{}'::jsonb)
    FROM stats s, type_stats ts;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function: Search history
CREATE OR REPLACE FUNCTION search_history(
    search_term text DEFAULT '',
    record_type text DEFAULT '',
    include_anonymous boolean DEFAULT true,
    page_num integer DEFAULT 1,
    page_size integer DEFAULT 50
)
RETURNS TABLE (
    id bigint,
    user_id text,
    user_name text,
    user_email text,
    type text,
    prompt text,
    result_image text,
    input_images jsonb,
    created_at timestamptz,
    Total_count bigint
) AS $$
DECLARE
    offset_val integer;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH filtered_data AS (
        SELECT
            h.id,
            h.user_id,
            h.type,
            h.prompt,
            h.result_image,
            h.input_images,
            h.created_at,
            u.name as user_name,
            u.email as user_email,
            COUNT(*) OVER() as total_count
        FROM public.history h
        LEFT JOIN public.users u ON h.user_id = u.id
        WHERE
            (search_term = '' OR h.prompt ILIKE '%' || search_term || '%')
            AND (record_type = '' OR h.type = record_type)
            AND (include_anonymous OR h.user_id IS NOT NULL)
    )
    SELECT
        fd.id,
        fd.user_id,
        COALESCE(fd.user_name, 'anonymous user') as user_name,
        COALESCE(fd.user_email, 'not logged in') as user_email,
        fd.type,
        fd.prompt,
        fd.result_image,
        fd.input_images,
        fd.created_at,
        fd.total_count
    FROM filtered_data fd
    ORDER BY fd.created_at DESC
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- 6. Update RLS policy to support administrators to view all data
DROP POLICY IF EXISTS "Allow all operations on history" ON public.history;
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

-- Create a new RLS policy
CREATE POLICY "Allow service role full access to history" ON public.history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Create a sample query
-- View all history (including user information)
SELECT * FROM history_with_users ORDER BY created_at DESC LIMIT 10;

-- Get statistics
SELECT * FROM get_history_stats();

-- Search history
SELECT * FROM search_history('cat', 'text-to-image', true, 1, 20);

-- 8. Verify the optimization results
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM history_with_users
WHERE type = 'text-to-image'
ORDER BY created_at DESC
LIMIT 20;