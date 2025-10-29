import { useState } from 'react';
import { supabase, AttendanceRecord, Student } from '../lib/supabase';
import { Search, User, Calendar, BarChart3 } from 'lucide-react';
import { calculateDailyAttendance, calculateOverallAttendance } from '../utils/calculateAttendance';

interface GroupedAttendance {
  [date: string]: AttendanceRecord[];
}

export default function StudentAttendance() {
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<GroupedAttendance>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rollNo.trim()) {
      setError('Please enter a roll number');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setAttendanceRecords([]);
    setGroupedRecords({});
    setSelectedDate('');

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_no', rollNo.trim())
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        setError('No record found.');
        return;
      }

      setStudent(studentData);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('roll_no', rollNo.trim())
        .order('date', { ascending: false })
        .order('subject');

      if (attendanceError) throw attendanceError;

      setAttendanceRecords(attendanceData || []);

      const grouped: GroupedAttendance = {};
      (attendanceData || []).forEach(record => {
        if (!grouped[record.date]) {
          grouped[record.date] = [];
        }
        grouped[record.date].push(record);
      });

      setGroupedRecords(grouped);

      const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const overallStats = calculateOverallAttendance(attendanceRecords);
  const dailyRecords = selectedDate ? groupedRecords[selectedDate] || [] : [];
  const dailyStats = calculateDailyAttendance(dailyRecords);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Attendance Tracker</h1>
              <p className="text-gray-600 text-sm">View your attendance records and statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Roll Number
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g., 21A91A01A1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {student && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                    <p className="text-gray-600">Roll No: {student.roll_no}</p>
                  </div>
                </div>

                <div className={`px-6 py-3 rounded-lg text-center ${
                  overallStats.percentage >= 75
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-red-100 border-2 border-red-500'
                }`}>
                  <p className="text-sm font-medium text-gray-700">Overall Attendance</p>
                  <p className={`text-3xl font-bold ${
                    overallStats.percentage >= 75 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {overallStats.percentage}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {overallStats.present}/{overallStats.total} classes
                  </p>
                </div>
              </div>

              {Object.keys(groupedRecords).length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a)).map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {dailyRecords.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Daily Attendance - {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Daily Attendance</p>
                    <p className="text-2xl font-bold text-blue-600">{dailyStats.percentage}%</p>
                    <p className="text-xs text-gray-500">{dailyStats.present}/{dailyStats.total} classes</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className={`${
                            record.status === 'Present'
                              ? 'bg-green-50 hover:bg-green-100'
                              : 'bg-red-50 hover:bg-red-100'
                          } transition`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-4 py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'Present'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-200 text-red-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{dailyStats.present}</p>
                      <p className="text-sm text-gray-600">Classes Attended</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{dailyStats.total}</p>
                      <p className="text-sm text-gray-600">Total Classes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{dailyStats.percentage}%</p>
                      <p className="text-sm text-gray-600">Attendance Percentage</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {attendanceRecords.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records found for this student.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
