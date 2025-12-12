/*
  # Add year column to students table

  1. Changes
    - Add `year` column to students table to support year-wise organization
    - Default value set to 1 for existing records
    - Supports years 1-4
  
  2. Notes
    - Existing students will be assigned to Year 1
    - New students can be assigned to any year 1-4
    - Used for organizing students by academic year in admin portal
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'year'
  ) THEN
    ALTER TABLE students ADD COLUMN year integer DEFAULT 1;
  END IF;
END $$;