import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader, Download } from 'lucide-react';

interface StudentAttendance {
  roll_no: string;
  name: string;
  year: number;
  subjects: Record<string, { present: number; total: number; percentage: number }>;
  overallPercentage: number;
}

const YEARS = [1, 2, 3, 4];

export default function AttendanceAnalytics() {
  const [analytics, setAnalytics] = useState<StudentAttendance[]>([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, roll_no, name, year')
        .order('year', { ascending: true })
        .order('roll_no', { ascending: true });

      if (studentsError) throw studentsError;

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('roll_no, subject, status');

      if (attendanceError) throw attendanceError;

      const analyticsMap: Record<string, StudentAttendance> = {};

      (students || []).forEach((student) => {
        analyticsMap[student.roll_no] = {
          roll_no: student.roll_no,
          name: student.name,
          year: student.year,
          subjects: {},
          overallPercentage: 0,
        };
      });

      (attendance || []).forEach((record) => {
        if (!analyticsMap[record.roll_no]) return;

        const student = analyticsMap[record.roll_no];
        if (!student.subjects[record.subject]) {
          student.subjects[record.subject] = {
            present: 0,
            total: 0,
            percentage: 0,
          };
        }

        student.subjects[record.subject].total += 1;
        if (record.status === 'Present') {
          student.subjects[record.subject].present += 1;
        }
      });

      Object.values(analyticsMap).forEach((student) => {
        const subjectPercentages: number[] = [];

        Object.values(student.subjects).forEach((subject) => {
          subject.percentage =
            subject.total > 0 ? (subject.present / subject.total) * 100 : 0;
          subjectPercentages.push(subject.percentage);
        });

        if (subjectPercentages.length > 0) {
          student.overallPercentage =
            subjectPercentages.reduce((a, b) => a + b, 0) /
            subjectPercentages.length;
        }
      });

      setAnalytics(Object.values(analyticsMap));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const yearAnalytics = analytics.filter((a) => a.year === selectedYear);

  const handleExport = () => {
    const csv = [
      ['Roll No', 'Name', 'Year', ...Object.keys(yearAnalytics[0]?.subjects || {}), 'Overall %'],
      ...yearAnalytics.map((student) => [
        student.roll_no,
        student.name,
        student.year,
        ...Object.values(student.subjects).map((s) => s.percentage.toFixed(1)),
        student.overallPercentage.toFixed(1),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-year${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Analytics</h2>
        {yearAnalytics.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
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

      {yearAnalytics.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No students found for Year {selectedYear}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Roll No
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Name
                </th>
                {Object.keys(yearAnalytics[0]?.subjects || {})
                  .sort()
                  .map((subject) => (
                    <th
                      key={subject}
                      className="px-4 py-3 text-center font-semibold text-gray-700"
                    >
                      {subject}
                    </th>
                  ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Overall %
                </th>
              </tr>
            </thead>
            <tbody>
              {yearAnalytics.map((student) => (
                <tr key={student.roll_no} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {student.roll_no}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{student.name}</td>
                  {Object.keys(student.subjects)
                    .sort()
                    .map((subject) => (
                      <td
                        key={`${student.roll_no}-${subject}`}
                        className={`px-4 py-3 text-center font-semibold rounded ${getPercentageColor(
                          student.subjects[subject].percentage
                        )}`}
                      >
                        {student.subjects[subject].percentage.toFixed(1)}%
                      </td>
                    ))}
                  <td
                    className={`px-4 py-3 text-center font-bold rounded ${getPercentageColor(
                      student.overallPercentage
                    )}`}
                  >
                    {student.overallPercentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-green-700 font-semibold">Good Attendance</p>
          <p className="text-green-600">≥ 75%</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-yellow-700 font-semibold">Fair Attendance</p>
          <p className="text-yellow-600">50% - 74%</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-700 font-semibold">Low Attendance</p>
          <p className="text-red-600">&lt; 50%</p>
        </div>
      </div>
    </div>
  );
}
