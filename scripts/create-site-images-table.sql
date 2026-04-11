-- Site images table for Katy Pride website
-- Run this in your Neon SQL Editor (optional).
-- Note: the app now auto-creates this table if it does not exist.

CREATE TABLE IF NOT EXISTS site_images (
  image_key VARCHAR(120) PRIMARY KEY,
  id VARCHAR(120) NOT NULL,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT,
  updated_at TIMESTAMPTZ,
  cloudinary_public_id TEXT,
  gravity VARCHAR(32),
  focal_x DOUBLE PRECISION,
  focal_y DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_images_updated_at ON site_images(updated_at);
