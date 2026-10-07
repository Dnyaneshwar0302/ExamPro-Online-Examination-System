import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import './theme.css';

import Login from './components/Login';
import Register from './components/Register';
import AdminRegister from './components/AdminRegister';
import LandingPage from './components/LandingPage';

import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import MyExams from './components/MyExams';

import ExamRoom from './components/ExamRoom';
import Leaderboard from './components/Leaderboard';
import Analytics from './components/Analytics';
import Certificates from './components/Certificates';
import MyProfile from './components/MyProfile';
import StudentSettings from './components/StudentSettings';

import './App.css';


// ============================================================
// PRIVATE ROUTE
// ============================================================

function PrivateRoute({ children, role }) {

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role protection
  if (role && userRole !== role) {

    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (userRole === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}


// ============================================================
// APP
// ============================================================

function App() {

  return (
    <Router>

      <div className="App">

        <Routes>

          {/* ==================================================
              EXAMPRO LANDING PAGE
          ================================================== */}

          <Route
            path="/"
            element={<LandingPage />}
          />


          {/* ==================================================
              STUDENT LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              STUDENT REGISTRATION
          ================================================== */}

          <Route
            path="/register"
            element={<Register />}
          />


          {/* ==================================================
              ADMIN REGISTRATION
          ================================================== */}

          <Route
            path="/admin/register"
            element={<AdminRegister />}
          />


          {/* ==================================================
              ADMIN LOGIN
          ================================================== */}

          <Route
            path="/admin/login"
            element={<Login adminMode={true} />}
          />


          {/* ==================================================
              STUDENT DASHBOARD
          ================================================== */}

          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute role="STUDENT">
                <Dashboard />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              STUDENT MY EXAMS
          ================================================== */}

          <Route
            path="/student/exams"
            element={
              <PrivateRoute role="STUDENT">
                <MyExams />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              STUDENT CERTIFICATES
          ================================================== */}

          <Route
            path="/student/certificates"
            element={
              <PrivateRoute role="STUDENT">
                <Certificates />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              STUDENT MY PROFILE
          ================================================== */}

          <Route
            path="/student/profile"
            element={
              <PrivateRoute role="STUDENT">
                <MyProfile />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              STUDENT SETTINGS
          ================================================== */}

          <Route
            path="/student/settings"
            element={
              <PrivateRoute role="STUDENT">
                <StudentSettings />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              ADMIN DASHBOARD
          ================================================== */}

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              EXAM ROOM
          ================================================== */}

          <Route
            path="/exam/:examId"
            element={
              <PrivateRoute role="STUDENT">
                <ExamRoom />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              LEADERBOARD
          ================================================== */}

          <Route
            path="/leaderboard/:examId"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              ANALYTICS
          ================================================== */}

          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />


          {/* ==================================================
              UNKNOWN URL
          ================================================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </div>

    </Router>
  );
}

export default App;
