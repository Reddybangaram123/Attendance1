/*
  # Add year column to attendance_records table

  1. Changes
    - Add `year` column to attendance_records table for year-wise tracking
    - Default value set to 1 for existing records
    - Used for analytics and filtering by academic year
  
  2. Notes
    - Existing records will be assigned Year 1
    - All new records must specify the year
    - Supports years 1-4
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'year'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN year integer DEFAULT 1;
  END IF;
END $$;