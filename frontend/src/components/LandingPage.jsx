import React from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import ThemeToggle from './ThemeToggle';
import './LandingPage.css';

function ExamProLogo() {
  return (
    <div className="landing-logo">
      <div className="landing-logo-mark" aria-hidden="true">
        <span className="logo-orbit logo-orbit-one"></span>
        <span className="logo-orbit logo-orbit-two"></span>
        <span className="logo-core">E</span>
      </div>

      <div className="landing-logo-copy">
        <div className="landing-logo-name">Exam<span>Pro</span></div>
        <div className="landing-logo-tagline">Smart Examination Platform</div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-background">
        <span className="landing-blob landing-blob-one"></span>
        <span className="landing-blob landing-blob-two"></span>
        <span className="landing-blob landing-blob-three"></span>
        <span className="landing-grid"></span>
      </div>

      <header className="landing-topbar">
        <ExamProLogo />

        <div className="landing-top-actions">
          <span className="landing-top-caption">Smarter assessments. Better outcomes.</span>
          <ThemeToggle />
        </div>
      </header>

      <section className="landing-motivation">
        <div className="landing-motivation-line"></div>
        <p>
          Success is not achieved by waiting for the perfect opportunity;
          it is created by preparing harder, thinking smarter, and never giving up.
        </p>
        <div className="landing-motivation-line"></div>
      </section>

      <section className="landing-main">
        <div className="landing-introduction">
          <div className="landing-eyebrow">
            <span className="eyebrow-dot"></span>
            Intelligent Online Examination
          </div>

          <h1>
            Prepare with purpose.
            <span> Perform with confidence.</span>
          </h1>

          <p className="landing-description">
            ExamPro is a modern online examination platform designed to make
            assessments smarter, more secure, and more engaging for students,
            institutions, and organizations.
          </p>

          <p className="landing-description secondary">
            With AI-powered question generation, intelligent proctoring,
            real-time examination management, performance analytics, and a
            seamless assessment experience, ExamPro brings the complete
            examination process into one powerful platform.
          </p>

          <div className="landing-feature-stack">
            <article className="landing-feature-card">
              <div className="feature-icon feature-icon-ai">
                <span>✦</span>
              </div>
              <div>
                <h3>AI-Powered Assessments</h3>
                <p>
                  Generate meaningful examination questions with intelligent
                  assistance and create assessments according to different
                  subjects, topics, and difficulty levels.
                </p>
              </div>
            </article>

            <article className="landing-feature-card">
              <div className="feature-icon feature-icon-secure">
                <span>✓</span>
              </div>
              <div>
                <h3>Secure Online Examination</h3>
                <p>
                  Conduct examinations in a controlled environment with
                  AI-based monitoring, camera verification, tab-switch
                  detection, and suspicious-activity warnings.
                </p>
              </div>
            </article>

            <article className="landing-feature-card">
              <div className="feature-icon feature-icon-analytics">
                <span>↗</span>
              </div>
              <div>
                <h3>Performance Intelligence</h3>
                <p>
                  Understand examination performance through results, rankings,
                  analytics, and meaningful insights that help students improve
                  their preparation.
                </p>
              </div>
            </article>
          </div>

          <div className="landing-bottom-note">
            <span className="note-shield">◆</span>
            <span>
              Designed for focused preparation, secure assessment, and measurable growth.
            </span>
          </div>
        </div>

        <div className="landing-login-area">
          <div className="login-glow login-glow-one"></div>
          <div className="login-glow login-glow-two"></div>

          <div className="landing-login-card">
            <div className="landing-login-heading">
              <span className="login-heading-kicker">WELCOME BACK</span>
              <h2>Start your examination journey.</h2>
              <p>
                Sign in to continue to your secure ExamPro examination portal.
              </p>
            </div>

            <div className="landing-existing-login">
              <Login />
            </div>

            <div className="landing-login-footer">
              <span>Need administrator access?</span>
              <Link to="/admin/login">Open Admin Portal</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} ExamPro</span>
        <span>Smart Examination Platform</span>
        <span>Built for secure and intelligent assessments</span>
      </footer>
    </main>
  );
}

export default LandingPage;
