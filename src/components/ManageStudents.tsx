import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Loader, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  roll_no: string;
  name: string;
  year: number;
  created_at: string;
}

const YEARS = [1, 2, 3, 4];

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    roll_no: '',
    name: '',
    year: 1,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('year', { ascending: true })
        .order('roll_no', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roll_no.trim() || !formData.name.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setAdding(true);
      setError('');
      setSuccess('');

      const { error } = await supabase.from('students').insert([
        {
          roll_no: formData.roll_no.trim(),
          name: formData.name.trim(),
          year: formData.year,
        },
      ]);

      if (error) throw error;

      setSuccess('Student added successfully!');
      setFormData({ roll_no: '', name: '', year: 1 });
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) throw error;

      setSuccess('Student deleted successfully!');
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleDeleteAllYearStudents = async () => {
    const confirmCount = window.prompt(
      `Are you sure you want to delete ALL ${yearStudents.length} students from Year ${selectedYear}? Type the number ${yearStudents.length} to confirm:`
    );

    if (confirmCount !== String(yearStudents.length)) {
      setError('Deletion cancelled');
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('year', selectedYear);

      if (error) throw error;

      setSuccess(`Successfully deleted all ${yearStudents.length} students from Year ${selectedYear}!`);
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete students');
    } finally {
      setDeleting(false);
    }
  };

  const yearStudents = useMemo(
    () => students.filter((s) => s.year === selectedYear),
    [students, selectedYear]
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Students</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Student</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={formData.roll_no}
                  onChange={(e) =>
                    setFormData({ ...formData, roll_no: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 21A91A01A1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                <span>{adding ? 'Adding...' : 'Add Student'}</span>
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">View Students by Year</h3>
              {yearStudents.length > 0 && (
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {yearStudents.length} students
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-medium transition border-2 ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  Year {year}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : yearStudents.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No students found for Year {selectedYear}
              </p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {yearStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.roll_no}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition flex-shrink-0 ml-2"
                        title="Delete student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDeleteAllYearStudents}
                  disabled={deleting || yearStudents.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Delete All {yearStudents.length} Students</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
