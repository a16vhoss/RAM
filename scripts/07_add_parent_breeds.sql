-- Migration: Add parent breed columns to pets table
-- Date: 2026-01-08

ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS father_breed TEXT,
ADD COLUMN IF NOT EXISTS mother_breed TEXT;
