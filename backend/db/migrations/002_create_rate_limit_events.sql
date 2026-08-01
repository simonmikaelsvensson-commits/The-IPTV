-- Migration: create rate_limit_events table

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  ip VARCHAR(100),
  path TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
