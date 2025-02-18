
ALTER TABLE users
ADD COLUMN IF NOT EXISTS salvation_age text,
ADD COLUMN IF NOT EXISTS baptism_date text;
