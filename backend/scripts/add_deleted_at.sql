-- Add deleted_at column to users table for soft delete
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Update existing queries to exclude deleted users will be handled in code
-- But we can verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'deleted_at';
