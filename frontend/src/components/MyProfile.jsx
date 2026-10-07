import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentAccount.css';

function MyProfilePage() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Student';
  const username = localStorage.getItem('username') || '';

  const getStoredForm = () => ({
    fullName: localStorage.getItem('fullName') || '',
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || '',
    department: localStorage.getItem('department') || '',
    institution: localStorage.getItem('institution') || '',
    phone: localStorage.getItem('phone') || '',
    about: localStorage.getItem('studentAbout') || ''
  });

  const [form, setForm] = React.useState(getStoredForm);
  const [saved, setSaved] = React.useState(false);

  const profileInitials =
    form.fullName.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S';

  const completionFields = [
    form.fullName,
    form.email,
    form.department,
    form.institution,
    form.phone,
    form.about
  ];

  const completion = Math.round(
    (completionFields.filter((value) => value && value.trim()).length / completionFields.length) * 100
  );

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value
    }));
    setSaved(false);
  };

  const resetForm = () => {
    setForm(getStoredForm());
    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    localStorage.setItem('fullName', form.fullName.trim());
    localStorage.setItem('email', form.email.trim());
    localStorage.setItem('department', form.department.trim());
    localStorage.setItem('institution', form.institution.trim());
    localStorage.setItem('phone', form.phone.trim());
    localStorage.setItem('studentAbout', form.about.trim());

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
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
            <button onClick={() => navigate('/student/dashboard')} type="button">
              <span className="account-nav-icon">⌂</span>
              Dashboard
            </button>
            <button onClick={() => navigate('/student/exams')} type="button">
              <span className="account-nav-icon">▣</span>
              My Exams
            </button>
            <button onClick={() => navigate('/analytics')} type="button">
              <span className="account-nav-icon">▥</span>
              Results
            </button>
            <button onClick={() => navigate('/leaderboard/1')} type="button">
              <span className="account-nav-icon">◆</span>
              Leaderboard
            </button>
            <button onClick={() => navigate('/student/certificates')} type="button">
              <span className="account-nav-icon">▤</span>
              Certificates
            </button>
            <button className="active" onClick={() => navigate('/student/profile')} type="button">
              <span className="account-nav-icon">◉</span>
              My Profile
            </button>
            <button onClick={() => navigate('/student/settings')} type="button">
              <span className="account-nav-icon">⚙</span>
              Settings
            </button>
          </nav>

          <div className="account-sidebar-bottom">
            <div className="account-help">
              <strong>Need Help?</strong>
              <span>Contact your examination administrator for assistance.</span>
            </div>

            <button className="account-logout" onClick={handleLogout} type="button">
              ↪ &nbsp; Logout
            </button>
          </div>
        </aside>

        <main className="account-main">
          <header className="account-header">
            <div>
              <p className="account-header-kicker">STUDENT PORTAL</p>
              <h1>My Profile</h1>
              <p>Manage your student identity and account information.</p>
            </div>

            <div className="account-user">
              <div className="account-user-copy">
                <strong>{fullName}</strong>
                <span>@{username || 'student'}</span>
              </div>
              <div className="account-user-avatar">{profileInitials}</div>
            </div>
          </header>

          <div className="account-content">

            <section className="account-intro">
              <span className="account-intro-label">ACCOUNT INFORMATION</span>
              <h2>My Profile</h2>
              <p>
                Keep your student identity, academic details and contact information
                up to date for your examination portal.
              </p>
            </section>

            <div className="account-grid">

              <section className="account-card">
                <div className="account-card-header">
                  <h3>Personal Information</h3>
                  <span>Student account</span>
                </div>

                <div className="account-card-body">
                  <form onSubmit={handleSave}>
                    <div className="account-form-grid">

                      <div className="account-field">
                        <label htmlFor="profile-full-name">Full Name</label>
                        <input
                          id="profile-full-name"
                          value={form.fullName}
                          onChange={handleChange('fullName')}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="account-field">
                        <label htmlFor="profile-username">Username</label>
                        <input
                          id="profile-username"
                          value={form.username}
                          disabled
                        />
                        <small>Username is controlled by your login account.</small>
                      </div>

                      <div className="account-field">
                        <label htmlFor="profile-email">Email Address</label>
                        <input
                          id="profile-email"
                          type="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="account-field">
                        <label htmlFor="profile-department">Department / Branch</label>
                        <input
                          id="profile-department"
                          value={form.department}
                          onChange={handleChange('department')}
                          placeholder="e.g. AI & Data Science"
                        />
                      </div>

                      <div className="account-field">
                        <label htmlFor="profile-institution">College / Institution</label>
                        <input
                          id="profile-institution"
                          value={form.institution}
                          onChange={handleChange('institution')}
                          placeholder="Enter institution name"
                        />
                      </div>

                      <div className="account-field">
                        <label htmlFor="profile-phone">Phone Number</label>
                        <input
                          id="profile-phone"
                          value={form.phone}
                          onChange={handleChange('phone')}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="account-field full">
                        <label htmlFor="profile-about">About</label>
                        <textarea
                          id="profile-about"
                          value={form.about}
                          onChange={handleChange('about')}
                          placeholder="Add a short professional description"
                        />
                      </div>

                    </div>

                    {saved && (
                      <div className="account-alert">
                        Profile information saved successfully.
                      </div>
                    )}

                    <div className="account-actions">
                      <button className="account-button" type="button" onClick={resetForm}>
                        Reset
                      </button>
                      <button className="account-button primary" type="submit">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              <aside className="account-card">

                <div className="profile-identity">
                  <div className="profile-large-avatar">{profileInitials}</div>
                  <h3>{form.fullName || 'Student'}</h3>
                  <p>Student Account · @{form.username || 'student'}</p>
                </div>

                <div className="profile-completion">
                  <div className="profile-completion-top">
                    <span>Profile completion</span>
                    <strong>{completion}%</strong>
                  </div>
                  <div className="profile-completion-bar">
                    <span style={{ width: `${completion}%` }} />
                  </div>
                </div>

                <div className="profile-facts">
                  <div className="profile-fact">
                    <span>Username</span>
                    <strong>@{form.username || 'student'}</strong>
                  </div>

                  <div className="profile-fact">
                    <span>Email</span>
                    <strong>{form.email || 'Not added'}</strong>
                  </div>

                  <div className="profile-fact">
                    <span>Department</span>
                    <strong>{form.department || 'Not added'}</strong>
                  </div>

                  <div className="profile-fact">
                    <span>Institution</span>
                    <strong>{form.institution || 'Not added'}</strong>
                  </div>

                  <div className="profile-fact">
                    <span>Role</span>
                    <strong>STUDENT</strong>
                  </div>
                </div>

              </aside>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyProfilePage;
