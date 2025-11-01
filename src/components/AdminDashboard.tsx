import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Calendar, BarChart3, Users } from 'lucide-react';
import AttendanceManagement from './AttendanceManagement';
import ManageStudents from './ManageStudents';
import StudentBulkUpload from './StudentBulkUpload';
import AttendanceAnalytics from './AttendanceAnalytics';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'analytics'>('attendance');

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
            <AttendanceManagement />
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
