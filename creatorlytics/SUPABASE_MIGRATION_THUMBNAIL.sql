-- Add thumbnail column to posts table
-- Run this in Supabase SQL Editor

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add comment for documentation
COMMENT ON COLUMN posts.thumbnail IS 'URL to post thumbnail image (auto-fetched from link)';
