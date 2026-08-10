-- Migration Script: Add account column to goals table
-- Run this in Supabase SQL Editor

-- Add account column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS account TEXT DEFAULT 'all';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_account ON goals(account);

-- Update existing goals to have 'all' as default account
UPDATE goals SET account = 'all' WHERE account IS NULL;

-- Verification query (optional - run to check the migration)
-- SELECT id, label, platform, account, month, year FROM goals LIMIT 5;
