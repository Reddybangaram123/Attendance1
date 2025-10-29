import { useState } from 'react';
import { supabase, Student } from '../lib/supabase';
import { Save, Plus, X } from 'lucide-react';

interface ManualAttendanceProps {
  students: Student[];
}

interface SubjectEntry {
  subject: string;
  status: 'Present' | 'Absent';
}

export default function ManualAttendance({ students }: ManualAttendanceProps) {
  const [selectedRollNo, setSelectedRollNo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { subject: 'Maths', status: 'Present' },
    { subject: 'Physics', status: 'Present' },
    { subject: 'Chemistry', status: 'Present' },
    { subject: 'English', status: 'Present' },
    { subject: 'Computer Science', status: 'Present' },
    { subject: 'Electronics', status: 'Present' },
    { subject: 'AI', status: 'Present' },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newStudent, setNewStudent] = useState({ rollNo: '', name: '' });
  const [showAddStudent, setShowAddStudent] = useState(false);

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: '', status: 'Present' }]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof SubjectEntry, value: string) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const handleAddStudent = async () => {
    if (!newStudent.rollNo || !newStudent.name) {
      setMessage({ type: 'error', text: 'Please fill in all student details' });
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .insert([{ roll_no: newStudent.rollNo, name: newStudent.name }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Student added successfully!' });
      setNewStudent({ rollNo: '', name: '' });
      setShowAddStudent(false);
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add student' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRollNo) {
      setMessage({ type: 'error', text: 'Please select a student' });
      return;
    }

    if (subjects.some(s => !s.subject.trim())) {
      setMessage({ type: 'error', text: 'All subjects must have a name' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: user } = await supabase.auth.getUser();

      const records = subjects.map(s => ({
        roll_no: selectedRollNo,
        date: selectedDate,
        subject: s.subject,
        status: s.status,
        created_by: user.user?.id,
      }));

      const { error } = await supabase
        .from('attendance_records')
        .insert(records);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Attendance saved successfully!' });

      setSubjects([
        { subject: 'Maths', status: 'Present' },
        { subject: 'Physics', status: 'Present' },
        { subject: 'Chemistry', status: 'Present' },
        { subject: 'English', status: 'Present' },
        { subject: 'Computer Science', status: 'Present' },
        { subject: 'Electronics', status: 'Present' },
        { subject: 'AI', status: 'Present' },
      ]);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save attendance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Add Daily Attendance</h3>
        <button
          onClick={() => setShowAddStudent(!showAddStudent)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {showAddStudent && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-800">New Student</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Roll Number"
              value={newStudent.rollNo}
              onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddStudent}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              Save Student
            </button>
            <button
              onClick={() => setShowAddStudent(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Roll Number</label>
            <select
              value={selectedRollNo}
              onChange={(e) => setSelectedRollNo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.roll_no}>
                  {student.roll_no} - {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Subjects</label>
            <button
              type="button"
              onClick={handleAddSubject}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          {subjects.map((subject, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input
                type="text"
                placeholder="Subject name"
                value={subject.subject}
                onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <select
                value={subject.status}
                onChange={(e) => handleSubjectChange(index, 'status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </form>
    </div>
  );
}
