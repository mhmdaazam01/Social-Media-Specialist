# Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the content from the migration file
4. Paste and run it in the SQL Editor

### Option 2: Using Supabase CLI
```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Latest Migration

### `add_appearance_and_notification_settings.sql`
**Purpose:** Add appearance preferences and additional notification settings to profiles table

**Adds the following columns:**
- `theme` - UI theme (light/dark/auto)
- `language` - UI language (id/en)
- `date_format` - Date display format
- `number_format` - Number display format
- `notif_collab` - Collaboration notifications
- `notif_digest` - Daily digest emails

**Safe to run:** Uses `IF NOT EXISTS` checks, won't fail if columns already exist.

## Verification

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('theme', 'language', 'date_format', 'number_format', 'notif_collab', 'notif_digest');
```

Expected result: Should return 6 rows showing the new columns.
