
ALTER TABLE users
ADD COLUMN IF NOT EXISTS edit_counter integer DEFAULT 0;
