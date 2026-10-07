import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentAccount.css';
import './CertificateDesign.css';

function CertificatesPage() {
  const navigate = useNavigate();

  const fullName =
    localStorage.getItem('fullName') ||
    localStorage.getItem('username') ||
    'Student';

  const username = localStorage.getItem('username') || '';

  const [certificates, setCertificates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedCertificate, setSelectedCertificate] = React.useState(null);

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S';

  const loadCertificates = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:8080/api/student/results',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to load examination results.');
      }

      const data = await response.json();

      setCertificates(
        Array.isArray(data)
          ? data.filter(
              (result) =>
                result.passed === true || result.passed === 'true'
            )
          : []
      );
    } catch (err) {
      console.error('Certificate loading error:', err);
      setError(err.message || 'Unable to load certificates.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const getExamTitle = (certificate) =>
    certificate?.exam?.title ||
    certificate?.exam?.examName ||
    certificate?.examTitle ||
    'Completed Examination';

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
  };

  const getPercentage = (certificate) =>
    Number(certificate?.percentage ?? 0).toFixed(1);

  const getDescription = (certificate) => {
    const percentage = Number(certificate?.percentage ?? 0);

    if (percentage >= 90) {
      return 'This certificate is awarded in recognition of outstanding performance and successful completion of the examination requirements with exceptional achievement.';
    }

    if (percentage >= 75) {
      return 'This certificate is awarded in recognition of excellent performance and successful completion of the examination requirements.';
    }

    return 'This certificate is awarded in recognition of successful completion of the examination requirements and demonstrated commitment to learning and professional development.';
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="student-account-page">
      <div className="student-account-shell">
        <aside className="account-sidebar">
          <div className="account-brand">
            <div className="account-brand-mark">E</div>
            <div>
              <strong>ExamPro</strong>
              <span>Student Portal</span>
            </div>
          </div>

          <div className="account-nav-label">STUDENT AREA</div>

          <nav className="account-nav">
            <button
              className=""
              onClick={() => navigate('/student/dashboard')}
              type="button"
            >
              <span className="account-nav-icon">▦</span>
              Dashboard
            </button>

            <button
              className=""
              onClick={() => navigate('/student/exams')}
              type="button"
            >
              <span className="account-nav-icon">▤</span>
              My Exams
            </button>

            <button
              className=""
              onClick={() => navigate('/analytics')}
              type="button"
            >
              <span className="account-nav-icon">▥</span>
              Results
            </button>

            <button
              className=""
              onClick={() => navigate('/leaderboard/1')}
              type="button"
            >
              <span className="account-nav-icon">◆</span>
              Leaderboard
            </button>

            <button
              className="active"
              onClick={() => navigate('/student/certificates')}
              type="button"
            >
              <span className="account-nav-icon">▣</span>
              Certificates
            </button>

            <button
              className=""
              onClick={() => navigate('/student/profile')}
              type="button"
            >
              <span className="account-nav-icon">◉</span>
              My Profile
            </button>

            <button
              className=""
              onClick={() => navigate('/student/settings')}
              type="button"
            >
              <span className="account-nav-icon">⚙</span>
              Settings
            </button>
          </nav>

          <div className="account-sidebar-bottom">
            <div className="account-help">
              <strong>Need Help?</strong>
              <span>
                Contact your examination administrator for assistance.
              </span>
            </div>

            <button
              className="account-logout"
              onClick={handleLogout}
              type="button"
            >
              ↪ &nbsp; Logout
            </button>
          </div>
        </aside>

        <main className="account-main">
          <header className="account-header">
            <div>
              <p className="account-header-kicker">STUDENT PORTAL</p>
              <h1>Certificates</h1>
              <p>
                View certificates associated with your completed examinations.
              </p>
            </div>

            <div className="account-user">
              <div className="account-user-copy">
                <strong>{fullName}</strong>
                <span>@{username || 'student'}</span>
              </div>
              <div className="account-user-avatar">{initials}</div>
            </div>
          </header>

          <div className="account-content">
            <section className="account-intro">
              <span className="account-intro-label">ACHIEVEMENTS</span>
              <h2>Certificates</h2>
              <p>
                Access your official examination certificates. Open a
                certificate to view the achievement design, performance
                details, issue date and professional recognition statement.
              </p>
            </section>

            <div className="certificate-toolbar">
              <span className="certificate-count">
                {loading
                  ? 'Loading certificates…'
                  : `${certificates.length} certificate${
                      certificates.length === 1 ? '' : 's'
                    }`}
              </span>

              <button
                className="account-button"
                type="button"
                onClick={loadCertificates}
              >
                ↻ Refresh
              </button>
            </div>

            {error && (
              <div
                className="account-alert"
                style={{
                  background: '#fff7ed',
                  borderColor: '#fed7aa',
                  color: '#9a5a16',
                  margin: '0 0 16px'
                }}
              >
                {error}
              </div>
            )}

            {!loading && certificates.length === 0 && (
              <div className="empty-account">
                <div className="empty-account-icon">▣</div>
                <h3>No certificates available</h3>
                <p>
                  There are currently no passed examination results available
                  for certificate display.
                </p>
              </div>
            )}

            {!loading && certificates.length > 0 && (
              <section className="certificate-grid">
                {certificates.map((certificate, index) => (
                  <article
                    className="certificate-card"
                    key={`${
                      certificate.id ||
                      certificate.exam?.id ||
                      'certificate'
                    }-${index}`}
                  >
                    <div className="certificate-top">
                      <div className="certificate-emblem">✓</div>
                      <div>
                        <strong>EXAMPRO CERTIFICATE</strong>
                        <span>Certificate of Achievement</span>
                      </div>
                    </div>

                    <div className="certificate-body">
                      <h3>{getExamTitle(certificate)}</h3>

                      <p>
                        Presented to <strong>{fullName}</strong> for
                        successfully completing the examination.
                      </p>

                      <div className="certificate-meta">
                        <div>
                          <span>Score</span>
                          <strong>
                            {certificate.marksObtained ?? 0}/
                            {certificate.totalMarks ?? 0}
                          </strong>
                        </div>

                        <div>
                          <span>Percentage</span>
                          <strong>{getPercentage(certificate)}%</strong>
                        </div>

                        <div>
                          <span>Date</span>
                          <strong>
                            {formatDate(certificate.submissionTime)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="certificate-actions">
                      <button
                        className="account-button primary"
                        type="button"
                        onClick={() =>
                          setSelectedCertificate(certificate)
                        }
                      >
                        View Certificate
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {selectedCertificate && (
              <div
                className="certificate-modal"
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedCertificate(null);
                  }
                }}
              >
                <div className="certificate-sheet">
                  <div className="certificate-top-shape" />
                  <div className="certificate-corner certificate-corner-left" />
                  <div className="certificate-corner certificate-corner-right" />

                  <div className="certificate-content">
                    <div className="certificate-brand">
                      <span className="certificate-brand-mark">E</span>
                      <span>EXAMPRO · ONLINE EXAMINATION SYSTEM</span>
                    </div>

                    <div className="certificate-medal" aria-hidden="true">
                      <div className="certificate-medal-ring">
                        <span>★</span>
                      </div>
                      <i />
                      <b />
                    </div>

                    <p className="certificate-kicker">
                      OFFICIAL CERTIFICATE
                    </p>

                    <h2>Certificate of Achievement</h2>

                    <div className="certificate-rule">
                      <span />
                      <span />
                      <span />
                    </div>

                    <p className="certificate-presented">
                      This certificate is proudly presented to
                    </p>

                    <h3 className="certificate-recipient">
                      {fullName}
                    </h3>

                    <p className="certificate-recognition">
                      for successfully completing the examination
                    </p>

                    <h4 className="certificate-exam-title">
                      {getExamTitle(selectedCertificate)}
                    </h4>

                    <p className="certificate-description">
                      {getDescription(selectedCertificate)}
                    </p>

                    <div className="certificate-performance">
                      <div>
                        <span>EXAMINATION SCORE</span>
                        <strong>
                          {selectedCertificate.marksObtained ?? 0} /{' '}
                          {selectedCertificate.totalMarks ?? 0}
                        </strong>
                      </div>

                      <div className="certificate-percentage">
                        <span>FINAL RESULT</span>
                        <strong>
                          {getPercentage(selectedCertificate)}%
                        </strong>
                      </div>

                      <div>
                        <span>DATE OF ISSUE</span>
                        <strong>
                          {formatDate(selectedCertificate.submissionTime)}
                        </strong>
                      </div>
                    </div>

                    <div className="certificate-footer">
                      <div className="certificate-signature">
                        <div className="signature-line" />
                        <strong>Examination Authority</strong>
                        <span>ExamPro Student Portal</span>
                      </div>

                      <div className="certificate-seal">
                        <div>EP</div>
                        <span>VERIFIED</span>
                      </div>

                      <div className="certificate-signature">
                        <div className="signature-line" />
                        <strong>Academic Assessment</strong>
                        <span>Online Examination System</span>
                      </div>
                    </div>

                    <div className="certificate-id">
                      Certificate of successful examination completion
                    </div>

                    <div className="certificate-modal-actions">
                      <button
                        className="account-button"
                        type="button"
                        onClick={() => setSelectedCertificate(null)}
                      >
                        Close
                      </button>

                      <button
                        className="account-button primary"
                        type="button"
                        onClick={() => window.print()}
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CertificatesPage;
