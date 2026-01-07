-- Migration: Add location columns to pets table
-- Date: 2026-01-06
-- Purpose: Enable Amber Alert geolocation features

ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS last_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_longitude DOUBLE PRECISION;
