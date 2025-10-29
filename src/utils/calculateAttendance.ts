import { AttendanceRecord } from '../lib/supabase';

export const calculateDailyAttendance = (records: AttendanceRecord[]) => {
  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  return {
    present,
    total,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0
  };
};

export const calculateOverallAttendance = (records: AttendanceRecord[]) => {
  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  return {
    present,
    total,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0
  };
};
