import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Upload, Plus, Calendar, BarChart3, Users } from 'lucide-react';
import AttendanceUpload from './AttendanceUpload';
import ManualAttendance from './ManualAttendance';
import ManageStudents from './ManageStudents';
import StudentBulkUpload from './StudentBulkUpload';
import AttendanceAnalytics from './AttendanceAnalytics';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'analytics'>('attendance');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'manual' | 'upload'>('manual');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Manage Students</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>
        </div>

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h2>

            <div className="flex space-x-4 mb-6 border-b">
              <button
                onClick={() => setAttendanceSubTab('manual')}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition border-b-2 ${
                  attendanceSubTab === 'manual'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>Manual Entry</span>
              </button>
              <button
                onClick={() => setAttendanceSubTab('upload')}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition border-b-2 ${
                  attendanceSubTab === 'upload'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Excel/CSV</span>
              </button>
            </div>

            {attendanceSubTab === 'manual' ? (
              <ManualAttendance />
            ) : (
              <AttendanceUpload />
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <StudentBulkUpload />
            <ManageStudents />
          </div>
        )}

        {activeTab === 'analytics' && (
          <AttendanceAnalytics />
        )}
      </div>
    </div>
  );
}
