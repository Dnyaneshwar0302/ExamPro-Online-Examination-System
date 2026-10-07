import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './ManageExams.css';

const API = 'http://localhost:8080/api';

const getStatus = (exam) => {
  if (!exam?.active) return { label: 'Inactive', className: 'inactive' };

  const now = new Date();
  const start = exam.startTime ? new Date(exam.startTime) : null;
  const end = exam.endTime ? new Date(exam.endTime) : null;

  if (start && now < start) return { label: 'Scheduled', className: 'scheduled' };
  if (start && end && now >= start && now <= end) return { label: 'Active', className: 'active' };
  if (end && now > end) return { label: 'Completed', className: 'completed' };

  return { label: 'Active', className: 'active' };
};

const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function ManageExams({ onBack }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [viewQuestions, setViewQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get(`${API}/admin/exams`, authConfig);
      setExams(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load admin exams:', error);
      setErrorMessage(error.response?.data?.error || 'Unable to load examinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch = !query ||
        String(exam.title || '').toLowerCase().includes(query) ||
        String(exam.description || '').toLowerCase().includes(query);

      const status = getStatus(exam).label.toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [exams, search, statusFilter]);

  const stats = useMemo(() => ({
    total: exams.length,
    active: exams.filter((exam) => getStatus(exam).label === 'Active').length,
    scheduled: exams.filter((exam) => getStatus(exam).label === 'Scheduled').length,
    completed: exams.filter((exam) => getStatus(exam).label === 'Completed').length
  }), [exams]);

  const startEditing = (exam) => {
    setEditingExam({
      id: exam.id,
      title: exam.title || '',
      description: exam.description || '',
      durationMinutes: exam.durationMinutes || 60,
      passingMarks: exam.passingMarks ?? 40,
      startTime: toDateTimeLocal(exam.startTime),
      endTime: toDateTimeLocal(exam.endTime),
      active: exam.active !== false
    });
  };

  const saveExam = async (event) => {
    event.preventDefault();

    if (!editingExam.title.trim()) {
      alert('Please enter an exam title.');
      return;
    }

    if (!editingExam.startTime || !editingExam.endTime) {
      alert('Please select start and end time.');
      return;
    }

    if (new Date(editingExam.endTime) <= new Date(editingExam.startTime)) {
      alert('End time must be after start time.');
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${API}/admin/exams/${editingExam.id}`,
        {
          title: editingExam.title.trim(),
          description: editingExam.description.trim(),
          durationMinutes: Number(editingExam.durationMinutes),
          passingMarks: Number(editingExam.passingMarks),
          startTime: editingExam.startTime,
          endTime: editingExam.endTime,
          active: editingExam.active
        },
        authConfig
      );

      alert('Exam updated successfully!');
      setEditingExam(null);
      await loadExams();
    } catch (error) {
      console.error('Failed to update exam:', error);
      alert(error.response?.data?.error || 'Failed to update exam.');
    } finally {
      setSaving(false);
    }
  };

  const toggleExam = async (exam) => {
    try {
      await axios.put(
        `${API}/admin/exams/${exam.id}`,
        { active: !exam.active },
        authConfig
      );
      await loadExams();
    } catch (error) {
      console.error('Failed to change exam status:', error);
      alert(error.response?.data?.error || 'Failed to change exam status.');
    }
  };

  const deleteExam = async (exam) => {
    const confirmed = window.confirm(
      `Delete "${exam.title}"?\n\nThis cannot be undone. If students have submitted results, the system will keep the exam and ask you to deactivate it instead.`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API}/admin/exams/${exam.id}`, authConfig);
      alert('Exam deleted successfully!');
      await loadExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      alert(error.response?.data?.error || 'Failed to delete exam.');
    }
  };

  const viewExam = async (exam) => {
    setViewingExam(exam);
    setViewQuestions([]);

    try {
      setLoadingQuestions(true);
      const response = await axios.get(`${API}/student/exams/${exam.id}/questions`, authConfig);
      setViewQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <section className="manage-exams-page">
      <div className="manage-topbar">
        <div>
          <button type="button" className="manage-back-btn" onClick={onBack}>
            ← Dashboard
          </button>
          <p className="manage-eyebrow">EXAM MANAGEMENT</p>
          <h2>Manage Examinations</h2>
          <p className="manage-subtitle">
            View, update, activate and manage every examination in ExamPro.
          </p>
        </div>

        <button type="button" className="manage-refresh-btn" onClick={loadExams} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      <div className="manage-stat-grid">
        <div className="manage-stat-card purple-stat">
          <span>Total Exams</span>
          <strong>{stats.total}</strong>
          <small>All examinations</small>
        </div>
        <div className="manage-stat-card green-stat">
          <span>Active</span>
          <strong>{stats.active}</strong>
          <small>Currently running</small>
        </div>
        <div className="manage-stat-card blue-stat">
          <span>Scheduled</span>
          <strong>{stats.scheduled}</strong>
          <small>Upcoming exams</small>
        </div>
        <div className="manage-stat-card orange-stat">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
          <small>Past examinations</small>
        </div>
      </div>

      <div className="manage-toolbar">
        <div className="manage-search-wrap">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search exams by title or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {errorMessage && (
        <div className="manage-error">
          <strong>Unable to load exams.</strong>
          <span>{errorMessage}</span>
          <button type="button" onClick={loadExams}>Try Again</button>
        </div>
      )}

      <div className="manage-list-card">
        <div className="manage-list-header">
          <div>
            <span>EXAMINATIONS</span>
            <h3>All Exams</h3>
          </div>
          <strong>{filteredExams.length} shown</strong>
        </div>

        {loading ? (
          <div className="manage-empty">
            <div className="manage-spinner"></div>
            <h3>Loading examinations...</h3>
            <p>Fetching the latest exam data from the server.</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="manage-empty">
            <div className="manage-empty-icon">▣</div>
            <h3>No examinations found</h3>
            <p>Try changing your search or status filter.</p>
          </div>
        ) : (
          <div className="manage-exam-list">
            {filteredExams.map((exam) => {
              const status = getStatus(exam);
              return (
                <article className="manage-exam-row" key={exam.id}>
                  <div className="manage-exam-title-area">
                    <div className={`manage-status-dot ${status.className}`}></div>
                    <div>
                      <h3>{exam.title || 'Untitled Examination'}</h3>
                      <p>{exam.description || 'No description provided.'}</p>
                      <div className="manage-badges">
                        <span className={`status-badge ${status.className}`}>{status.label}</span>
                        <span>ID #{exam.id}</span>
                        <span>{exam.durationMinutes || 0} min</span>
                        <span>{exam.totalMarks || 0} marks</span>
                        <span>Pass {exam.passingMarks ?? 40}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="manage-exam-schedule">
                    <div><span>START</span><strong>{formatDateTime(exam.startTime)}</strong></div>
                    <div><span>END</span><strong>{formatDateTime(exam.endTime)}</strong></div>
                  </div>

                  <div className="manage-actions">
                    <button type="button" className="view-action" onClick={() => viewExam(exam)}>View</button>
                    <button type="button" className="edit-action" onClick={() => startEditing(exam)}>Edit</button>
                    <button
                      type="button"
                      className={exam.active ? 'disable-action' : 'enable-action'}
                      onClick={() => toggleExam(exam)}
                    >
                      {exam.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="delete-action" onClick={() => deleteExam(exam)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {editingExam && (
        <div className="manage-modal-backdrop" onMouseDown={() => !saving && setEditingExam(null)}>
          <div className="manage-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="manage-modal-header">
              <div>
                <span>EDIT EXAMINATION</span>
                <h3>Update Exam</h3>
              </div>
              <button type="button" onClick={() => !saving && setEditingExam(null)}>×</button>
            </div>

            <form onSubmit={saveExam} className="manage-edit-form">
              <label>Exam Title *</label>
              <input
                value={editingExam.title}
                onChange={(event) => setEditingExam({ ...editingExam, title: event.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                rows="3"
                value={editingExam.description}
                onChange={(event) => setEditingExam({ ...editingExam, description: event.target.value })}
              />

              <div className="manage-edit-grid">
                <div>
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingExam.durationMinutes}
                    onChange={(event) => setEditingExam({ ...editingExam, durationMinutes: event.target.value })}
                  />
                </div>
                <div>
                  <label>Passing Marks (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingExam.passingMarks}
                    onChange={(event) => setEditingExam({ ...editingExam, passingMarks: event.target.value })}
                  />
                </div>
                <div>
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={editingExam.startTime}
                    onChange={(event) => setEditingExam({ ...editingExam, startTime: event.target.value })}
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={editingExam.endTime}
                    onChange={(event) => setEditingExam({ ...editingExam, endTime: event.target.value })}
                  />
                </div>
              </div>

              <label className="manage-active-toggle">
                <input
                  type="checkbox"
                  checked={editingExam.active}
                  onChange={(event) => setEditingExam({ ...editingExam, active: event.target.checked })}
                />
                <span>Exam is active and visible to students</span>
              </label>

              <div className="manage-modal-actions">
                <button type="button" onClick={() => setEditingExam(null)} disabled={saving}>Cancel</button>
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingExam && (
        <div className="manage-modal-backdrop" onMouseDown={() => setViewingExam(null)}>
          <div className="manage-modal view-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="manage-modal-header">
              <div>
                <span>EXAMINATION DETAILS</span>
                <h3>{viewingExam.title}</h3>
              </div>
              <button type="button" onClick={() => setViewingExam(null)}>×</button>
            </div>

            <div className="view-summary-grid">
              <div><span>Status</span><strong>{getStatus(viewingExam).label}</strong></div>
              <div><span>Duration</span><strong>{viewingExam.durationMinutes || 0} minutes</strong></div>
              <div><span>Total Marks</span><strong>{viewingExam.totalMarks || 0}</strong></div>
              <div><span>Passing</span><strong>{viewingExam.passingMarks ?? 40}%</strong></div>
              <div><span>Start</span><strong>{formatDateTime(viewingExam.startTime)}</strong></div>
              <div><span>End</span><strong>{formatDateTime(viewingExam.endTime)}</strong></div>
            </div>

            <div className="view-description">
              <span>DESCRIPTION</span>
              <p>{viewingExam.description || 'No description provided.'}</p>
            </div>

            <div className="view-questions">
              <div className="view-question-heading">
                <div><span>QUESTION PAPER</span><h4>Questions</h4></div>
                <strong>{loadingQuestions ? '...' : `${viewQuestions.length} questions`}</strong>
              </div>

              {loadingQuestions ? (
                <p className="view-loading">Loading questions...</p>
              ) : viewQuestions.length === 0 ? (
                <p className="view-loading">No questions available.</p>
              ) : (
                viewQuestions.map((question, index) => (
                  <div className="view-question" key={question.id || index}>
                    <div className="view-question-number">{String(index + 1).padStart(2, '0')}</div>
                    <div>
                      <strong>{question.questionText}</strong>
                      <span>{question.questionType === 'MCQ' ? 'Multiple Choice' : 'Coding'} · {question.marks || 0} marks</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageExams;
