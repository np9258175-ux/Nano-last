# Supabase Data Management Guide

## 🎯 Solved Problems

1. **Show user name** - Show user name in history table instead of just user_id
2. **View anonymous user data** - Display the generated results of unlogged users in history table
3. **Show image URL** - Display original image and generated results URL in history table

## 📁 Add a new file

### 1. API files
- `api/admin-history.js` - Admin History View API

### 2. Database optimization
- `improve-database.sql` - Database optimization script

### 3. Management interface
- `admin.html` - Data management background interface

## 🚀 Steps to use

### Step 1: Run the database optimization script

1. Log in [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Enter SQL Editor
4. Copy and run the contents in `improve-database.sql`

### Step 2: Deploy the new API

Deploy `api/admin-history.js` to your Vercel project:

```bash
# The file has been created and directly pushed to GitHub
git add api/admin-history.js
git commit -m "feat: Add administrator history viewing API"
git push origin dev
```

### Step 3: Access the management backend

1. After the deployment is completed, visit: `https://your-domain.vercel.app/admin.html`
2. Or local access: `http://localhost:3000/admin.html`

## 🔧 Functional Features

### Admin API (`/api/admin-history`)

**Query parameters: **
- `page` - Page number (default: 1)
- `limit` - Number of pages per page (default: 50, maximum: 100)
- `type` - Record type filtering
- `search` - Prompt word search
- `include_anonymous` - Whether to include anonymous users (default: true)
- `user_id` - Specific user ID filtering

**Return data format: **
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": "user_123",
      "user_name": "Zhang San",
      "user_email": "zhang@example.com",
      "user_avatar": "https://...",
      "type": "text-to-image",
      "prompt": "Generate a cat",
      "result_image": "image_url",
      "input_images": ["input1.jpg", "input2.jpg"],
      "created_at": "2024-01-01T00:00:00Z",
      "result_image_url": "https://your-domain.com/images/result.jpg",
      "input_image_urls": ["https://your-domain.com/images/input1.jpg"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

### Management backend interface

**Function:**
- 📊 Statistical information display (total records, logged-in users, anonymous users)
- 🔍 Multi-condition search and filtering
- 👤 User information display (avatar, name, email)
- 🖼️ Picture preview function
- 📄 Pagination
- 🏷️ Record type tag

**Search function: **
- Search by prompt keyword
- Filter by record type
- Filter by user ID
- Select whether to include anonymous users

## 🗄️ Database optimization

### Added index
````sql
-- Improve query performance
CREATE INDEX idx_history_created_at_desc ON public.history(created_at DESC);
CREATE INDEX idx_history_type ON public.history(type);
CREATE INDEX idx_history_user_id_created_at ON public.history(user_id, created_at DESC);
```

### Add a new view
````sql
-- View of history and user information
CREATE VIEW history_with_users AS
SELECT
    h.*,
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
```

### Added functions
- `get_history_stats()` - Get statistics
- `search_history()` - Search history

## 🔒 Security configuration

### RLS policy
````sql
-- Only service_role is allowed to access all data
CREATE POLICY "Allow service role full access to history" ON public.history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');
```

### Environment variables
Make sure to set it in Vercel:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (must use service_role key)

## 📊Usage Example

### 1. View all data
```
GET /api/admin-history
```

### 2. Search for specific content
```
GET /api/admin-history?search=cat&type=text-to-image&page=1&limit=20
```

### 3. View specific users
```
GET /api/admin-history?user_id=user_123&include_anonymous=false
```

### 4. View only logged-in users
```
GET /api/admin-history?include_anonymous=false
```

## 🎨 Interface Preview

The management backend interface includes:
- Statistics card displays overall data
- Filter panel supports multi-condition search
- Data table displays detailed information
- Picture preview modal box
- Pagination Navigation

## ⚠️ Notes

1. **Permission Control** - The management background should restrict access permissions
2. **Data Security** - Be careful when using service_role key
3. **Performance Optimization** - Consider paging and indexing when large amounts of data
4. **Image URL** - The image URL prefix needs to be modified according to the actual deployment environment

## 🔄 Update existing features

The existing user history feature remains the same, and the new management features are extra and will not affect the existing user experience.