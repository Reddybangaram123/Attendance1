import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Search, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  roll_no: string;
  name: string;
  year: number;
}

interface AttendanceRecord {
  roll_no: string;
  status: 'Present' | 'Absent';
}

interface Props {
  students: Student[];
  year: number;
  subject: string;
}

export default function DailyAttendance({ students, year, subject }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [markAll, setMarkAll] = useState<'Present' | 'Absent' | null>(null);

  const yearStudents = useMemo(
    () => students.filter((s) => s.year === year),
    [students, year]
  );

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return yearStudents;
    const term = searchTerm.toLowerCase();
    return yearStudents.filter(
      (s) =>
        s.roll_no.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
    );
  }, [yearStudents, searchTerm]);

  const handleToggleAttendance = (rollNo: string) => {
    setAttendance((prev) => ({
      ...prev,
      [rollNo]: prev[rollNo] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const newAttendance: Record<string, 'Present' | 'Absent'> = {};
    filteredStudents.forEach((student) => {
      newAttendance[student.roll_no] = status;
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
    setMarkAll(status);
  };

  const handleSubmit = async () => {
    if (filteredStudents.length === 0) {
      setMessage({ type: 'error', text: 'No students to mark attendance' });
      return;
    }

    const recordsToSubmit = filteredStudents
      .map((student) => ({
        roll_no: student.roll_no,
        date,
        subject,
        status: attendance[student.roll_no] || 'Present',
        year,
      }))
      .filter((record) => record.roll_no);

    if (recordsToSubmit.length === 0) {
      setMessage({ type: 'error', text: 'Please mark attendance for at least one student' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from('attendance_records').insert(
        recordsToSubmit.map((record) => ({
          ...record,
          created_by: user.user?.id,
        }))
      );

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Attendance saved for ${recordsToSubmit.length} students!`,
      });
      setAttendance({});
      setSearchTerm('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save attendance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg flex gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <input
            type="text"
            value={`Year ${year}`}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by roll number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No students match your search' : 'No students in this year'}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{student.name}</p>
                <p className="text-sm text-gray-600">{student.roll_no}</p>
              </div>
              <button
                onClick={() => handleToggleAttendance(student.roll_no)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  attendance[student.roll_no] === 'Absent'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {attendance[student.roll_no] === 'Absent' ? 'Absent' : 'Present'}
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || filteredStudents.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Save Attendance ({filteredStudents.length} students)</span>
          </>
        )}
      </button>
    </div>
  );
}
