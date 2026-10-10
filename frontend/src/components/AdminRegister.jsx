import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080';

function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
    authorizationCode: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/admin/register`,
        {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          department: formData.department,
          password: formData.password,
          authorizationCode: formData.authorizationCode
        }
      );

      setSuccess(
        'Admin account created successfully. Redirecting to Admin Login...'
      );

      setTimeout(() => {
        navigate('/admin/login');
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Admin registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h2>🛡️ Admin Registration</h2>

        <p
          style={{
            color: '#666',
            marginBottom: '25px'
          }}
        >
          Create an authorized administrator account
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="Admin Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Admin Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Official Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="department"
              placeholder="Department / Organization"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

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

          <div className="form-group">
            <input
              type="password"
              name="authorizationCode"
              placeholder="Admin Authorization Code"
              value={formData.authorizationCode}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Creating Admin Account...'
              : 'Create Admin Account'}
          </button>

        </form>

        <p className="toggle-link">
          Already an admin?{' '}
          <Link to="/admin/login">
            Admin Login
          </Link>
        </p>

        <p className="toggle-link">
          Student?{' '}
          <Link to="/register">
            Student Registration
          </Link>
        </p>

      </div>
    </div>
  );
}

export default AdminRegister;
