-- Migration: Add city column to pets table
-- Date: 2026-01-08

ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS city TEXT;
