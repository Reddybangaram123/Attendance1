import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  roll_no: string;
  name: string;
  year: number;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  roll_no: string;
  date: string;
  subject: string;
  status: 'Present' | 'Absent';
  year: number;
  created_at: string;
  created_by?: string;
};
