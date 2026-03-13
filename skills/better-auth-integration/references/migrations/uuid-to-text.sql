ALTER TABLE verifications ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE accounts ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE accounts ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS id_token TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS access_token_expires_at TIMESTAMP;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS password TEXT;

ALTER TABLE sessions ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE sessions ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE users ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE user_preferences ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE cats ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE cats ADD CONSTRAINT cats_user_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
