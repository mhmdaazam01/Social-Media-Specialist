-- Add appearance and notification settings to profiles table

-- Add theme settings (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto'));

-- Add language settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'id' CHECK (language IN ('id', 'en'));

-- Add date format settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY'));

-- Add number format settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS number_format text DEFAULT '1.000' CHECK (number_format IN ('1,000', '1.000'));

-- Add notification preferences (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notif_goal boolean DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notif_reminder boolean DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notif_report boolean DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notif_collab boolean DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notif_digest boolean DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN profiles.theme IS 'UI theme preference: light, dark, or auto (follows system)';
COMMENT ON COLUMN profiles.language IS 'UI language: id (Bahasa Indonesia) or en (English)';
COMMENT ON COLUMN profiles.date_format IS 'Date display format';
COMMENT ON COLUMN profiles.number_format IS 'Number display format with thousand separator';
COMMENT ON COLUMN profiles.notif_goal IS 'Enable notifications for goal updates';
COMMENT ON COLUMN profiles.notif_reminder IS 'Enable notifications for content reminders';
COMMENT ON COLUMN profiles.notif_report IS 'Enable monthly report emails';
COMMENT ON COLUMN profiles.notif_collab IS 'Enable collaboration notifications';
COMMENT ON COLUMN profiles.notif_digest IS 'Enable daily digest emails';
