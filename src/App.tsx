import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentAttendance from './components/StudentAttendance';
import { UserCircle, Shield } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold text-gray-800 mb-4">
                    Attendance Management System
                  </h1>
                  <p className="text-xl text-gray-600">
                    Track and manage student attendance efficiently
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Link
                    to="/admin"
                    className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
                    <p className="text-gray-600">
                      Manage attendance records, add students, and upload bulk data
                    </p>
                  </Link>

                  <Link
                    to="/student"
                    className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <UserCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Student View</h2>
                    <p className="text-gray-600">
                      View your attendance records and track your progress
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route path="/student" element={<StudentAttendance />} />
      </Routes>
    </Router>
  );
}

export default App;
