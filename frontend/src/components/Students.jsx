import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Students.css';

function Students({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const token = localStorage.getItem('token');

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        'http://localhost:8080/api/admin/students',
        { headers }
      );

      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading students:', error);

      alert(
        'Unable to load students: ' +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const departments = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.department)
          .filter(Boolean)
      )
    ].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !term ||
        student.fullName?.toLowerCase().includes(term) ||
        student.username?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.department?.toLowerCase().includes(term);

      const matchesDepartment =
        departmentFilter === 'ALL' ||
        student.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [students, search, departmentFilter]);

  const recentlyActive = students.filter(
    (student) => student.lastLogin
  ).length;

  const getInitials = (name) => {
    if (!name) return 'S';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (value) => {
    if (!value) return 'Never';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (value) => {
    if (!value) return 'Never';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="students-page">
      <div className="students-top-row">
        <button className="students-back-btn" onClick={onBack}>
          ← Dashboard
        </button>

        <button className="students-refresh-btn" onClick={loadStudents}>
          ↻ Refresh
        </button>
      </div>

      <div className="students-heading">
        <div>
          <span>STUDENT MANAGEMENT</span>
          <h2>Students</h2>
          <p>
            View and manage students registered in the ExamPro system.
          </p>
        </div>
      </div>

      <div className="students-stat-grid">
        <div className="students-stat-card purple">
          <span>TOTAL STUDENTS</span>
          <strong>{students.length}</strong>
          <small>Registered student accounts</small>
        </div>

        <div className="students-stat-card green">
          <span>ACTIVE ACCOUNTS</span>
          <strong>{students.length}</strong>
          <small>Student accounts available</small>
        </div>

        <div className="students-stat-card blue">
          <span>LOGGED IN</span>
          <strong>{recentlyActive}</strong>
          <small>Students with login history</small>
        </div>

        <div className="students-stat-card orange">
          <span>DEPARTMENTS</span>
          <strong>{departments.length}</strong>
          <small>Unique departments</small>
        </div>
      </div>

      <div className="students-toolbar">
        <div className="students-search">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, username, email or department..."
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="ALL">All Departments</option>

          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      <div className="students-list-card">
        <div className="students-list-header">
          <div>
            <span>REGISTERED USERS</span>
            <h3>All Students</h3>
          </div>

          <span className="students-count">
            {filteredStudents.length} shown
          </span>
        </div>

        {loading ? (
          <div className="students-empty">
            <div className="students-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="students-empty">
            <div className="students-empty-icon">♙</div>

            <h3>No students found</h3>

            <p>
              {students.length === 0
                ? 'No student accounts have been registered yet.'
                : 'Try changing your search or department filter.'}
            </p>
          </div>
        ) : (
          <div className="students-table-wrap">
            <table className="students-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>EMAIL</th>
                  <th>DEPARTMENT</th>
                  <th>REGISTERED</th>
                  <th>LAST LOGIN</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {getInitials(student.fullName)}
                        </div>

                        <div>
                          <strong>
                            {student.fullName || 'Unnamed Student'}
                          </strong>

                          <span>
                            @{student.username || 'unknown'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="student-email">
                        {student.email || '—'}
                      </span>
                    </td>

                    <td>
                      <span className="department-badge">
                        {student.department || 'Not specified'}
                      </span>
                    </td>

                    <td>
                      <span className="date-value">
                        {formatDate(student.createdAt)}
                      </span>
                    </td>

                    <td>
                      <span className="date-value">
                        {formatDateTime(student.lastLogin)}
                      </span>
                    </td>

                    <td>
                      <span className="status-badge">
                        ● {student.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Students;
