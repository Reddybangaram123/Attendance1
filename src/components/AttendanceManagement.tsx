import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSubjectsForYear } from '../utils/yearSubjects';
import { Loader, Plus } from 'lucide-react';
import DailyAttendance from './DailyAttendance';
import AttendanceUpload from './AttendanceUpload';

interface Student {
  id: string;
  roll_no: string;
  name: string;
  year: number;
}

const YEARS = [1, 2, 3, 4];

export default function AttendanceManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [mode, setMode] = useState<'daily' | 'upload'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const subjects = getSubjectsForYear(selectedYear);
    setSelectedSubject(subjects.length > 0 ? subjects[0] : '');
  }, [selectedYear]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('year', { ascending: true })
        .order('roll_no', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Failed to fetch students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const subjects = getSubjectsForYear(selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Daily Attendance
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Upload Attendance
          </button>
        </div>
      </div>

      {mode === 'daily' && (
        <>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Year
                </label>
                <div className="flex gap-2 flex-wrap">
                  {YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedYear === year
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Year {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Subject
                </label>
                {loading ? (
                  <div className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : selectedSubject ? (
              <DailyAttendance
                students={students}
                year={selectedYear}
                subject={selectedSubject}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please select a subject to continue
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'upload' && (
        <div className="bg-white rounded-lg shadow p-6">
          <AttendanceUpload />
        </div>
      )}
    </div>
  );
}
