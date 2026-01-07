-- Add address and notification_preferences columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"appointments": true, "vaccineReminders": true, "promotions": false, "newsletter": true, "petActivity": true}';
