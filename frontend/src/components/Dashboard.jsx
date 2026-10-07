import React, { useEffect, useState } from 'react';



import {



  useNavigate



} from 'react-router-dom';



import axios from 'axios';



import './Dashboard.css';



import ThemeToggle from './ThemeToggle';



function Dashboard() {



  const navigate = useNavigate();



  const [exams, setExams] = useState([]);



  const [loading, setLoading] = useState(true);



  const fullName =



    localStorage.getItem('fullName') ||



    localStorage.getItem('username') ||



    'Student';



  const username =



    localStorage.getItem('username') || '';



  // ============================================================



  // FETCH AVAILABLE EXAMS



  // ============================================================



  useEffect(() => {



    fetchExams();



  }, []);



  const fetchExams = async () => {



    try {



      const token = localStorage.getItem('token');



      const response = await axios.get(



        'http://localhost:8080/api/student/exams',



        {



          headers: {



            Authorization: `Bearer ${token}`



          }



        }



      );



      setExams(response.data);



    } catch (error) {



      console.error(



        'Error fetching exams:',



        error



      );



    } finally {



      setLoading(false);



    }



  };



  // ============================================================



  // LOGOUT



  // ============================================================



  const handleLogout = () => {



    localStorage.clear();



    navigate('/');



  };



  // ============================================================



  // START EXAM



  // ============================================================



  const startExam = (examId) => {



    navigate(`/exam/${examId}`);



  };



  // ============================================================



  // SIDEBAR NAVIGATION



  // ============================================================



  const openResults = () => {



    navigate('/analytics');



  };



  return (



    <div className="student-dashboard">



      {/* ======================================================



          SIDEBAR



      ====================================================== */}



      <aside className="student-sidebar">



        <div className="student-brand">



          <div className="brand-icon">



            🎓



          </div>



          <div>



            <h2>ExamPro</h2>



            <span>



              Student Portal



            </span>



          </div>



        </div>



        {/* NAVIGATION */}



        <nav className="student-nav">



          <button



            className="student-nav-item active"



            onClick={() => navigate('/student/dashboard')}



          >



            <span>🏠</span>



            Dashboard



          </button>



          <button



            className="student-nav-item"



            onClick={() => navigate('/student/exams')}



          >



            <span>📝</span>



            My Exams



          </button>



          <button



            className="student-nav-item"



            onClick={openResults}



          >



            <span>📊</span>



            Results



          </button>



          <button



            className="student-nav-item"



            onClick={() => navigate('/leaderboard/1')}



          >



            <span>🏆</span>



            Leaderboard



          </button>



          <button



            className="student-nav-item"



            onClick={() => navigate('/student/certificates')}



          >



            <span>🏅</span>



            Certificates



          </button>



          <button



            className="student-nav-item"



            onClick={() => navigate('/student/profile')}



          >



            <span>👤</span>



            My Profile



          </button>



          <button



            className="student-nav-item"



            onClick={() => navigate('/student/settings')}



          >



            <span>⚙️</span>



            Settings



          </button>



        </nav>



        {/* LOGOUT */}



        <div className="sidebar-bottom">



          <button



            className="student-nav-item logout-item"



            onClick={handleLogout}



          >



            <span>🚪</span>



            Logout



          </button>



        </div>



      </aside>



      {/* ======================================================



          MAIN CONTENT



      ====================================================== */}



      <main className="student-main">



        {/* ====================================================



            TOP HEADER



        ==================================================== */}



        <header className="student-header">



          <div>



            <h1>



              Student Dashboard



            </h1>



            <p>



              Manage your examinations and track your progress.



            </p>



          </div>



          <div className="header-right">



            <ThemeToggle />



            <button



              className="notification-button"



              title="Notifications"



            >



              🔔



            </button>



            <div className="header-user">



              <div className="header-avatar">



                {fullName



                  .charAt(0)



                  .toUpperCase()}



              </div>



              <div>



                <strong>



                  {fullName}



                </strong>



                <span>



                  @{username}



                </span>



              </div>



            </div>



          </div>



        </header>



        {/* ====================================================



            WELCOME BANNER



        ==================================================== */}



        <section className="welcome-banner">



          <div>



            <span className="welcome-label">



              Welcome back 👋



            </span>



            <h2>



              Hello, {fullName}!



            </h2>



            <p>



              Ready to take your next assessment?



              Check the available examinations below.



            </p>



          </div>



          <div className="welcome-icon">



            🎯



          </div>



        </section>



        {/* ====================================================



            STATISTICS



        ==================================================== */}



        <section className="student-stats">



          <div className="student-stat-card">



            <div className="stat-icon blue">



              📝



            </div>



            <div>



              <span>



                Available Exams



              </span>



              <strong>



                {exams.length}



              </strong>



            </div>



          </div>



          <div className="student-stat-card">



            <div className="stat-icon green">



              ⏱️



            </div>



            <div>



              <span>



                Scheduled Exams



              </span>



              <strong>



                {exams.length}



              </strong>



            </div>



          </div>



          <div className="student-stat-card">



            <div className="stat-icon purple">



              🏆



            </div>



            <div>



              <span>



                My Results



              </span>



              <strong>



                View



              </strong>



            </div>



          </div>



          <div className="student-stat-card">



            <div className="stat-icon orange">



              📈



            </div>



            <div>



              <span>



                Performance



              </span>



              <strong>



                Track



              </strong>



            </div>



          </div>



        </section>



        {/* ====================================================



            AVAILABLE EXAMS



        ==================================================== */}



        <section className="dashboard-section">



          <div className="section-header">



            <div>



              <h2>



                Available Exams



              </h2>



              <p>



                Select an examination to view its details.



              </p>



            </div>



            <span className="exam-count">



              {exams.length} exam



              {exams.length !== 1 ? 's' : ''}



            </span>



          </div>



          {loading ? (



            <div className="dashboard-loading">



              <div className="loading-spinner"></div>



              <p>



                Loading available examinations...



              </p>



            </div>



          ) : exams.length === 0 ? (



            <div className="empty-state">



              <div className="empty-icon">



                📭



              </div>



              <h3>



                No Exams Available



              </h3>



              <p>



                There are currently no active examinations.



                Please check again later.



              </p>



            </div>



          ) : (



            <div className="exam-grid">



              {exams.map((exam) => (



                <div



                  key={exam.id}



                  className="professional-exam-card"



                >



                  <div className="exam-card-top">



                    <div className="exam-type-icon">



                      📚



                    </div>



                    <span className="exam-status">



                      Active



                    </span>



                  </div>



                  <h3>



                    {exam.title}



                  </h3>



                  <p className="exam-description">



                    {exam.description ||



                      'Assessment examination'}



                  </p>



                  <div className="exam-details">



                    <div>



                      <span>⏱️</span>



                      <div>



                        <small>



                          Duration



                        </small>



                        <strong>



                          {exam.durationMinutes} min



                        </strong>



                      </div>



                    </div>



                    <div>



                      <span>📊</span>



                      <div>



                        <small>



                          Total Marks



                        </small>



                        <strong>



                          {exam.totalMarks}



                        </strong>



                      </div>



                    </div>



                    <div>



                      <span>✅</span>



                      <div>



                        <small>



                          Passing



                        </small>



                        <strong>



                          {exam.passingMarks}%



                        </strong>



                      </div>



                    </div>



                  </div>



                  <div className="exam-schedule">



                    <div>



                      <span>



                        Starts



                      </span>



                      <strong>



                        {exam.startTime



                          ? new Date(



                              exam.startTime



                            ).toLocaleString()



                          : 'Not specified'}



                      </strong>



                    </div>



                    <div>



                      <span>



                        Ends



                      </span>



                      <strong>



                        {exam.endTime



                          ? new Date(



                              exam.endTime



                            ).toLocaleString()



                          : 'Not specified'}



                      </strong>



                    </div>



                  </div>



                  <button



                    className="start-exam-button"



                    onClick={() => startExam(exam.id)}



                  >



                    Start Examination



                    <span>



                      →



                    </span>



                  </button>



                </div>



              ))}



            </div>



          )}



        </section>



        {/* ====================================================



            QUICK ACTIONS



        ==================================================== */}



        <section className="quick-actions-section">



          <h2>



            Quick Actions



          </h2>



          <div className="quick-actions">



            <button



              onClick={openResults}



            >



              <span>📊</span>



              <div>



                <strong>



                  View Results



                </strong>



                <small>



                  Check your examination performance



                </small>



              </div>



            </button>



            <button



              onClick={() => navigate('/leaderboard/1')}



            >



              <span>🏆</span>



              <div>



                <strong>



                  Leaderboard



                </strong>



                <small>



                  Compare your performance



                </small>



              </div>



            </button>



            <button



              onClick={() => navigate('/student/profile')}



            >



              <span>👤</span>



              <div>



                <strong>



                  My Profile



                </strong>



                <small>



                  View your account information



                </small>



              </div>



            </button>



          </div>



        </section>



      </main>



    </div>



  );



}



export default Dashboard;
