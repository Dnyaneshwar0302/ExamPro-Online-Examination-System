import React, { useState } from 'react';

import {
  useNavigate,
  Link
} from 'react-router-dom';

import axios from 'axios';


function Register() {

  const navigate = useNavigate();


  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({

    fullName: '',
    email: '',
    username: '',
    department: '',
    password: '',
    confirmPassword: ''

  });


  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });
  };


  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');


    // ========================================================
    // PASSWORD VALIDATION
    // ========================================================

    if (formData.password !== formData.confirmPassword) {

      setError('Passwords do not match.');

      return;
    }


    if (formData.password.length < 6) {

      setError(
        'Password must contain at least 6 characters.'
      );

      return;
    }


    // ========================================================
    // START LOADING
    // ========================================================

    setLoading(true);


    try {

      /*
       * IMPORTANT:
       *
       * We deliberately DO NOT send a role here.
       *
       * The backend automatically assigns:
       *
       * STUDENT
       */

      await axios.post(
        'http://localhost:8080/api/auth/register',
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          username: formData.username.trim(),
          department: formData.department.trim(),
          password: formData.password
        }
      );


      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        'Student registration successful! Redirecting to login...'
      );


      // Clear form

      setFormData({

        fullName: '',
        email: '',
        username: '',
        department: '',
        password: '',
        confirmPassword: ''

      });


      // Redirect

      setTimeout(() => {

        navigate('/login');

      }, 2000);


    } catch (error) {

      setError(

        error.response?.data?.error ||

        'Registration failed. Please try again.'

      );

    } finally {

      setLoading(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="auth-container">

      <div className="auth-box">


        {/* ====================================================
            HEADER
        ==================================================== */}

        <h2>
          🎓 Student Registration
        </h2>


        <p
          style={{
            color: '#666',
            marginBottom: '25px'
          }}
        >
          Create your student account
        </p>


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {success && (

          <div className="success-message">

            {success}

          </div>

        )}


        {/* ====================================================
            FORM
        ==================================================== */}

        <form onSubmit={handleSubmit}>


          {/* FULL NAME */}

          <div className="form-group">

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          {/* USERNAME */}

          <div className="form-group">

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />

          </div>


          {/* DEPARTMENT */}

          <div className="form-group">

            <input
              type="text"
              name="department"
              placeholder="Department / Course"
              value={formData.department}
              onChange={handleChange}
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>


          {/* ==================================================
              STUDENT ROLE INFORMATION
          ================================================== */}

          <div
            style={{
              background: '#f0f7ff',
              border: '1px solid #cfe3ff',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '18px',
              color: '#24527a',
              fontSize: '14px'
            }}
          >

            🎓 This registration is for
            <strong> Student accounts only.</strong>

          </div>


          {/* ==================================================
              REGISTER BUTTON
          ================================================== */}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >

            {loading
              ? 'Creating Student Account...'
              : 'Create Student Account'}

          </button>


        </form>


        {/* ====================================================
            LOGIN LINK
        ==================================================== */}

        <p className="toggle-link">

          Already have a student account?{' '}

          <Link to="/login">
            Student Login
          </Link>

        </p>


        {/* ====================================================
            ADMIN LINK
        ==================================================== */}

        <p className="toggle-link">

          Administrator?{' '}

          <Link to="/admin/register">
            Admin Registration
          </Link>

        </p>


      </div>

    </div>

  );
}


export default Register;