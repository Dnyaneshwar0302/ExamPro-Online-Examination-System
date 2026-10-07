import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const BACKEND_URL = 'http://localhost:8080';

function Leaderboard({ onBack }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  const goToDashboard = () => {
    if (onBack) {
      onBack();
      return;
    }
    window.location.href = '/student/dashboard';
  };

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      setError('');
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/student/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const examList = Array.isArray(response.data) ? response.data : [];
      setExams(examList);
      if (examList.length > 0) {
        setSelectedExam(String(examList[0].id));
      }
    } catch (err) {
      console.error('Error loading exams:', err);
      setError('Unable to load examinations.');
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async (examId) => {
    if (!examId) return;

    try {
      setLoadingLeaderboard(true);
      setError('');
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/leaderboard/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setLeaderboard([]);
      setError('Unable to load leaderboard.');
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExam) loadLeaderboard(selectedExam);
  }, [selectedExam, loadLeaderboard]);

  const handleRefresh = () => {
    if (selectedExam) loadLeaderboard(selectedExam);
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds === '') return '--';
    const totalSeconds = Number(seconds);
    if (Number.isNaN(totalSeconds)) return '--';
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStudentName = (student) =>
    student.fullName || student.name || student.username || 'Unknown Student';

  const getMarks = (student) =>
    Number(student.marksObtained ?? student.marks ?? student.score ?? 0);

  const getPercentage = (student) =>
    Number(student.percentage ?? student.scorePercentage ?? 0);

  const filteredLeaderboard = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return leaderboard;

    return leaderboard.filter((student) => {
      const name = getStudentName(student).toLowerCase();
      const username = (student.username || '').toLowerCase();
      return name.includes(search) || username.includes(search);
    });
  }, [leaderboard, searchTerm]);

  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];

  const participantCount = leaderboard.length;
  const topScore = leaderboard.length > 0 ? getMarks(leaderboard[0]) : 0;
  const averageScore = leaderboard.length > 0
    ? (leaderboard.reduce((total, student) => total + getMarks(student), 0) / leaderboard.length).toFixed(1)
    : '0.0';

  const selectedExamObject = exams.find(
    (exam) => String(exam.id) === String(selectedExam)
  );

  const getInitial = (student) =>
    getStudentName(student).charAt(0).toUpperCase();

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    return 'rank-default';
  };

  const renderPodiumCard = (student, rank) => {
    if (!student) return null;
    const percentage = getPercentage(student);

    return (
      <article className={`leaderboard-podium-card ${rank === 1 ? 'podium-winner' : ''}`}>
        <div className={`podium-position ${getRankClass(rank)}`}>
          {rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD'}
        </div>
        <div className="podium-avatar">{getInitial(student)}</div>
        <div className="podium-name">{getStudentName(student)}</div>
        <div className="podium-username">@{student.username || 'student'}</div>
        <div className="podium-score">{getMarks(student)}</div>
        <div className="podium-score-label">MARKS</div>
        <div className="podium-percentage">{percentage.toFixed(1)}%</div>
      </article>
    );
  };

  return (
    <div className="leaderboard-shell">
      <aside className="leaderboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>EXAMPRO</strong>
            <span>Online Examination</span>
          </div>
        </div>

        <div className="sidebar-section-label">STUDENT AREA</div>

        <button className="sidebar-link" onClick={goToDashboard}>
          <span className="sidebar-icon">⌂</span>
          Dashboard
        </button>

        <button className="sidebar-link" onClick={() => { window.location.href = '/student/exams'; }}>
          <span className="sidebar-icon">▣</span>
          My Exams
        </button>

        <button className="sidebar-link" onClick={() => { window.location.href = '/analytics'; }}>
          <span className="sidebar-icon">◈</span>
          Results
        </button>

        <button className="sidebar-link active" type="button">
          <span className="sidebar-icon">◆</span>
          Leaderboard
        </button>

        <button className="sidebar-link" onClick={() => { window.location.href = '/student/certificates'; }}>
          <span className="sidebar-icon">▤</span>
          Certificates
        </button>

        <button className="sidebar-link" onClick={() => { window.location.href = '/student/profile'; }}>
          <span className="sidebar-icon">◉</span>
          My Profile
        </button>

        <button className="sidebar-link" onClick={() => { window.location.href = '/student/settings'; }}>
          <span className="sidebar-icon">⚙</span>
          Settings
        </button>

        <div className="sidebar-spacer" />

        <div className="sidebar-note">
          <span className="sidebar-note-label">EXAMPRO</span>
          <strong>Track your performance.</strong>
          <p>Review rankings and compare examination performance.</p>
        </div>

        <button className="sidebar-link sidebar-logout" onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}>
          <span className="sidebar-icon">↪</span>
          Logout
        </button>
      </aside>

      <main className="leaderboard-main">
        <header className="leaderboard-topbar">
          <div>
            <span className="topbar-kicker">STUDENT PERFORMANCE</span>
            <h1>Leaderboard</h1>
            <p>Review examination rankings, scores and performance insights.</p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={handleRefresh}
              disabled={loadingLeaderboard || !selectedExam}
            >
              <span>↻</span>
              Refresh
            </button>
            <button type="button" className="primary-action" onClick={goToDashboard}>
              <span>←</span>
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="leaderboard-content">
          <section className="control-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">EXAMINATION</span>
                <h2>Select examination</h2>
              </div>
              {selectedExamObject && (
                <span className="selected-pill">Active examination</span>
              )}
            </div>

            <div className="control-grid">
              <div className="field-block">
                <label htmlFor="leaderboard-exam">Examination</label>
                <select
                  id="leaderboard-exam"
                  value={selectedExam}
                  onChange={(event) => setSelectedExam(event.target.value)}
                  disabled={loadingExams}
                >
                  {loadingExams ? (
                    <option value="">Loading examinations...</option>
                  ) : exams.length === 0 ? (
                    <option value="">No examinations available</option>
                  ) : (
                    exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="field-block">
                <label htmlFor="leaderboard-search">Search student</label>
                <div className="search-field">
                  <span>⌕</span>
                  <input
                    id="leaderboard-search"
                    type="text"
                    placeholder="Search by name or username"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {error && <div className="leaderboard-alert">{error}</div>}

          {selectedExamObject && (
            <section className="exam-summary">
              <div className="exam-summary-mark">EX</div>
              <div className="exam-summary-copy">
                <span>SELECTED EXAMINATION</span>
                <h2>{selectedExamObject.title}</h2>
                <p>{selectedExamObject.description || 'Examination performance and student rankings'}</p>
              </div>
              <div className="exam-summary-status">
                <span className="status-dot" />
                Ranking available
              </div>
            </section>
          )}

          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">ST</div>
              <div>
                <span>PARTICIPANTS</span>
                <strong>{participantCount}</strong>
                <small>Total ranked submissions</small>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">01</div>
              <div>
                <span>TOP SCORE</span>
                <strong>{topScore}</strong>
                <small>Highest marks achieved</small>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">AV</div>
              <div>
                <span>AVERAGE SCORE</span>
                <strong>{averageScore}</strong>
                <small>Average marks across students</small>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">RK</div>
              <div>
                <span>RANKED STUDENTS</span>
                <strong>{leaderboard.length}</strong>
                <small>Students in this ranking</small>
              </div>
            </div>
          </section>

          {!loadingLeaderboard && leaderboard.length >= 2 && (
            <section className="performers-section">
              <div className="section-heading-row">
                <div>
                  <span className="section-kicker">PERFORMANCE HIGHLIGHTS</span>
                  <h2>Top performers</h2>
                  <p>Students with the highest recorded scores in this examination.</p>
                </div>
              </div>

              <div className="performers-grid">
                {renderPodiumCard(secondPlace, 2)}
                {renderPodiumCard(firstPlace, 1)}
                {renderPodiumCard(thirdPlace, 3)}
              </div>
            </section>
          )}

          <section className="rankings-section">
            <div className="rankings-header">
              <div>
                <span className="section-kicker">DETAILED RESULTS</span>
                <h2>Student rankings</h2>
                <p>Complete ranking and examination performance.</p>
              </div>
              <div className="ranking-count">{filteredLeaderboard.length} students</div>
            </div>

            {loadingLeaderboard ? (
              <div className="table-state">
                <div className="loader" />
                <strong>Loading leaderboard</strong>
                <span>Fetching the latest examination rankings.</span>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="table-state empty-state">
                <div className="empty-mark">—</div>
                <strong>No results found</strong>
                <span>No student results are available for this examination yet.</span>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="rankings-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>STUDENT</th>
                      <th>USERNAME</th>
                      <th>MARKS</th>
                      <th>PERFORMANCE</th>
                      <th>TIME TAKEN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.map((student, index) => {
                      const rank = student.rank || index + 1;
                      const marks = getMarks(student);
                      const percentage = getPercentage(student);

                      return (
                        <tr key={student.id || student.userId || student.username || index}>
                          <td>
                            <span className={`rank-chip ${getRankClass(rank)}`}>
                              {rank <= 3 ? `0${rank}` : `#${rank}`}
                            </span>
                          </td>
                          <td>
                            <div className="student-profile">
                              <div className="student-avatar">{getInitial(student)}</div>
                              <div>
                                <strong>{getStudentName(student)}</strong>
                                <span>Student</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="username-value">@{student.username || 'student'}</span>
                          </td>
                          <td>
                            <strong className="marks-value">{marks}</strong>
                          </td>
                          <td>
                            <div className="performance-cell">
                              <div className="performance-topline">
                                <span>{percentage.toFixed(1)}%</span>
                              </div>
                              <div className="performance-track">
                                <div
                                  className="performance-fill"
                                  style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="time-value">{formatTime(student.timeTakenSeconds)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="leaderboard-footer">
            <span>EXAMPRO · ONLINE EXAMINATION SYSTEM</span>
            <span>Performance &amp; Ranking</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default Leaderboard;
