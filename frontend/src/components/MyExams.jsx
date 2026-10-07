import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

function MyExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  // ------------------------------------------------------------
  // EXISTING DATA FETCHING - UNCHANGED
  // ------------------------------------------------------------
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_BASE_URL}/api/student/exams`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const examData = Array.isArray(response.data)
        ? response.data
        : response.data?.exams || [];

      setExams(examData);
    } catch (err) {
      console.error('Failed to fetch exams:', err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to load your exams. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // EXISTING STATUS LOGIC - UNCHANGED
  // ------------------------------------------------------------
  const getExamStatus = (exam) => {
    const now = new Date();

    const startDate = exam.startTime
      ? new Date(exam.startTime)
      : exam.startDate
        ? new Date(exam.startDate)
        : null;

    const endDate = exam.endTime
      ? new Date(exam.endTime)
      : exam.endDate
        ? new Date(exam.endDate)
        : null;

    if (startDate && now < startDate) {
      return 'SCHEDULED';
    }

    if (endDate && now > endDate) {
      return 'CLOSED';
    }

    return 'AVAILABLE';
  };

  // ------------------------------------------------------------
  // EXISTING SEARCH / FILTER / SORT - UNCHANGED
  // ------------------------------------------------------------
  const filteredExams = useMemo(() => {
    let result = [...exams];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((exam) => {
        const title = String(
          exam.title ||
          exam.examName ||
          exam.name ||
          ''
        ).toLowerCase();

        const description = String(
          exam.description || ''
        ).toLowerCase();

        const subject = String(
          exam.subject || ''
        ).toLowerCase();

        return (
          title.includes(search) ||
          description.includes(search) ||
          subject.includes(search)
        );
      });
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(
        (exam) => getExamStatus(exam) === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        const dateA = new Date(
          a.createdAt ||
          a.startTime ||
          a.startDate ||
          0
        );

        const dateB = new Date(
          b.createdAt ||
          b.startTime ||
          b.startDate ||
          0
        );

        return dateB - dateA;
      }

      if (sortBy === 'OLDEST') {
        const dateA = new Date(
          a.createdAt ||
          a.startTime ||
          a.startDate ||
          0
        );

        const dateB = new Date(
          b.createdAt ||
          b.startTime ||
          b.startDate ||
          0
        );

        return dateA - dateB;
      }

      if (sortBy === 'TITLE') {
        const titleA = String(
          a.title ||
          a.examName ||
          a.name ||
          ''
        );

        const titleB = String(
          b.title ||
          b.examName ||
          b.name ||
          ''
        );

        return titleA.localeCompare(titleB);
      }

      return 0;
    });

    return result;
  }, [exams, searchTerm, statusFilter, sortBy]);

  // ------------------------------------------------------------
  // EXISTING START EXAM LOGIC - UNCHANGED
  // ------------------------------------------------------------
  const handleStartExam = (exam) => {
    const status = getExamStatus(exam);

    if (status !== 'AVAILABLE') {
      return;
    }

    if (!exam.id) {
      alert('Exam ID is missing.');
      return;
    }

    navigate(`/exam/${exam.id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Not specified';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Not specified';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (exam) => {
    const duration =
      exam.duration ??
      exam.durationMinutes ??
      exam.timeLimit ??
      exam.timeLimitMinutes;

    if (!duration) {
      return 'Not specified';
    }

    return `${duration} min`;
  };

  const getQuestionCount = (exam) => {
    return (
      exam.totalQuestions ??
      exam.questionCount ??
      exam.numberOfQuestions ??
      exam.questions?.length ??
      0
    );
  };

  const getTotalMarks = (exam) => {
    return (
      exam.totalMarks ??
      exam.maxMarks ??
      exam.marks ??
      0
    );
  };

  const getPassingMarks = (exam) => {
    return (
      exam.passingMarks ??
      exam.passMarks ??
      exam.minimumMarks ??
      0
    );
  };

  const getStatusLabel = (status) => {
    if (status === 'AVAILABLE') return 'Available';
    if (status === 'SCHEDULED') return 'Scheduled';
    if (status === 'CLOSED') return 'Closed';
    return status;
  };

  const getStatusStyle = (status) => {
    if (status === 'AVAILABLE') return styles.statusAvailable;
    if (status === 'SCHEDULED') return styles.statusScheduled;
    return styles.statusClosed;
  };

  const statusCounts = useMemo(() => ({
    total: exams.length,
    available: exams.filter(
      (exam) => getExamStatus(exam) === 'AVAILABLE'
    ).length,
    scheduled: exams.filter(
      (exam) => getExamStatus(exam) === 'SCHEDULED'
    ).length,
    closed: exams.filter(
      (exam) => getExamStatus(exam) === 'CLOSED'
    ).length
  }), [exams]);

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar navigate={navigate} handleLogout={handleLogout} />

        <main style={styles.main}>
          <div style={styles.loadingShell}>
            <div style={styles.loadingOrb}>
              <div style={styles.loadingSpinner} />
            </div>
            <h2 style={styles.loadingTitle}>Loading your examinations</h2>
            <p style={styles.loadingText}>
              Preparing your assessment center...
            </p>
          </div>
        </main>

        <ResponsiveStyles />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Sidebar navigate={navigate} handleLogout={handleLogout} />

      <main style={styles.main}>
        {/* PREMIUM HEADER */}
        <header className="exampro-header" style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span>Student Portal</span>
              <span style={styles.breadcrumbSlash}>/</span>
              <strong>My Exams</strong>
            </div>

            <div style={styles.eyebrow}>
              <span style={styles.eyebrowDot} />
              ASSESSMENT CENTER
            </div>

            <h1 style={styles.pageTitle}>My Examinations</h1>

            <p style={styles.pageSubtitle}>
              View your assigned assessments, examination schedules and
              availability status.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={fetchExams}
              style={styles.refreshButton}
              title="Refresh examinations"
            >
              <span style={styles.refreshIcon}>↻</span>
              Refresh
            </button>

            <div style={styles.profileMini}>
              <div style={styles.avatar}>
                {(localStorage.getItem('username') || 'S')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="exampro-profile-name" style={styles.profileText}>
                <span style={styles.profileLabel}>SIGNED IN AS</span>
                <strong>
                  {localStorage.getItem('username') || 'Student'}
                </strong>
              </div>
            </div>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="exampro-summary-grid" style={styles.summaryGrid}>
          <SummaryCard
            icon="▣"
            label="Total Exams"
            value={statusCounts.total}
            accent="blue"
          />

          <SummaryCard
            icon="▶"
            label="Available Now"
            value={statusCounts.available}
            accent="green"
          />

          <SummaryCard
            icon="◷"
            label="Scheduled"
            value={statusCounts.scheduled}
            accent="amber"
          />

          <SummaryCard
            icon="✓"
            label="Completed / Closed"
            value={statusCounts.closed}
            accent="slate"
          />
        </section>

        {/* FILTER / SEARCH */}
        <section className="exampro-filter-card" style={styles.filterCard}>
          <div style={styles.filterHeading}>
            <div style={styles.filterIconBox}>⌕</div>
            <div>
              <strong style={styles.filterTitle}>Find an examination</strong>
              <span style={styles.filterHint}>
                Search and organize your assigned exams
              </span>
            </div>
          </div>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              placeholder="Search by title, subject or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={styles.searchClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
            aria-label="Sort examinations"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="TITLE">Title A-Z</option>
          </select>
        </section>

        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>!</div>
            <div style={{ flex: 1 }}>
              <strong style={styles.errorTitle}>Unable to load exams</strong>
              <div style={styles.errorText}>{error}</div>
            </div>
            <button onClick={fetchExams} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* RESULT HEADER */}
        <div style={styles.resultHeader}>
          <div>
            <span style={styles.resultNumber}>{filteredExams.length}</span>
            <span>
              {filteredExams.length === 1 ? ' examination' : ' examinations'}
              {' '}found
            </span>
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              style={styles.clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {!error && filteredExams.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIllustration}>
              <div style={styles.emptyIllustrationInner}>▣</div>
            </div>
            <div style={styles.emptyTag}>ASSESSMENT CENTER</div>
            <h2 style={styles.emptyTitle}>No examinations found</h2>
            <p style={styles.emptyText}>
              {exams.length === 0
                ? 'There are no examinations assigned to you yet.'
                : 'No examinations match your current search or status filter.'}
            </p>

            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                style={styles.primaryButton}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* EXAM GRID */}
        {filteredExams.length > 0 && (
          <section className="exampro-exam-grid" style={styles.examGrid}>
            {filteredExams.map((exam) => {
              const status = getExamStatus(exam);

              return (
                <ExamCard
                  key={exam.id || exam.examId}
                  exam={exam}
                  status={status}
                  onStart={() => handleStartExam(exam)}
                  onDetails={() => setSelectedExam(exam)}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  getQuestionCount={getQuestionCount}
                  getTotalMarks={getTotalMarks}
                  getPassingMarks={getPassingMarks}
                  getStatusLabel={getStatusLabel}
                  getStatusStyle={getStatusStyle}
                />
              );
            })}
          </section>
        )}
      </main>

      {selectedExam && (
        <ExamDetailsModal
          exam={selectedExam}
          status={getExamStatus(selectedExam)}
          onClose={() => setSelectedExam(null)}
          onStart={() => {
            setSelectedExam(null);
            handleStartExam(selectedExam);
          }}
          formatDate={formatDate}
          formatDuration={formatDuration}
          getQuestionCount={getQuestionCount}
          getTotalMarks={getTotalMarks}
          getPassingMarks={getPassingMarks}
          getStatusLabel={getStatusLabel}
          getStatusStyle={getStatusStyle}
        />
      )}

      <ResponsiveStyles />
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function Sidebar({ navigate, handleLogout }) {
  const menuItems = [
    { label: 'Dashboard', icon: '▦', path: '/student/dashboard' },
    { label: 'My Exams', icon: '▤', path: '/student/exams', active: true },
    { label: 'Results', icon: '▥', path: '/analytics' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard/1' },
    { label: 'Certificates', icon: '▣', path: null },
    { label: 'My Profile', icon: '◉', path: null },
    { label: 'Settings', icon: '⚙', path: null }
  ];

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      return;
    }

    alert(`${item.label} feature is coming soon.`);
  };

  return (
    <aside className="exampro-sidebar" style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>E</div>

        <div className="exampro-logo-copy">
          <div style={styles.logoText}>ExamPro</div>
          <div style={styles.logoSubtext}>Student Portal</div>
        </div>
      </div>

      <nav style={styles.navigation}>
        <div className="exampro-nav-section" style={styles.navSectionTitle}>
          MENU
        </div>

        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleItemClick(item)}
            className="exampro-nav-item"
            style={
              item.active
                ? { ...styles.navItem, ...styles.navItemActive }
                : styles.navItem
            }
          >
            <span
              className="exampro-nav-icon"
              style={
                item.active
                  ? { ...styles.navIcon, ...styles.navIconActive }
                  : styles.navIcon
              }
            >
              {item.icon}
            </span>

            <span className="exampro-nav-label">{item.label}</span>

            {item.active && <span style={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      <div style={styles.sidebarBottom}>
        <div className="exampro-help-box" style={styles.helpBox}>
          <div style={styles.helpIcon}>?</div>
          <div>
            <div style={styles.helpTitle}>Need Help?</div>
            <div style={styles.helpText}>Contact your administrator</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          <span style={styles.logoutIcon}>↪</span>
          <span className="exampro-logout-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ icon, label, value, accent }) {
  const accentStyles = {
    blue: {
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      glow: 'rgba(37,99,235,0.12)'
    },
    green: {
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      glow: 'rgba(5,150,105,0.12)'
    },
    amber: {
      iconBg: '#fff7ed',
      iconColor: '#d97706',
      glow: 'rgba(217,119,6,0.12)'
    },
    slate: {
      iconBg: '#f1f5f9',
      iconColor: '#64748b',
      glow: 'rgba(100,116,139,0.12)'
    }
  };

  const current = accentStyles[accent] || accentStyles.blue;

  return (
    <div
      className="exampro-summary-card"
      style={{
        ...styles.summaryCard,
        boxShadow: `0 8px 24px ${current.glow}`
      }}
    >
      <div
        style={{
          ...styles.summaryIcon,
          background: current.iconBg,
          color: current.iconColor
        }}
      >
        {icon}
      </div>

      <div style={styles.summaryContent}>
        <div style={styles.summaryLabel}>{label}</div>
        <div style={styles.summaryValue}>{value}</div>
      </div>

      <div
        style={{
          ...styles.summaryAccent,
          background: current.iconColor
        }}
      />
    </div>
  );
}

// ============================================================
// EXAM CARD
// ============================================================

function ExamCard({
  exam,
  status,
  onStart,
  onDetails,
  formatDate,
  formatDuration,
  getQuestionCount,
  getTotalMarks,
  getPassingMarks,
  getStatusLabel,
  getStatusStyle
}) {
  const title =
    exam.title ||
    exam.examName ||
    exam.name ||
    'Untitled Exam';

  const description =
    exam.description ||
    'No description provided for this examination.';

  const subject =
    exam.subject ||
    exam.category ||
    'General';

  const proctoring =
    exam.proctoring ??
    exam.aiProctoring ??
    exam.proctored ??
    false;

  const statusCopy = {
    AVAILABLE: 'Ready to start',
    SCHEDULED: 'Scheduled examination',
    CLOSED: 'Access period ended'
  };

  return (
    <article
      className="exampro-exam-card"
      style={{
        ...styles.examCard,
        ...(status === 'AVAILABLE' ? styles.availableCard : {})
      }}
    >
      <div style={styles.cardTopLine} />

      <div style={styles.examCardHeader}>
        <div style={styles.subjectBadge}>
          <span style={styles.subjectIcon}>◆</span>
          {subject}
        </div>

        <span
          style={{
            ...styles.statusBadge,
            ...getStatusStyle(status)
          }}
        >
          <span style={styles.statusDot} />
          {getStatusLabel(status)}
        </span>
      </div>

      <div style={styles.cardStatusLine}>
        <span style={styles.cardStatusIcon}>
          {status === 'AVAILABLE'
            ? '✓'
            : status === 'SCHEDULED'
              ? '◷'
              : '◼'}
        </span>
        {statusCopy[status]}
      </div>

      <h2 style={styles.examTitle}>{title}</h2>

      <p style={styles.examDescription}>{description}</p>

      <div style={styles.examInfoGrid}>
        <InfoItem
          icon="◷"
          label="Duration"
          value={formatDuration(exam)}
        />

        <InfoItem
          icon="☷"
          label="Questions"
          value={getQuestionCount(exam)}
        />

        <InfoItem
          icon="★"
          label="Total Marks"
          value={getTotalMarks(exam)}
        />

        <InfoItem
          icon="✓"
          label="Passing Marks"
          value={getPassingMarks(exam)}
        />
      </div>

      <div style={styles.scheduleBox}>
        <div style={styles.scheduleHeader}>
          <span style={styles.scheduleTitle}>EXAMINATION WINDOW</span>
          <span style={styles.scheduleIcon}>◷</span>
        </div>

        <div style={styles.scheduleRow}>
          <div>
            <span style={styles.scheduleLabel}>Starts</span>
            <strong style={styles.scheduleValue}>
              {formatDate(exam.startTime || exam.startDate)}
            </strong>
          </div>

          <div style={styles.scheduleArrow}>→</div>

          <div style={styles.scheduleEnd}>
            <span style={styles.scheduleLabel}>Ends</span>
            <strong style={styles.scheduleValue}>
              {formatDate(exam.endTime || exam.endDate)}
            </strong>
          </div>
        </div>
      </div>

      <div style={styles.examFooter}>
        <div style={styles.proctoringInfo}>
          <span
            style={{
              ...styles.proctoringDot,
              ...(proctoring ? styles.proctoringDotActive : {})
            }}
          />
          {proctoring
            ? 'AI Proctoring Enabled'
            : 'Standard Examination'}
        </div>

        <span style={styles.secureLabel}>SECURE</span>
      </div>

      <div style={styles.cardActions}>
        <button onClick={onDetails} style={styles.detailsButton}>
          <span>View Details</span>
          <span style={styles.detailsArrow}>↗</span>
        </button>

        <button
          onClick={onStart}
          disabled={status !== 'AVAILABLE'}
          style={
            status === 'AVAILABLE'
              ? styles.startButton
              : styles.startButtonDisabled
          }
        >
          {status === 'AVAILABLE'
            ? 'Start Examination →'
            : status === 'SCHEDULED'
              ? 'Not Started'
              : 'Closed'}
        </button>
      </div>
    </article>
  );
}

// ============================================================
// INFORMATION ITEM
// ============================================================

function InfoItem({ icon, label, value }) {
  return (
    <div style={styles.infoItem}>
      <div style={styles.infoIcon}>{icon}</div>

      <div style={{ minWidth: 0 }}>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
      </div>
    </div>
  );
}

// ============================================================
// EXAM DETAILS MODAL
// ============================================================

function ExamDetailsModal({
  exam,
  status,
  onClose,
  onStart,
  formatDate,
  formatDuration,
  getQuestionCount,
  getTotalMarks,
  getPassingMarks,
  getStatusLabel,
  getStatusStyle
}) {
  const title =
    exam.title ||
    exam.examName ||
    exam.name ||
    'Untitled Exam';

  const description =
    exam.description ||
    'No description has been provided for this examination.';

  const subject =
    exam.subject ||
    exam.category ||
    'General';

  const instructions =
    exam.instructions ||
    exam.examInstructions ||
    'Please read all questions carefully and submit your exam before the timer expires.';

  const proctoring =
    exam.proctoring ??
    exam.aiProctoring ??
    exam.proctored ??
    false;

  const modalStatusText = {
    AVAILABLE: 'This examination is currently available.',
    SCHEDULED: 'This examination has not started yet.',
    CLOSED: 'The examination access period has ended.'
  };

  return (
    <div
      style={styles.modalOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="exampro-modal"
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Examination details"
      >
        <div style={styles.modalHero}>
          <div style={styles.modalHeroPattern} />

          <div style={styles.modalHeroTop}>
            <div style={styles.modalSubject}>
              <span style={styles.modalSubjectIcon}>◆</span>
              {subject}
            </div>

            <button
              onClick={onClose}
              style={styles.closeButton}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div style={styles.modalHeroContent}>
            <div style={styles.modalEyebrow}>
              EXAMINATION OVERVIEW
            </div>

            <h2 style={styles.modalTitle}>{title}</h2>

            <div style={styles.modalHeroMeta}>
              <span
                style={{
                  ...styles.modalStatusBadge,
                  ...getStatusStyle(status)
                }}
              >
                <span style={styles.statusDot} />
                {getStatusLabel(status)}
              </span>

              {proctoring && (
                <span style={styles.modalProctoring}>
                  ● AI Proctoring Enabled
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.modalBody}>
          <div
            style={{
              ...styles.modalStatusNotice,
              ...(status === 'AVAILABLE'
                ? styles.modalStatusNoticeAvailable
                : status === 'SCHEDULED'
                  ? styles.modalStatusNoticeScheduled
                  : styles.modalStatusNoticeClosed)
            }}
          >
            <div style={styles.modalNoticeIcon}>
              {status === 'AVAILABLE'
                ? '✓'
                : status === 'SCHEDULED'
                  ? '◷'
                  : '!'
              }
            </div>

            <div>
              <strong style={styles.modalNoticeTitle}>
                {status === 'AVAILABLE'
                  ? 'Ready to begin'
                  : status === 'SCHEDULED'
                    ? 'Examination scheduled'
                    : 'Examination closed'}
              </strong>

              <p style={styles.modalNoticeText}>
                {modalStatusText[status]}
              </p>
            </div>
          </div>

          <section style={styles.modalSection}>
            <div style={styles.modalSectionHeading}>
              <div style={styles.sectionNumber}>01</div>
              <div>
                <h3 style={styles.modalSectionTitle}>About this exam</h3>
                <p style={styles.modalSectionSubtitle}>
                  Assessment information
                </p>
              </div>
            </div>

            <p style={styles.modalDescription}>{description}</p>
          </section>

          <section style={styles.modalSection}>
            <div style={styles.modalSectionHeading}>
              <div style={styles.sectionNumber}>02</div>
              <div>
                <h3 style={styles.modalSectionTitle}>Examination details</h3>
                <p style={styles.modalSectionSubtitle}>
                  Key assessment parameters
                </p>
              </div>
            </div>

            <div className="exampro-modal-details-grid" style={styles.modalDetailsGrid}>
              <DetailTile
                icon="◷"
                label="Duration"
                value={formatDuration(exam)}
              />

              <DetailTile
                icon="☷"
                label="Questions"
                value={getQuestionCount(exam)}
              />

              <DetailTile
                icon="★"
                label="Total Marks"
                value={getTotalMarks(exam)}
              />

              <DetailTile
                icon="✓"
                label="Passing Marks"
                value={getPassingMarks(exam)}
              />
            </div>
          </section>

          <section style={styles.modalSection}>
            <div style={styles.modalSectionHeading}>
              <div style={styles.sectionNumber}>03</div>
              <div>
                <h3 style={styles.modalSectionTitle}>Schedule</h3>
                <p style={styles.modalSectionSubtitle}>
                  Examination access window
                </p>
              </div>
            </div>

            <div style={styles.timeline}>
              <div style={styles.timelineLine} />

              <TimelineItem
                dotStyle={styles.timelineDotBlue}
                label="Available From"
                value={formatDate(
                  exam.startTime || exam.startDate
                )}
              />

              <TimelineItem
                dotStyle={styles.timelineDotSlate}
                label="Access Until"
                value={formatDate(
                  exam.endTime || exam.endDate
                )}
              />
            </div>
          </section>

          <section style={styles.modalSection}>
            <div style={styles.modalSectionHeading}>
              <div style={styles.sectionNumber}>04</div>
              <div>
                <h3 style={styles.modalSectionTitle}>Instructions</h3>
                <p style={styles.modalSectionSubtitle}>
                  Before you begin
                </p>
              </div>
            </div>

            <div style={styles.instructionsBox}>
              <span style={styles.instructionsIcon}>i</span>
              <p>{instructions}</p>
            </div>
          </section>

          <div style={styles.modalActions}>
            <button
              onClick={onClose}
              style={styles.modalCancelButton}
            >
              Close
            </button>

            <button
              onClick={onStart}
              disabled={status !== 'AVAILABLE'}
              style={
                status === 'AVAILABLE'
                  ? styles.modalStartButton
                  : styles.modalStartDisabled
              }
            >
              {status === 'AVAILABLE'
                ? 'Start Examination →'
                : status === 'SCHEDULED'
                  ? 'Exam Not Started'
                  : 'Exam Closed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL DETAIL TILE
// ============================================================

function DetailTile({ icon, label, value }) {
  return (
    <div style={styles.detailTile}>
      <div style={styles.detailTileIcon}>{icon}</div>
      <div>
        <div style={styles.detailTileLabel}>{label}</div>
        <div style={styles.detailTileValue}>{value}</div>
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE ITEM
// ============================================================

function TimelineItem({ dotStyle, label, value }) {
  return (
    <div style={styles.timelineItem}>
      <span style={{ ...styles.timelineDot, ...dotStyle }} />

      <div style={styles.timelineContent}>
        <span style={styles.timelineLabel}>{label}</span>
        <strong style={styles.timelineValue}>{value}</strong>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background:
      'linear-gradient(135deg, #f6f8fc 0%, #f1f5fb 48%, #eef3fa 100%)',
    color: '#172033',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
  },

  sidebar: {
    width: '255px',
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #0f172a 0%, #111827 52%, #0b1220 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
    boxShadow: '10px 0 35px rgba(15,23,42,0.10)'
  },

  logoSection: {
    height: '82px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 24px',
    borderBottom: '1px solid rgba(255,255,255,0.07)'
  },

  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background:
      'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
    fontWeight: 800,
    boxShadow: '0 8px 22px rgba(37,99,235,0.30)'
  },

  logoText: {
    fontSize: '19px',
    fontWeight: 800,
    letterSpacing: '-0.4px'
  },

  logoSubtext: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '3px'
  },

  navigation: {
    padding: '24px 14px',
    flex: 1
  },

  navSectionTitle: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.4px',
    padding: '0 13px',
    marginBottom: '10px'
  },

  navItem: {
    position: 'relative',
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: '#aeb9ca',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 13px',
    borderRadius: '10px',
    marginBottom: '5px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease'
  },

  navItemActive: {
    background:
      'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
  },

  navIcon: {
    width: '20px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#94a3b8'
  },

  navIconActive: {
    color: '#ffffff'
  },

  activeIndicator: {
    position: 'absolute',
    right: '8px',
    width: '4px',
    height: '20px',
    borderRadius: '4px',
    background: '#ffffff'
  },

  sidebarBottom: {
    padding: '15px'
  },

  helpBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '11px',
    marginBottom: '12px'
  },

  helpIcon: {
    width: '29px',
    height: '29px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e293b',
    color: '#93c5fd',
    fontWeight: 800
  },

  helpTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#e2e8f0'
  },

  helpText: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px'
  },

  logoutButton: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    padding: '11px 13px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left'
  },

  logoutIcon: {
    fontSize: '17px'
  },

  main: {
    flex: 1,
    marginLeft: '255px',
    minHeight: '100vh',
    padding: '32px 38px 55px',
    overflow: 'hidden'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '27px',
    gap: '25px'
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '13px'
  },

  breadcrumbSlash: {
    color: '#cbd5e1'
  },

  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#2563eb',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.6px',
    marginBottom: '6px'
  },

  eyebrowDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2563eb',
    boxShadow: '0 0 0 4px rgba(37,99,235,0.10)'
  },

  pageTitle: {
    fontSize: '32px',
    fontWeight: 800,
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-0.9px'
  },

  pageSubtitle: {
    margin: '8px 0 0',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.55,
    maxWidth: '650px'
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    paddingTop: '18px'
  },

  refreshButton: {
    border: '1px solid #dce3ed',
    background: 'rgba(255,255,255,0.90)',
    color: '#334155',
    padding: '10px 15px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    boxShadow: '0 4px 12px rgba(15,23,42,0.04)'
  },

  refreshIcon: {
    fontSize: '16px'
  },

  profileMini: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '15px',
    boxShadow: '0 7px 18px rgba(37,99,235,0.24)'
  },

  profileText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    color: '#1e293b',
    fontSize: '12px'
  },

  profileLabel: {
    color: '#94a3b8',
    fontSize: '8px',
    fontWeight: 800,
    letterSpacing: '1px'
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '22px'
  },

  summaryCard: {
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.96)',
    border: '1px solid #e5eaf1',
    borderRadius: '15px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    minHeight: '82px',
    boxSizing: 'border-box'
  },

  summaryIcon: {
    width: '45px',
    height: '45px',
    flexShrink: 0,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 800
  },

  summaryContent: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    gap: '2px'
  },

  summaryValue: {
    fontSize: '25px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1
  },

  summaryLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 700,
    letterSpacing: '0.2px'
  },

  summaryAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '3px',
    height: '100%'
  },

  filterCard: {
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #e2e8f0',
    borderRadius: '15px',
    padding: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    boxShadow: '0 6px 24px rgba(15,23,42,0.035)'
  },

  filterHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '0 7px 0 3px',
    minWidth: '205px'
  },

  filterIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 800
  },

  filterTitle: {
    display: 'block',
    fontSize: '12px',
    color: '#1e293b'
  },

  filterHint: {
    display: 'block',
    fontSize: '9px',
    color: '#94a3b8',
    marginTop: '2px'
  },

  searchWrapper: {
    flex: 1,
    position: 'relative'
  },

  searchIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '17px',
    color: '#94a3b8'
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #dfe5ed',
    borderRadius: '10px',
    padding: '11px 38px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    background: '#ffffff'
  },

  searchClear: {
    position: 'absolute',
    right: '9px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: '#f1f5f9',
    color: '#64748b',
    width: '23px',
    height: '23px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1
  },

  select: {
    minWidth: '145px',
    border: '1px solid #dfe5ed',
    background: '#ffffff',
    color: '#334155',
    borderRadius: '10px',
    padding: '11px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none',
    fontWeight: 600
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff7f7',
    border: '1px solid #fecaca',
    borderRadius: '13px',
    padding: '14px 16px',
    marginBottom: '20px'
  },

  errorIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800
  },

  errorTitle: {
    color: '#991b1b',
    fontSize: '12px'
  },

  errorText: {
    color: '#b91c1c',
    fontSize: '11px',
    marginTop: '3px'
  },

  retryButton: {
    border: '1px solid #fecaca',
    background: '#ffffff',
    color: '#b91c1c',
    borderRadius: '8px',
    padding: '8px 13px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700
  },

  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '13px',
    padding: '0 2px'
  },

  resultNumber: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 800
  },

  clearFilters: {
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700
  },

  examGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '20px'
  },

  examCard: {
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid #e1e7ef',
    borderRadius: '18px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '455px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 28px rgba(15,23,42,0.045)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },

  availableCard: {
    borderColor: '#cfe2ff',
    boxShadow: '0 10px 30px rgba(37,99,235,0.08)'
  },

  cardTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background:
      'linear-gradient(90deg, #2563eb, #60a5fa, transparent)'
  },

  examCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },

  subjectBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '8px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.6px'
  },

  subjectIcon: {
    fontSize: '7px'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '9px',
    fontWeight: 800
  },

  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'currentColor'
  },

  statusAvailable: {
    background: '#ecfdf5',
    color: '#047857'
  },

  statusScheduled: {
    background: '#fff7ed',
    color: '#c2410c'
  },

  statusClosed: {
    background: '#f1f5f9',
    color: '#64748b'
  },

  cardStatusLine: {
    color: '#94a3b8',
    fontSize: '9px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '10px'
  },

  cardStatusIcon: {
    color: '#64748b',
    fontSize: '10px'
  },

  examTitle: {
    fontSize: '20px',
    lineHeight: 1.28,
    margin: '0 0 8px',
    color: '#0f172a',
    fontWeight: 800,
    letterSpacing: '-0.4px'
  },

  examDescription: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.6,
    margin: '0 0 18px',
    minHeight: '39px'
  },

  examInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '9px',
    marginBottom: '17px'
  },

  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px',
    border: '1px solid #edf1f5',
    borderRadius: '10px',
    background: '#fbfcfe'
  },

  infoIcon: {
    width: '29px',
    height: '29px',
    flexShrink: 0,
    borderRadius: '8px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800
  },

  infoLabel: {
    fontSize: '8px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.45px',
    fontWeight: 800
  },

  infoValue: {
    fontSize: '12px',
    color: '#334155',
    fontWeight: 750,
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  scheduleBox: {
    border: '1px solid #e8edf3',
    borderRadius: '12px',
    padding: '12px 13px',
    marginBottom: '12px',
    background:
      'linear-gradient(135deg, #fbfdff 0%, #f7faff 100%)'
  },

  scheduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '11px'
  },

  scheduleTitle: {
    fontSize: '8px',
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '1px'
  },

  scheduleIcon: {
    fontSize: '13px',
    color: '#2563eb'
  },

  scheduleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '8px'
  },

  scheduleLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '8px',
    fontWeight: 700,
    marginBottom: '3px'
  },

  scheduleValue: {
    display: 'block',
    color: '#475569',
    fontSize: '9px',
    lineHeight: 1.35
  },

  scheduleEnd: {
    textAlign: 'right'
  },

  scheduleArrow: {
    color: '#cbd5e1',
    fontSize: '13px'
  },

  examFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    padding: '0 2px'
  },

  proctoringInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '9px',
    fontWeight: 650
  },

  proctoringDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#94a3b8'
  },

  proctoringDotActive: {
    background: '#22c55e',
    boxShadow: '0 0 0 4px rgba(34,197,94,0.10)'
  },

  secureLabel: {
    color: '#94a3b8',
    fontSize: '7px',
    fontWeight: 800,
    letterSpacing: '0.8px'
  },

  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.25fr',
    gap: '9px',
    marginTop: 'auto'
  },

  detailsButton: {
    border: '1px solid #d9e1eb',
    background: '#ffffff',
    color: '#334155',
    borderRadius: '9px',
    padding: '11px 10px',
    fontSize: '10px',
    fontWeight: 750,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },

  detailsArrow: {
    color: '#94a3b8'
  },

  startButton: {
    border: 'none',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    borderRadius: '9px',
    padding: '11px 10px',
    fontSize: '10px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 7px 17px rgba(37,99,235,0.22)'
  },

  startButtonDisabled: {
    border: 'none',
    background: '#e8edf3',
    color: '#94a3b8',
    borderRadius: '9px',
    padding: '11px 10px',
    fontSize: '10px',
    fontWeight: 750,
    cursor: 'not-allowed'
  },

  emptyState: {
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #e3e8ef',
    borderRadius: '18px',
    padding: '75px 20px',
    textAlign: 'center',
    boxShadow: '0 8px 28px rgba(15,23,42,0.035)'
  },

  emptyIllustration: {
    width: '76px',
    height: '76px',
    borderRadius: '22px',
    background:
      'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
    transform: 'rotate(-4deg)'
  },

  emptyIllustrationInner: {
    fontSize: '28px',
    color: '#2563eb',
    transform: 'rotate(4deg)'
  },

  emptyTag: {
    color: '#2563eb',
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '1.4px',
    marginBottom: '7px'
  },

  emptyTitle: {
    margin: '0 0 8px',
    color: '#1e293b',
    fontSize: '21px',
    fontWeight: 800
  },

  emptyText: {
    color: '#64748b',
    fontSize: '13px',
    margin: '0 auto 20px',
    maxWidth: '500px',
    lineHeight: 1.6
  },

  primaryButton: {
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    padding: '10px 17px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: 750,
    fontSize: '11px'
  },

  loadingShell: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },

  loadingOrb: {
    width: '72px',
    height: '72px',
    borderRadius: '22px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '17px'
  },

  loadingSpinner: {
    width: '27px',
    height: '27px',
    border: '3px solid #dbeafe',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'exampro-spin 0.8s linear infinite'
  },

  loadingTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: 750
  },

  loadingText: {
    margin: '7px 0 0',
    color: '#64748b',
    fontSize: '12px'
  },

  // MODAL

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.62)',
    backdropFilter: 'blur(7px)',
    WebkitBackdropFilter: 'blur(7px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },

  modal: {
    width: 'min(760px, 100%)',
    maxHeight: '92vh',
    overflowY: 'auto',
    background: '#ffffff',
    borderRadius: '22px',
    boxShadow: '0 30px 80px rgba(15,23,42,0.28)',
    overflow: 'hidden'
  },

  modalHero: {
    position: 'relative',
    overflow: 'hidden',
    padding: '22px 26px 27px',
    background:
      'linear-gradient(135deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)',
    color: '#ffffff'
  },

  modalHeroPattern: {
    position: 'absolute',
    width: '260px',
    height: '260px',
    right: '-85px',
    top: '-120px',
    borderRadius: '50%',
    border: '35px solid rgba(255,255,255,0.055)',
    pointerEvents: 'none'
  },

  modalHeroTop: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  modalSubject: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    color: '#bfdbfe',
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '1.2px',
    textTransform: 'uppercase'
  },

  modalSubjectIcon: {
    fontSize: '7px'
  },

  closeButton: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '22px',
    lineHeight: 1
  },

  modalHeroContent: {
    position: 'relative',
    marginTop: '24px'
  },

  modalEyebrow: {
    color: '#93c5fd',
    fontSize: '8px',
    fontWeight: 800,
    letterSpacing: '1.5px',
    marginBottom: '7px'
  },

  modalTitle: {
    margin: 0,
    maxWidth: '610px',
    fontSize: '27px',
    lineHeight: 1.25,
    fontWeight: 800,
    letterSpacing: '-0.5px'
  },

  modalHeroMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '9px',
    marginTop: '14px'
  },

  modalStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '9px',
    fontWeight: 800
  },

  modalProctoring: {
    color: '#bbf7d0',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(134,239,172,0.18)',
    borderRadius: '20px',
    padding: '6px 10px',
    fontSize: '9px',
    fontWeight: 750
  },

  modalBody: {
    padding: '22px 26px 25px'
  },

  modalStatusNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '13px',
    padding: '13px 14px',
    marginBottom: '24px'
  },

  modalStatusNoticeAvailable: {
    background: '#ecfdf5',
    border: '1px solid #bbf7d0'
  },

  modalStatusNoticeScheduled: {
    background: '#fff7ed',
    border: '1px solid #fed7aa'
  },

  modalStatusNoticeClosed: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },

  modalNoticeIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    background: 'rgba(255,255,255,0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#475569',
    flexShrink: 0
  },

  modalNoticeTitle: {
    display: 'block',
    color: '#1e293b',
    fontSize: '11px'
  },

  modalNoticeText: {
    margin: '3px 0 0',
    color: '#64748b',
    fontSize: '10px'
  },

  modalSection: {
    marginBottom: '23px'
  },

  modalSectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },

  sectionNumber: {
    width: '29px',
    height: '29px',
    borderRadius: '9px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: 850
  },

  modalSectionTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: 800
  },

  modalSectionSubtitle: {
    margin: '2px 0 0',
    color: '#94a3b8',
    fontSize: '9px'
  },

  modalDescription: {
    margin: '0 0 0 39px',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: 1.7
  },

  modalDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '9px',
    marginLeft: '39px'
  },

  detailTile: {
    border: '1px solid #e7ecf2',
    borderRadius: '12px',
    padding: '11px',
    background: '#fbfcfe',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  detailTileIcon: {
    width: '29px',
    height: '29px',
    borderRadius: '8px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
    flexShrink: 0
  },

  detailTileLabel: {
    color: '#94a3b8',
    fontSize: '7px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  detailTileValue: {
    color: '#1e293b',
    fontSize: '11px',
    fontWeight: 800,
    marginTop: '3px'
  },

  timeline: {
    position: 'relative',
    marginLeft: '39px',
    paddingLeft: '20px'
  },

  timelineLine: {
    position: 'absolute',
    left: '4px',
    top: '10px',
    bottom: '10px',
    width: '1px',
    background: '#dbe3ed'
  },

  timelineItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '11px',
    marginBottom: '15px'
  },

  timelineDot: {
    position: 'absolute',
    left: '-20px',
    top: '3px',
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    border: '3px solid #ffffff',
    boxSizing: 'content-box'
  },

  timelineDotBlue: {
    background: '#2563eb',
    boxShadow: '0 0 0 1px #bfdbfe'
  },

  timelineDotSlate: {
    background: '#64748b',
    boxShadow: '0 0 0 1px #cbd5e1'
  },

  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  timelineLabel: {
    color: '#94a3b8',
    fontSize: '8px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.7px'
  },

  timelineValue: {
    color: '#334155',
    fontSize: '10px'
  },

  instructionsBox: {
    marginLeft: '39px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '13px',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #e7ecf2'
  },

  instructionsIcon: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#e0ecff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 800,
    flexShrink: 0
  },

  instructionsBoxText: {
    color: '#64748b',
    fontSize: '10px'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '9px',
    paddingTop: '17px',
    borderTop: '1px solid #edf1f5'
  },

  modalCancelButton: {
    border: '1px solid #dbe1ea',
    background: '#ffffff',
    color: '#334155',
    padding: '10px 17px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 750
  },

  modalStartButton: {
    border: 'none',
    background:
      'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 800,
    boxShadow: '0 7px 18px rgba(37,99,235,0.22)'
  },

  modalStartDisabled: {
    border: 'none',
    background: '#e2e8f0',
    color: '#94a3b8',
    padding: '10px 18px',
    borderRadius: '9px',
    cursor: 'not-allowed',
    fontSize: '10px',
    fontWeight: 750
  }
};

// ============================================================
// RESPONSIVE / HOVER STYLES
// ============================================================

function ResponsiveStyles() {
  return (
    <style>
      {`
        @keyframes exampro-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .exampro-exam-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 38px rgba(15,23,42,0.09) !important;
        }

        .exampro-nav-item:not([style*="1d4ed8"]):hover {
          background: rgba(255,255,255,0.055) !important;
          color: #ffffff !important;
        }

        .exampro-summary-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .exampro-summary-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 1250px) {
          .exampro-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .exampro-exam-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 1050px) {
          .exampro-sidebar {
            width: 78px !important;
          }

          .exampro-main {
            margin-left: 78px !important;
          }

          .exampro-logo-copy,
          .exampro-nav-label,
          .exampro-nav-section,
          .exampro-help-box,
          .exampro-logout-label {
            display: none !important;
          }

          .exampro-logo-section {
            justify-content: center !important;
            padding: 0 !important;
          }

          .exampro-nav-item {
            justify-content: center !important;
          }

          .exampro-nav-icon {
            margin: 0 !important;
          }

          .exampro-profile-name {
            display: none !important;
          }

          .exampro-filter-card {
            flex-wrap: wrap !important;
          }

          .exampro-filter-card > div:first-child {
            width: 100% !important;
          }
        }

        @media (max-width: 760px) {
          .exampro-main {
            padding: 22px 17px 40px !important;
          }

          .exampro-header {
            flex-direction: column !important;
          }

          .exampro-header > div:last-child {
            padding-top: 0 !important;
            width: 100% !important;
            justify-content: space-between !important;
          }

          .exampro-summary-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .exampro-filter-card {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .exampro-filter-card > div,
          .exampro-filter-card > select {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .exampro-modal {
            max-height: 96vh !important;
          }

          .exampro-modal-details-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 520px) {
          .exampro-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .exampro-main {
            margin-left: 0 !important;
          }

          .exampro-sidebar {
            display: none !important;
          }

          .exampro-exam-grid {
            grid-template-columns: 1fr !important;
          }

          .exampro-modal-details-grid {
            grid-template-columns: 1fr !important;
          }

          .exampro-modal {
            border-radius: 17px !important;
          }
        }
      `}
    </style>
  );
}

export default MyExams;
