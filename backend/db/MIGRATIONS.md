Migrations and how to run them

This folder contains SQL migrations for the TheIPTV backend.

To apply the users migration with psql (PostgreSQL):

1. Ensure DATABASE_URL is set (see .env or environment).
2. Example using psql with connection string in .env (replace as needed):

   psql "postgresql://dbuser:dbpass@localhost:5432/theiptv" -f db/migrations/001_create_users.sql

Or, if using a database client, run the SQL file contents against the target database.

Note: The migration creates a users table (id, username, email, password_hash, role, created_at, updated_at) and a trigger to update updated_at on each row update.
