import React, { useState } from 'react';

import {
  useNavigate,
  Link,
  useLocation
} from 'react-router-dom';

import axios from 'axios';


function Login({ adminMode = false }) {

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const loginUrl = adminMode
        ? 'http://localhost:8080/api/auth/admin/login'
        : 'http://localhost:8080/api/auth/login';


      const response = await axios.post(
        loginUrl,
        formData
      );


      const {
        token,
        role,
        username,
        fullName,
        userId,
        email,
        department
      } = response.data;


      // ========================================================
      // SECURITY CHECK
      // ========================================================

      if (adminMode && role !== 'ADMIN') {

        setError(
          'This account does not have administrator access.'
        );

        setLoading(false);

        return;
      }


      if (!adminMode && role !== 'STUDENT') {

        setError(
          'Please use the administrator login for this account.'
        );

        setLoading(false);

        return;
      }


      // ========================================================
      // SAVE USER SESSION
      // ========================================================

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      localStorage.setItem('fullName', fullName || '');
      localStorage.setItem('userId', userId);
      localStorage.setItem('email', email || '');
      localStorage.setItem('department', department || '');


      // ========================================================
      // REDIRECT
      // ========================================================

      if (role === 'ADMIN') {

        navigate('/admin/dashboard');

      } else if (role === 'STUDENT') {

        navigate('/student/dashboard');

      } else {

        setError(
          'Unknown account role. Please contact administrator.'
        );
      }


    } catch (error) {

      setError(
        error.response?.data?.error ||
        'Login failed. Please check your username and password.'
      );

    } finally {

      setLoading(false);
    }
  };


  // ============================================================
  // SWITCH LOGIN MODE
  // ============================================================

  const switchMode = () => {

    if (adminMode) {

      navigate('/login');

    } else {

      navigate('/admin/login');
    }
  };


  return (

    <div className="auth-container">

      <div className="auth-box">

        {/* ======================================================
            TITLE
        ====================================================== */}

        <h2>
          {adminMode
            ? '🛡️ Admin Portal'
            : '🎓 Exam Portal'}
        </h2>


        <p
          style={{
            color: '#666',
            marginBottom: '25px'
          }}
        >
          {adminMode
            ? 'Administrator Login'
            : 'Student Login'}
        </p>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* ======================================================
            LOGIN FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value
                })
              }
              required
            />

          </div>


          <div className="form-group">

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              required
            />

          </div>


          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >

            {loading
              ? 'Logging in...'
              : adminMode
                ? 'Admin Login'
                : 'Student Login'}

          </button>

        </form>


        {/* ======================================================
            STUDENT REGISTRATION
        ====================================================== */}

        {!adminMode && (

          <p className="toggle-link">

            Don't have a student account?{' '}

            <Link to="/register">
              Register here
            </Link>

          </p>

        )}


        {/* ======================================================
            ADMIN REGISTRATION
        ====================================================== */}

        {adminMode && (

          <p className="toggle-link">

            Need to create an admin account?{' '}

            <Link to="/admin/register">
              Admin Registration
            </Link>

          </p>

        )}


        {/* ======================================================
            SWITCH LOGIN
        ====================================================== */}

        <p
          className="toggle-link"
          style={{ marginTop: '15px' }}
        >

          {adminMode
            ? 'Are you a student? '
            : 'Administrator? '}

          <button
            type="button"
            onClick={switchMode}
            style={{
              border: 'none',
              background: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: '600',
              padding: 0
            }}
          >

            {adminMode
              ? 'Student Login'
              : 'Admin Login'}

          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;