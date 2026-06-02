-- ============================================
-- Fix Platform ID Mismatch Issue
-- ============================================
-- Problem: Posts have "tiktok"/"instagram" but platforms table might have different IDs
-- Solution: Normalize everything to lowercase full names

-- Step 1: Check current state
-- ============================================

-- See what platform IDs exist in posts
SELECT DISTINCT platform, COUNT(*) as count 
FROM posts 
GROUP BY platform 
ORDER BY count DESC;

-- See what platform IDs exist in platforms table
SELECT platform_id, name, COUNT(*) as posts_count
FROM platforms 
LEFT JOIN posts ON posts.platform = platforms.platform_id
GROUP BY platforms.id, platform_id, name
ORDER BY name;

-- Step 2: Normalize platform IDs
-- ============================================

-- Update platforms table: make platform_id = lowercase(name)
-- This ensures consistency
UPDATE platforms 
SET platform_id = LOWER(name)
WHERE platform_id != LOWER(name);

-- Update posts: normalize to lowercase
UPDATE posts 
SET platform = LOWER(platform);

-- Step 3: Verify the fix
-- ============================================

-- Check if posts now match platform IDs
SELECT 
  p.platform,
  COUNT(*) as post_count,
  CASE 
    WHEN pl.platform_id IS NOT NULL THEN 'MATCHED ✓'
    ELSE 'NOT MATCHED ✗'
  END as status
FROM posts p
LEFT JOIN platforms pl ON p.platform = pl.platform_id
GROUP BY p.platform, pl.platform_id
ORDER BY post_count DESC;

-- ============================================
-- Alternative: If you prefer short codes (ig, tt)
-- ============================================
-- Uncomment below if you want short codes instead of full names

/*
-- Map full names to short codes
UPDATE posts SET platform = 'ig' WHERE platform ILIKE '%instagram%';
UPDATE posts SET platform = 'tt' WHERE platform ILIKE '%tiktok%';
UPDATE posts SET platform = 'yt' WHERE platform ILIKE '%youtube%';
UPDATE posts SET platform = 'fb' WHERE platform ILIKE '%facebook%';
UPDATE posts SET platform = 'tw' WHERE platform ILIKE '%twitter%' OR platform ILIKE '%x%';
UPDATE posts SET platform = 'li' WHERE platform ILIKE '%linkedin%';

-- Update platforms to use short codes
UPDATE platforms SET platform_id = 'ig' WHERE name ILIKE '%instagram%';
UPDATE platforms SET platform_id = 'tt' WHERE name ILIKE '%tiktok%';
UPDATE platforms SET platform_id = 'yt' WHERE name ILIKE '%youtube%';
UPDATE platforms SET platform_id = 'fb' WHERE name ILIKE '%facebook%';
UPDATE platforms SET platform_id = 'tw' WHERE name ILIKE '%twitter%' OR name ILIKE '%x%';
UPDATE platforms SET platform_id = 'li' WHERE name ILIKE '%linkedin%';
*/

-- ============================================
-- Clean up duplicates (if any)
-- ============================================

-- Find duplicate platform_ids
SELECT platform_id, COUNT(*) as count
FROM platforms
GROUP BY platform_id
HAVING COUNT(*) > 1;

-- If you have duplicates, keep only the first one:
-- (Run this only if the query above shows duplicates)
/*
DELETE FROM platforms a USING platforms b
WHERE a.id > b.id 
AND a.platform_id = b.platform_id 
AND a.user_id = b.user_id;
*/

-- ============================================
-- Final Check: Should see all matched
-- ============================================

SELECT 
  'Total Posts' as metric,
  COUNT(*) as count
FROM posts

UNION ALL

SELECT 
  'Posts with Valid Platform' as metric,
  COUNT(*) as count
FROM posts p
INNER JOIN platforms pl ON p.platform = pl.platform_id

UNION ALL

SELECT 
  'Posts with Invalid Platform' as metric,
  COUNT(*) as count
FROM posts p
LEFT JOIN platforms pl ON p.platform = pl.platform_id
WHERE pl.platform_id IS NULL;

-- ============================================
-- Expected Result: 
-- - "Posts with Invalid Platform" should be 0
-- ============================================
