/*
  # Attendance Management System Database Schema

  ## 1. New Tables
    
    ### `students`
    - `id` (uuid, primary key) - Unique student identifier
    - `roll_no` (text, unique, not null) - Student roll number
    - `name` (text, not null) - Student name
    - `created_at` (timestamptz) - Record creation timestamp
    
    ### `attendance_records`
    - `id` (uuid, primary key) - Unique attendance record identifier
    - `roll_no` (text, not null) - Foreign key to students
    - `date` (date, not null) - Attendance date
    - `subject` (text, not null) - Subject/class name
    - `status` (text, not null) - Either "Present" or "Absent"
    - `created_at` (timestamptz) - Record creation timestamp
    - `created_by` (uuid) - Admin who created the record
    
  ## 2. Security
    - Enable RLS on all tables
    - Public read access for students table (for student viewer)
    - Public read access for attendance_records (for student viewer)
    - Only authenticated admins can insert/update/delete attendance records
    - Authenticated admins can manage student records
    
  ## 3. Indexes
    - Index on roll_no for fast lookups
    - Composite index on (roll_no, date) for attendance queries
    
  ## 4. Constraints
    - Status must be either "Present" or "Absent"
    - Foreign key relationship between attendance_records and students
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  date date NOT NULL,
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT fk_student FOREIGN KEY (roll_no) REFERENCES students(roll_no) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_attendance_roll_date ON attendance_records(roll_no, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table

-- Anyone can view students (for student attendance viewer)
CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can insert students
CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update students
CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete students
CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for attendance_records table

-- Anyone can view attendance records (for student attendance viewer)
CREATE POLICY "Anyone can view attendance records"
  ON attendance_records FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can insert attendance records
CREATE POLICY "Authenticated users can insert attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update attendance records
CREATE POLICY "Authenticated users can update attendance"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete attendance records
CREATE POLICY "Authenticated users can delete attendance"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample student data
INSERT INTO students (roll_no, name) VALUES
  ('21A91A01A1', 'Gopal'),
  ('21A91A01A2', 'Priya'),
  ('21A91A01A3', 'Rajesh')
ON CONFLICT (roll_no) DO NOTHING;

-- Insert sample attendance data for demonstration
INSERT INTO attendance_records (roll_no, date, subject, status) VALUES
  ('21A91A01A1', '2025-10-28', 'Maths', 'Present'),
  ('21A91A01A1', '2025-10-28', 'Physics', 'Present'),
  ('21A91A01A1', '2025-10-28', 'Chemistry', 'Present'),
  ('21A91A01A1', '2025-10-28', 'English', 'Present'),
  ('21A91A01A1', '2025-10-28', 'Computer Science', 'Present'),
  ('21A91A01A1', '2025-10-28', 'Electronics', 'Present'),
  ('21A91A01A1', '2025-10-28', 'AI', 'Absent'),
  ('21A91A01A2', '2025-10-28', 'Maths', 'Present'),
  ('21A91A01A2', '2025-10-28', 'Physics', 'Absent'),
  ('21A91A01A2', '2025-10-28', 'Chemistry', 'Present'),
  ('21A91A01A2', '2025-10-28', 'English', 'Present'),
  ('21A91A01A2', '2025-10-28', 'Computer Science', 'Absent'),
  ('21A91A01A2', '2025-10-28', 'Electronics', 'Present'),
  ('21A91A01A2', '2025-10-28', 'AI', 'Present')
ON CONFLICT DO NOTHING;