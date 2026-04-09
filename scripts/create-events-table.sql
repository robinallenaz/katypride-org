-- Events table for Katy Pride website
-- Run this in your Neon SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE,
  location VARCHAR(500),
  image_src VARCHAR(500),
  image_alt VARCHAR(255) NOT NULL,
  event_category VARCHAR(50) NOT NULL CHECK (event_category IN (
    'general', 'coffee', 'social', 'fundraising', 'advocacy', 
    'education', 'health', 'youth', 'pride', 'volunteer', 'cultural', 'community'
  )),
  external_url VARCHAR(500),
  external_cta_label VARCHAR(100),
  summary TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  parent_id INTEGER REFERENCES events(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_events_start ON events(start);
CREATE INDEX idx_events_category ON events(event_category);

-- Migration function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
