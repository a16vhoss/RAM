ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
