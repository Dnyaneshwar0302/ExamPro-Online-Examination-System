import React, { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import './AdminDashboard.css';

import ThemeToggle from './ThemeToggle';

import Results from './Results';

import ManageExams from './ManageExams';

import Students from './Students';

import QuestionBank from './QuestionBank';

import AIQuestionGenerator from './AIQuestionGenerator';



function AdminDashboard() {

  const navigate = useNavigate();



  const [adminName, setAdminName] = useState('Admin');

  const [adminDepartment, setAdminDepartment] = useState('');

  const [activeSection, setActiveSection] = useState('dashboard');

  const [availableExams, setAvailableExams] = useState([]);

  const [loadingExams, setLoadingExams] = useState(true);

  const [studentCount, setStudentCount] = useState(0);

  const [selectedLeaderboardExamId, setSelectedLeaderboardExamId] = useState('');

  const [leaderboardData, setLeaderboardData] = useState([]);

  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [leaderboardError, setLeaderboardError] = useState('');

  // ================= REPORTS STATE =================
  const [selectedReportExamId, setSelectedReportExamId] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  // ================= SETTINGS STATE =================
  const [settingsData, setSettingsData] = useState({
    email: '',
    department: '',
    notifications: true,
    examReminders: true,
    autoRefreshReports: true,
    defaultProctoring: true,
    defaultDuration: 60,
    defaultPassingMarks: 40,
    randomizeQuestions: false,
    autoSubmitOnTime: true,
    showResultAfterSubmit: true,
    proctoringInterval: 3,
    warningThreshold: 2,
    blockMultipleFaces: true,
    detectPhone: true,
    detectTabSwitch: true,
    saveProctoringSnapshots: true,
    reportPageSize: 25,
    reportDateRange: 'all',
    sessionTimeout: 30,
    loginAlerts: true,
    auditLogging: true,
    dataRetention: 90,
    compactTables: false,
    language: 'English',
    dateFormat: 'DD/MM/YYYY'
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState('account');
  const [settingsSearch, setSettingsSearch] = useState('');

  // ================= AI PROCTORING STATE =================
  const proctoringVideoRef = useRef(null);
  const proctoringCanvasRef = useRef(null);
  const proctoringStreamRef = useRef(null);
  const proctoringIntervalRef = useRef(null);
  const proctoringBusyRef = useRef(false);

  const [proctoringActive, setProctoringActive] = useState(false);
  const [proctoringStatus, setProctoringStatus] = useState('Ready');
  const [proctoringMessage, setProctoringMessage] = useState('Start monitoring to begin AI proctoring.');
  const [proctoringConfidence, setProctoringConfidence] = useState(0);
  const [proctoringEvents, setProctoringEvents] = useState([]);
  const [proctoringError, setProctoringError] = useState('');



  const [examData, setExamData] = useState({

    title: '',

    description: '',

    durationMinutes: 60,

    startTime: '',

    endTime: '',

    passingMarks: 40,

    enableProctoring: true,

    questions: []

  });



  const [currentQuestion, setCurrentQuestion] = useState({

    questionText: '',

    questionType: 'MCQ',

    optionA: '',

    optionB: '',

    optionC: '',

    optionD: '',

    correctAnswer: 'A',

    marks: 10,

    problemStatement: '',

    sampleInput: '',

    sampleOutput: '',

    testCases: ''

  });



  useEffect(() => {

    const storedName = localStorage.getItem('fullName');

    const storedDepartment = localStorage.getItem('department');



    if (storedName && storedName.trim()) {

      setAdminName(storedName);

    }



    if (storedDepartment) {

      setAdminDepartment(storedDepartment);

    }



    const storedSettings = localStorage.getItem('examProAdminSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettingsData((previous) => ({ ...previous, ...parsedSettings }));
      } catch (error) {
        console.log('Unable to load admin settings:', error);
      }
    }

    setSettingsData((previous) => ({
      ...previous,
      email: localStorage.getItem('email') || previous.email,
      department: storedDepartment || previous.department
    }));

    loadExams();

    loadStudentCount();

  }, []);



  const loadStudentCount = async () => {

    try {

      const token = localStorage.getItem('token');



      const response = await axios.get(

        'http://localhost:8080/api/admin/students',

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setStudentCount(

        Array.isArray(response.data) ? response.data.length : 0

      );

    } catch (error) {

      console.log('Unable to load student count:', error);

      setStudentCount(0);

    }

  };



  const loadExams = async () => {

    try {

      setLoadingExams(true);



      const token = localStorage.getItem('token');



      const response = await axios.get(

        'http://localhost:8080/api/admin/exams',

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setAvailableExams(Array.isArray(response.data) ? response.data : []);

    } catch (error) {

      console.log('Unable to load exam statistics:', error);

      setAvailableExams([]);

    } finally {

      setLoadingExams(false);

    }

  };



  const loadLeaderboard = async (examId) => {

    if (!examId) {

      setLeaderboardData([]);

      return;

    }



    try {

      setLoadingLeaderboard(true);

      setLeaderboardError('');



      const token = localStorage.getItem('token');



      const response = await axios.get(

        `http://localhost:8080/api/leaderboard/${examId}`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setLeaderboardData(

        Array.isArray(response.data) ? response.data : []

      );

    } catch (error) {

      console.error('Unable to load leaderboard:', error);

      setLeaderboardData([]);

      setLeaderboardError(

        error.response?.data?.error ||

        'Unable to load leaderboard data.'

      );

    } finally {

      setLoadingLeaderboard(false);

    }

  };



  useEffect(() => {

    if (activeSection !== 'leaderboard') {

      return;

    }



    const examId =

      selectedLeaderboardExamId ||

      availableExams[0]?.id;



    if (!examId) {

      setLeaderboardData([]);

      return;

    }



    if (!selectedLeaderboardExamId) {

      setSelectedLeaderboardExamId(String(examId));

    }



    loadLeaderboard(examId);

  }, [activeSection, selectedLeaderboardExamId, availableExams]);



  const handleLeaderboardExamChange = (e) => {

    const examId = e.target.value;

    setSelectedLeaderboardExamId(examId);

    loadLeaderboard(examId);

  };



  // ================= REPORTS =================
  const loadReport = async (examId) => {
    if (!examId) {
      setReportData([]);
      return;
    }

    try {
      setLoadingReport(true);
      setReportError('');

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/leaderboard/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReportData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Unable to load report:', error);
      setReportData([]);
      setReportError(
        error.response?.data?.error ||
          'Unable to load report data. Please check the backend service.'
      );
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeSection !== 'reports') {
      return;
    }

    const examId = selectedReportExamId || availableExams[0]?.id;

    if (!examId) {
      setReportData([]);
      return;
    }

    if (!selectedReportExamId) {
      setSelectedReportExamId(String(examId));
    }

    loadReport(examId);
  }, [activeSection, selectedReportExamId, availableExams]);

  const handleReportExamChange = (e) => {
    const examId = e.target.value;
    setSelectedReportExamId(examId);
    loadReport(examId);
  };

  const downloadReportCSV = () => {
    if (!reportData.length) {
      alert('There is no report data to download.');
      return;
    }

    const exam = availableExams.find(
      (item) => String(item.id) === String(selectedReportExamId)
    );

    const headers = [
      'Rank',
      'Student Name',
      'Username',
      'Score',
      'Percentage',
      'Time Taken (seconds)'
    ];

    const rows = reportData.map((row, index) => [
      row.rank || index + 1,
      row.fullName || row.username || 'Student',
      row.username || '',
      row.marks ?? 0,
      Number(row.percentage || 0).toFixed(2),
      row.timeTaken ?? ''
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(exam?.title || 'exam-report')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'exam-report'}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ================= AI PROCTORING =================
  const stopProctoring = () => {
    if (proctoringIntervalRef.current) {
      clearInterval(proctoringIntervalRef.current);
      proctoringIntervalRef.current = null;
    }

    if (proctoringStreamRef.current) {
      proctoringStreamRef.current.getTracks().forEach((track) => track.stop());
      proctoringStreamRef.current = null;
    }

    if (proctoringVideoRef.current) {
      proctoringVideoRef.current.srcObject = null;
    }

    proctoringBusyRef.current = false;
    setProctoringActive(false);
    setProctoringStatus('Stopped');
  };

  const recordProctoringEvent = (type, message, confidence = 0) => {
    const event = {
      id: `${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString(),
      type,
      message,
      confidence: Number(confidence || 0)
    };

    setProctoringEvents((previous) => [event, ...previous].slice(0, 20));
  };

  const checkProctoringFrame = async () => {
    if (
      !proctoringVideoRef.current ||
      !proctoringCanvasRef.current ||
      !proctoringStreamRef.current ||
      proctoringBusyRef.current
    ) {
      return;
    }

    const video = proctoringVideoRef.current;
    const canvas = proctoringCanvasRef.current;

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return;
    }

    proctoringBusyRef.current = true;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = canvas.toDataURL('image/jpeg', 0.72);

      const response = await axios.post(
        'http://localhost:5000/detect_cheating',
        {
          frame,
          examId: null,
          userId: localStorage.getItem('username') || localStorage.getItem('userId') || null
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const result = response.data || {};
      const confidence = Number(result.confidence || 0);
      const cheatingDetected = Boolean(result.cheatingDetected);
      const message = result.message || (
        cheatingDetected
          ? 'Suspicious activity detected.'
          : 'No suspicious activity detected.'
      );

      setProctoringConfidence(confidence);
      setProctoringMessage(message);
      setProctoringError('');

      if (cheatingDetected) {
        setProctoringStatus('Warning');
        recordProctoringEvent('WARNING', message, confidence);
      } else {
        setProctoringStatus('Monitoring');
      }
    } catch (error) {
      console.error('AI proctoring detection error:', error);
      setProctoringStatus('Service Error');
      setProctoringMessage('Unable to reach the AI proctoring service.');
      setProctoringError(
        error.response?.data?.message ||
        'Make sure the Python AI service is running on port 5000.'
      );
    } finally {
      proctoringBusyRef.current = false;
    }
  };

  const startProctoring = async () => {
    try {
      setProctoringError('');
      setProctoringMessage('Requesting camera access...');
      setProctoringStatus('Starting');
      setProctoringEvents([]);
      setProctoringConfidence(0);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      if (proctoringStreamRef.current) {
        stopProctoring();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      proctoringStreamRef.current = stream;

      if (!proctoringVideoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Proctoring video element is not ready.');
      }

      proctoringVideoRef.current.srcObject = stream;
      await proctoringVideoRef.current.play();

      setProctoringActive(true);
      setProctoringStatus('Monitoring');
      setProctoringMessage('AI proctoring is active. Monitoring candidate activity.');

      await checkProctoringFrame();

      proctoringIntervalRef.current = window.setInterval(() => {
        checkProctoringFrame();
      }, 2500);
    } catch (error) {
      console.error('Unable to start AI proctoring:', error);
      setProctoringActive(false);
      setProctoringStatus('Camera Error');
      setProctoringError(
        error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access and try again.'
          : error.message || 'Unable to start the camera.'
      );
    }
  };

  useEffect(() => {
    if (activeSection !== 'proctoring') {
      if (proctoringStreamRef.current || proctoringIntervalRef.current) {
        stopProctoring();
      }
    }
  }, [activeSection]);

  useEffect(() => {
    return () => {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
      }
      if (proctoringStreamRef.current) {
        proctoringStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleExamChange = (e) => {

    const { name, value, type, checked } = e.target;



    setExamData({

      ...examData,

      [name]: type === 'checkbox' ? checked : value

    });

  };



  const handleQuestionChange = (e) => {

    const { name, value } = e.target;



    setCurrentQuestion({

      ...currentQuestion,

      [name]: value

    });

  };



  const resetQuestion = () => {

    setCurrentQuestion({

      questionText: '',

      questionType: 'MCQ',

      optionA: '',

      optionB: '',

      optionC: '',

      optionD: '',

      correctAnswer: 'A',

      marks: 10,

      problemStatement: '',

      sampleInput: '',

      sampleOutput: '',

      testCases: ''

    });

  };



  const addQuestion = () => {

    if (!currentQuestion.questionText.trim()) {

      alert('Please enter question text.');

      return;

    }



    if (currentQuestion.questionType === 'MCQ') {

      if (

        !currentQuestion.optionA.trim() ||

        !currentQuestion.optionB.trim() ||

        !currentQuestion.optionC.trim() ||

        !currentQuestion.optionD.trim()

      ) {

        alert('Please enter all four options for the MCQ.');

        return;

      }

    }



    setExamData({

      ...examData,

      questions: [

        ...examData.questions,

        {

          ...currentQuestion

        }

      ]

    });



    resetQuestion();

  };



  const removeQuestion = (index) => {

    const newQuestions = examData.questions.filter(

      (_, i) => i !== index

    );



    setExamData({

      ...examData,

      questions: newQuestions

    });

  };



  // Add AI-generated MCQs directly into the Create Exam question list.

  // Only the fields expected by the existing exam form are copied.

  const handleAddAIQuestions = (generatedQuestions) => {

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {

      alert('Please select at least one AI-generated question.');

      return;

    }



    const mappedQuestions = generatedQuestions.map((question) => ({

      questionText: question.questionText || '',

      questionType: question.questionType || 'MCQ',

      optionA: question.optionA || '',

      optionB: question.optionB || '',

      optionC: question.optionC || '',

      optionD: question.optionD || '',

      correctAnswer: question.correctAnswer || 'A',

      marks: Number(question.marks || 1),

      problemStatement: question.problemStatement || '',

      sampleInput: question.sampleInput || '',

      sampleOutput: question.sampleOutput || '',

      testCases:

        typeof question.testCases === 'string'

          ? question.testCases

          : question.testCases

            ? JSON.stringify(question.testCases)

            : ''

    }));



    setExamData((previous) => ({

      ...previous,

      questions: [

        ...previous.questions,

        ...mappedQuestions

      ]

    }));



    setActiveSection('create-exam');



    setTimeout(() => {

      document

        .getElementById('create-exam-section')

        ?.scrollIntoView({

          behavior: 'smooth',

          block: 'start'

        });

    }, 150);



    alert(

      `${mappedQuestions.length} AI-generated question(s) added to the exam builder.`

    );

  };



  const createExam = async (e) => {

    e.preventDefault();



    if (!examData.title.trim()) {

      alert('Please enter an exam title.');

      return;

    }



    if (!examData.startTime || !examData.endTime) {

      alert('Please select start and end time.');

      return;

    }



    if (examData.questions.length === 0) {

      alert('Please add at least one question.');

      return;

    }



    if (

      examData.startTime &&

      examData.endTime &&

      new Date(examData.endTime) <= new Date(examData.startTime)

    ) {

      alert('End time must be after start time.');

      return;

    }



    try {

      const token = localStorage.getItem('token');



      await axios.post(

        'http://localhost:8080/api/admin/exams',

        examData,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      alert('Exam created successfully!');



      setExamData({

        title: '',

        description: '',

        durationMinutes: 60,

        startTime: '',

        endTime: '',

        passingMarks: 40,

        enableProctoring: true,

        questions: []

      });



      await loadExams();



      setActiveSection('dashboard');



      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      });



    } catch (error) {

      console.error('Error creating exam:', error);



      alert(

        'Error creating exam: ' +

          (error.response?.data?.error || error.message)

      );

    }

  };



  const handleLogout = () => {

    localStorage.clear();

    navigate('/');

  };



  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSettingsSaved(false);
  };

  const saveSettings = () => {
    const nextSettings = { ...settingsData };
    localStorage.setItem('examProAdminSettings', JSON.stringify(nextSettings));
    localStorage.setItem('fullName', adminName.trim());
    if (nextSettings.department.trim()) localStorage.setItem('department', nextSettings.department.trim());
    if (nextSettings.email.trim()) localStorage.setItem('email', nextSettings.email.trim());
    setAdminDepartment(nextSettings.department.trim());
    setSettingsData(nextSettings);
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 2500);
  };

  const resetSettings = () => {
    const defaults = {
      email: localStorage.getItem('email') || '',
      department: localStorage.getItem('department') || '',
      notifications: true,
      examReminders: true,
      autoRefreshReports: true,
      defaultProctoring: true,
      defaultDuration: 60,
      defaultPassingMarks: 40,
      randomizeQuestions: false,
      autoSubmitOnTime: true,
      showResultAfterSubmit: true,
      proctoringInterval: 3,
      warningThreshold: 2,
      blockMultipleFaces: true,
      detectPhone: true,
      detectTabSwitch: true,
      saveProctoringSnapshots: true,
      reportPageSize: 25,
      reportDateRange: 'all',
      sessionTimeout: 30,
      loginAlerts: true,
      auditLogging: true,
      dataRetention: 90,
      compactTables: false,
      language: 'English',
      dateFormat: 'DD/MM/YYYY'
    };
    setSettingsData(defaults);
    setAdminName(localStorage.getItem('fullName') || adminName);
    localStorage.setItem('examProAdminSettings', JSON.stringify(defaults));
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSidebarClick = (section) => {

    setActiveSection(section);



    if (section === 'create-exam') {

      setTimeout(() => {

        document

          .getElementById('create-exam-section')

          ?.scrollIntoView({

            behavior: 'smooth',

            block: 'start'

          });

      }, 100);

    }



  };



  const totalExams = availableExams.length;



  const activeExams = availableExams.filter((exam) => {

    if (!exam?.startTime || !exam?.endTime) {

      return false;

    }



    const now = new Date();

    const start = new Date(exam.startTime);

    const end = new Date(exam.endTime);



    return now >= start && now <= end;

  }).length;



  const initials = adminName

    .split(' ')

    .filter(Boolean)

    .slice(0, 2)

    .map((name) => name[0])

    .join('')

    .toUpperCase();



  return (

    <div className="admin-layout">



      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">



        <div className="admin-brand">

          <div className="brand-logo">E</div>



          <div className="brand-text">

            <h2>ExamPro</h2>

            <span>ADMIN PANEL</span>

          </div>

        </div>



        <div className="sidebar-menu">



          <p className="menu-label">MAIN</p>



          <button

            className={`sidebar-item ${

              activeSection === 'dashboard' ? 'active' : ''

            }`}

            onClick={() => {

              setActiveSection('dashboard');

              window.scrollTo({

                top: 0,

                behavior: 'smooth'

              });

            }}

          >

            <span className="menu-icon">▦</span>

            Dashboard

          </button>



          <button

            className={`sidebar-item ${

              activeSection === 'create-exam' ? 'active' : ''

            }`}

            onClick={() => handleSidebarClick('create-exam')}

          >

            <span className="menu-icon">＋</span>

            Create Exam

          </button>



          <button

            className="sidebar-item"

            onClick={() => setActiveSection('manage-exams')}

          >

            <span className="menu-icon">☷</span>

            Manage Exams

          </button>



          <button

            className="sidebar-item"

            onClick={() => handleSidebarClick('question-bank')}

          >

            <span className="menu-icon">▤</span>

            Question Bank

          </button>



          <p className="menu-label second-label">MANAGEMENT</p>



          <button

            className={`sidebar-item ${

              activeSection === 'students' ? 'active' : ''

            }`}

            onClick={() => setActiveSection('students')}

          >

            <span className="menu-icon">♙</span>

            Students

          </button>



          <button

            className={`sidebar-item ${

              activeSection === 'results' ? 'active' : ''

            }`}

            onClick={() => handleSidebarClick('results')}

          >

            <span className="menu-icon">◉</span>

            Results

          </button>



          <button

            className={`sidebar-item ${

              activeSection === 'leaderboard' ? 'active' : ''

            }`}

            onClick={() => setActiveSection('leaderboard')}

          >

            <span className="menu-icon">◆</span>

            Leaderboard

          </button>



          <p className="menu-label second-label">AI & REPORTS</p>



          <button

            className={`sidebar-item ${

              activeSection === 'ai-generator' ? 'active' : ''

            }`}

            onClick={() => setActiveSection('ai-generator')}

          >

            <span className="menu-icon">✦</span>

            AI Question Generator

          </button>



          <button

            className="sidebar-item"

            onClick={() => handleSidebarClick('proctoring')}

          >

            <span className="menu-icon">◉</span>

            AI Proctoring

          </button>



          <button

            className="sidebar-item"

            onClick={() => handleSidebarClick('reports')}

          >

            <span className="menu-icon">▥</span>

            Reports

          </button>



          <p className="menu-label second-label">SYSTEM</p>



          <button

            className="sidebar-item"

            onClick={() => handleSidebarClick('settings')}

          >

            <span className="menu-icon">⚙</span>

            Settings

          </button>



        </div>



        <div className="sidebar-bottom">



          <div className="sidebar-admin-card">

            <div className="admin-avatar-small">

              {initials || 'A'}

            </div>



            <div className="sidebar-admin-info">

              <strong>{adminName}</strong>

              <span>Administrator</span>

            </div>

          </div>



          <button

            className="sidebar-logout"

            onClick={handleLogout}

          >

            <span>↪</span>

            Logout

          </button>



        </div>



      </aside>



      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main">



        {/* TOP HEADER */}

        <header className="admin-header">



          <div>

            <p className="header-small-text">ADMINISTRATION</p>

            <h1>Dashboard</h1>

          </div>



          <div className="header-profile">



  <ThemeToggle />



  <div className="header-admin-info">

    <strong>{adminName}</strong>

    <span>

      {adminDepartment || 'Administrator'}

    </span>

  </div>



  <div className="header-avatar">

    {initials || 'A'}

  </div>



</div>



        </header>



        {activeSection === 'manage-exams' ? (

          <ManageExams

            onBack={() => {

              setActiveSection('dashboard');

              window.scrollTo({ top: 0, behavior: 'smooth' });

            }}

          />

        ) : activeSection === 'question-bank' ? (

          <QuestionBank

            onBack={() => {

              setActiveSection('dashboard');

              window.scrollTo({ top: 0, behavior: 'smooth' });

            }}

          />

        ) : activeSection === 'students' ? (

          <Students

            onBack={() => {

              setActiveSection('dashboard');

              window.scrollTo({ top: 0, behavior: 'smooth' });

            }}

          />

        ) : activeSection === 'results' ? (

          <Results

            onBack={() => {

              setActiveSection('dashboard');

              window.scrollTo({ top: 0, behavior: 'smooth' });

            }}

          />

        ) : activeSection === 'ai-generator' ? (

          <AIQuestionGenerator

            onBack={() => {

              setActiveSection('dashboard');

              window.scrollTo({ top: 0, behavior: 'smooth' });

            }}

            onAddQuestions={handleAddAIQuestions}

          />

        ) : activeSection === 'proctoring' ? (
          <section
            className="admin-proctoring-page"
            style={{
              padding: '42px 36px 60px',
              minHeight: 'calc(100vh - 90px)',
              background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 55%, #f8f5ff 100%)'
            }}
          >
            <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => {
                  stopProctoring();
                  setActiveSection('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ border: 'none', background: 'transparent', color: '#5635e8', fontWeight: 700, fontSize: '15px', cursor: 'pointer', padding: '0 0 22px' }}
              >
                ← Dashboard
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div>
                  <div style={{ color: '#5635e8', fontSize: '12px', fontWeight: 800, letterSpacing: '3px', marginBottom: '8px' }}>
                    EXAMPRO AI
                  </div>
                  <h2 style={{ margin: 0, color: '#14245c', fontSize: '38px', lineHeight: 1.1 }}>
                    AI Proctoring
                  </h2>
                  <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '16px' }}>
                    Live camera monitoring with the existing ExamPro AI cheating-detection service.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={proctoringActive ? stopProctoring : startProctoring}
                  style={{ border: 'none', borderRadius: '12px', padding: '13px 22px', background: proctoringActive ? '#dc2626' : '#5635e8', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 24px rgba(60, 45, 140, 0.18)' }}
                >
                  {proctoringActive ? '■ Stop Monitoring' : '● Start Monitoring'}
                </button>
              </div>

              {proctoringError && (
                <div style={{ background: '#fff7f7', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px' }}>
                  {proctoringError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, 0.85fr)', gap: '22px', alignItems: 'start' }}>
                <div style={{ background: '#0f172a', borderRadius: '18px', padding: '14px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#020617', minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video
                      ref={proctoringVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', maxHeight: '620px', objectFit: 'cover', display: proctoringActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
                    />

                    {!proctoringActive && (
                      <div style={{ color: '#94a3b8', textAlign: 'center', padding: '50px 20px' }}>
                        <div style={{ fontSize: '54px', marginBottom: '14px' }}>◉</div>
                        <strong style={{ display: 'block', color: '#e2e8f0', fontSize: '18px' }}>
                          Camera is not active
                        </strong>
                        <span style={{ display: 'block', marginTop: '8px' }}>
                          Click Start Monitoring to begin.
                        </span>
                      </div>
                    )}

                    {proctoringActive && (
                      <div style={{ position: 'absolute', top: '14px', left: '14px', padding: '7px 11px', borderRadius: '999px', background: proctoringStatus === 'Warning' ? '#dc2626' : '#16a34a', color: '#ffffff', fontSize: '12px', fontWeight: 800 }}>
                        ● {proctoringStatus}
                      </div>
                    )}
                  </div>
                  <canvas ref={proctoringCanvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px' }}>CURRENT STATUS</div>
                    <div style={{ marginTop: '12px', fontSize: '28px', fontWeight: 800, color: proctoringStatus === 'Warning' ? '#dc2626' : '#14245c' }}>
                      {proctoringStatus}
                    </div>
                    <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{proctoringMessage}</p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px' }}>DETECTION CONFIDENCE</div>
                    <div style={{ marginTop: '10px', fontSize: '34px', fontWeight: 800, color: '#5635e8' }}>{(proctoringConfidence * 100).toFixed(1)}%</div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '10px' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, proctoringConfidence * 100))}%`, height: '100%', background: '#5635e8', borderRadius: '999px', transition: 'width 0.25s ease' }} />
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px' }}>MONITORING EVENTS</div>
                    {proctoringEvents.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '14px' }}>No warning events recorded yet.</div>
                    ) : (
                      <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
                        {proctoringEvents.map((event) => (
                          <div key={event.id} style={{ padding: '11px 12px', borderRadius: '10px', background: '#fff7f7', border: '1px solid #fee2e2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                              <strong style={{ color: '#b91c1c', fontSize: '12px' }}>{event.type}</strong>
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{event.time}</span>
                            </div>
                            <div style={{ color: '#475569', fontSize: '13px', marginTop: '5px' }}>{event.message}</div>
                            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '5px' }}>Confidence: {(event.confidence * 100).toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '22px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 22px', color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>
                <strong style={{ color: '#334155' }}>How it works:</strong>{' '}
                the browser captures a camera frame every 2.5 seconds and sends it to the existing Flask
                <code style={{ margin: '0 4px', color: '#5635e8' }}>/detect_cheating</code>
                endpoint. The returned cheating flag, confidence and message are displayed here in real time.
              </div>
            </div>
          </section>
        ) : activeSection === 'reports' ? (
          <section
            className="admin-reports-page"
            style={{
              padding: '42px 36px 60px',
              minHeight: 'calc(100vh - 90px)',
              background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 55%, #f8f5ff 100%)'
            }}
          >
            <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#5635e8',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  padding: '0 0 22px'
                }}
              >
                ← Dashboard
              </button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: '24px',
                  flexWrap: 'wrap',
                  marginBottom: '28px'
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#5635e8',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '3px',
                      marginBottom: '8px'
                    }}
                  >
                    EXAMPRO ANALYTICS
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      color: '#14245c',
                      fontSize: '38px',
                      lineHeight: 1.1
                    }}
                  >
                    Examination Reports
                  </h2>
                  <p
                    style={{
                      margin: '10px 0 0',
                      color: '#64748b',
                      fontSize: '16px'
                    }}
                  >
                    Review participation, scores, pass rates and student performance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadReport(selectedReportExamId || availableExams[0]?.id)}
                  disabled={loadingReport || !selectedReportExamId}
                  style={{
                    border: '1px solid #e0e7ff',
                    background: '#ffffff',
                    color: '#5635e8',
                    padding: '13px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: loadingReport ? 'not-allowed' : 'pointer',
                    opacity: loadingReport ? 0.65 : 1,
                    boxShadow: '0 8px 24px rgba(60, 45, 140, 0.08)'
                  }}
                >
                  ↻ Refresh Report
                </button>
              </div>

              {reportError && (
                <div
                  style={{
                    background: '#fff7f7',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    marginBottom: '20px'
                  }}
                >
                  {reportError}
                </div>
              )}

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '22px',
                  boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: '1 1 360px' }}>
                    <label
                      style={{
                        display: 'block',
                        color: '#334155',
                        fontWeight: 700,
                        marginBottom: '9px'
                      }}
                    >
                      Select Examination
                    </label>
                    <select
                      value={
                        selectedReportExamId ||
                        (availableExams[0]?.id ? String(availableExams[0].id) : '')
                      }
                      onChange={handleReportExamChange}
                      disabled={availableExams.length === 0}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        border: '1px solid #dbe3f0',
                        borderRadius: '10px',
                        padding: '0 14px',
                        color: '#172554',
                        background: '#f8faff',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    >
                      {availableExams.length === 0 ? (
                        <option value="">No examinations available</option>
                      ) : (
                        availableExams.map((exam) => (
                          <option key={exam.id} value={exam.id}>
                            {exam.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={downloadReportCSV}
                    disabled={!reportData.length}
                    style={{
                      border: 'none',
                      borderRadius: '10px',
                      padding: '13px 18px',
                      background: reportData.length ? '#14245c' : '#cbd5e1',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: reportData.length ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ↓ Download CSV
                  </button>
                </div>
              </div>

              {loadingReport ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '70px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  Loading report...
                </div>
              ) : availableExams.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '70px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '46px', marginBottom: '12px' }}>▥</div>
                  <strong style={{ display: 'block', color: '#334155', fontSize: '18px' }}>
                    No examinations available
                  </strong>
                  <span style={{ display: 'block', marginTop: '6px' }}>
                    Create an examination first to generate a report.
                  </span>
                </div>
              ) : (
                <>
                  {(() => {
                    const participantCount = reportData.length;
                    const averagePercentage = participantCount
                      ? reportData.reduce(
                          (sum, row) => sum + Number(row.percentage || 0),
                          0
                        ) / participantCount
                      : 0;
                    const passedCount = reportData.filter(
                      (row) => Number(row.percentage || 0) >= 40
                    ).length;
                    const failedCount = Math.max(0, participantCount - passedCount);
                    const passRate = participantCount
                      ? (passedCount / participantCount) * 100
                      : 0;

                    const cards = [
                      ['PARTICIPANTS', participantCount, '#5635e8'],
                      ['AVERAGE SCORE', `${averagePercentage.toFixed(1)}%`, '#3b82f6'],
                      ['PASS RATE', `${passRate.toFixed(1)}%`, '#10b981'],
                      ['FAILED', failedCount, '#ef4444']
                    ];

                    return (
                      <>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '18px',
                            marginBottom: '22px'
                          }}
                        >
                          {cards.map(([label, value, accent]) => (
                            <div
                              key={label}
                              style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                padding: '22px',
                                borderLeft: `5px solid ${accent}`,
                                borderTop: '1px solid #e2e8f0',
                                borderRight: '1px solid #e2e8f0',
                                borderBottom: '1px solid #e2e8f0',
                                boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)'
                              }}
                            >
                              <div
                                style={{
                                  color: '#64748b',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  letterSpacing: '2px'
                                }}
                              >
                                {label}
                              </div>
                              <div
                                style={{
                                  marginTop: '12px',
                                  color: '#14245c',
                                  fontSize: '30px',
                                  fontWeight: 800
                                }}
                              >
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)'
                          }}
                        >
                          <div
                            style={{
                              padding: '22px 24px',
                              borderBottom: '1px solid #e2e8f0'
                            }}
                          >
                            <div
                              style={{
                                color: '#5635e8',
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '2px'
                              }}
                            >
                              DETAILED RESULTS
                            </div>
                            <h3
                              style={{
                                margin: '6px 0 0',
                                color: '#14245c',
                                fontSize: '22px'
                              }}
                            >
                              Student Performance Report
                            </h3>
                          </div>

                          {reportData.length === 0 ? (
                            <div
                              style={{
                                padding: '60px 20px',
                                textAlign: 'center',
                                color: '#64748b'
                              }}
                            >
                              <div style={{ fontSize: '42px', marginBottom: '10px' }}>◌</div>
                              <strong
                                style={{
                                  display: 'block',
                                  color: '#334155',
                                  fontSize: '18px',
                                  marginBottom: '6px'
                                }}
                              >
                                No submissions yet
                              </strong>
                              Students will appear here after submitting this examination.
                            </div>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <table
                                style={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  minWidth: '800px'
                                }}
                              >
                                <thead>
                                  <tr style={{ background: '#f8faff' }}>
                                    {['RANK', 'STUDENT', 'SCORE', 'PERCENTAGE', 'STATUS', 'TIME TAKEN'].map((heading) => (
                                      <th
                                        key={heading}
                                        style={{
                                          padding: '15px 18px',
                                          textAlign: heading === 'STUDENT' ? 'left' : 'center',
                                          color: '#64748b',
                                          fontSize: '11px',
                                          letterSpacing: '1.5px',
                                          fontWeight: 800,
                                          borderBottom: '1px solid #e2e8f0'
                                        }}
                                      >
                                        {heading}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {reportData.map((row, index) => {
                                    const percentage = Number(row.percentage || 0);
                                    const passed = percentage >= 40;

                                    return (
                                      <tr
                                        key={`${row.username}-${index}`}
                                        style={{ borderBottom: '1px solid #eef2f7' }}
                                      >
                                        <td style={{ padding: '17px 18px', textAlign: 'center', fontWeight: 800, color: '#475569' }}>
                                          {row.rank || index + 1}
                                        </td>
                                        <td style={{ padding: '17px 18px' }}>
                                          <strong style={{ display: 'block', color: '#172554', fontSize: '15px' }}>
                                            {row.fullName || row.username || 'Student'}
                                          </strong>
                                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                            @{row.username || 'student'}
                                          </span>
                                        </td>
                                        <td style={{ padding: '17px 18px', textAlign: 'center', fontWeight: 800, color: '#172554' }}>
                                          {row.marks ?? 0}
                                        </td>
                                        <td style={{ padding: '17px 18px', textAlign: 'center' }}>
                                          {percentage.toFixed(1)}%
                                        </td>
                                        <td style={{ padding: '17px 18px', textAlign: 'center' }}>
                                          <span
                                            style={{
                                              display: 'inline-block',
                                              minWidth: '72px',
                                              padding: '7px 10px',
                                              borderRadius: '999px',
                                              background: passed ? '#dcfce7' : '#fee2e2',
                                              color: passed ? '#15803d' : '#b91c1c',
                                              fontWeight: 800,
                                              fontSize: '12px'
                                            }}
                                          >
                                            {passed ? 'PASS' : 'FAIL'}
                                          </span>
                                        </td>
                                        <td style={{ padding: '17px 18px', textAlign: 'center', color: '#64748b' }}>
                                          {row.timeTaken
                                            ? `${Math.floor(row.timeTaken / 60)}m ${row.timeTaken % 60}s`
                                            : '—'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </section>
        ) : activeSection === 'leaderboard' ? (

          <section

            className="leaderboard-page"

            style={{

              padding: '42px 36px 60px',

              minHeight: 'calc(100vh - 90px)',

              background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 55%, #f8f5ff 100%)'

            }}

          >

            <div

              style={{

                maxWidth: '1220px',

                margin: '0 auto'

              }}

            >

              <button

                type="button"

                onClick={() => {

                  setActiveSection('dashboard');

                  window.scrollTo({ top: 0, behavior: 'smooth' });

                }}

                style={{

                  border: 'none',

                  background: 'transparent',

                  color: '#5635e8',

                  fontWeight: 700,

                  fontSize: '15px',

                  cursor: 'pointer',

                  padding: '0 0 22px'

                }}

              >

                ← Dashboard

              </button>



              <div

                style={{

                  display: 'flex',

                  justifyContent: 'space-between',

                  alignItems: 'flex-end',

                  gap: '24px',

                  flexWrap: 'wrap',

                  marginBottom: '28px'

                }}

              >

                <div>

                  <div

                    style={{

                      color: '#5635e8',

                      fontSize: '12px',

                      fontWeight: 800,

                      letterSpacing: '3px',

                      marginBottom: '8px'

                    }}

                  >

                    PERFORMANCE MANAGEMENT

                  </div>

                  <h2

                    style={{

                      margin: 0,

                      color: '#14245c',

                      fontSize: '38px',

                      lineHeight: 1.1

                    }}

                  >

                    Leaderboard

                  </h2>

                  <p

                    style={{

                      margin: '10px 0 0',

                      color: '#64748b',

                      fontSize: '16px'

                    }}

                  >

                    View student rankings and examination performance.

                  </p>

                </div>



                <button

                  type="button"

                  onClick={() =>

                    loadLeaderboard(

                      selectedLeaderboardExamId ||

                      availableExams[0]?.id

                    )

                  }

                  style={{

                    border: '1px solid #e0e7ff',

                    background: '#ffffff',

                    color: '#5635e8',

                    padding: '13px 20px',

                    borderRadius: '12px',

                    fontWeight: 700,

                    cursor: 'pointer',

                    boxShadow: '0 8px 24px rgba(60, 45, 140, 0.08)'

                  }}

                >

                  ↻ Refresh

                </button>

              </div>



              <div

                style={{

                  background: '#ffffff',

                  border: '1px solid #e2e8f0',

                  borderRadius: '16px',

                  padding: '20px',

                  marginBottom: '22px',

                  boxShadow: '0 10px 30px rgba(51, 65, 85, 0.06)'

                }}

              >

                <label

                  style={{

                    display: 'block',

                    color: '#334155',

                    fontWeight: 700,

                    marginBottom: '9px'

                  }}

                >

                  Select Examination

                </label>



                <select

                  value={

                    selectedLeaderboardExamId ||

                    (availableExams[0]?.id

                      ? String(availableExams[0].id)

                      : '')

                  }

                  onChange={handleLeaderboardExamChange}

                  disabled={availableExams.length === 0}

                  style={{

                    width: '100%',

                    minHeight: '48px',

                    border: '1px solid #dbe3f0',

                    borderRadius: '10px',

                    padding: '0 14px',

                    color: '#172554',

                    background: '#f8faff',

                    fontSize: '15px',

                    outline: 'none'

                  }}

                >

                  {availableExams.length === 0 ? (

                    <option value="">No examinations available</option>

                  ) : (

                    availableExams.map((exam) => (

                      <option key={exam.id} value={exam.id}>

                        {exam.title}

                      </option>

                    ))

                  )}

                </select>

              </div>



              {loadingLeaderboard ? (

                <div

                  style={{

                    background: '#ffffff',

                    borderRadius: '16px',

                    padding: '70px 20px',

                    textAlign: 'center',

                    color: '#64748b',

                    border: '1px solid #e2e8f0'

                  }}

                >

                  Loading leaderboard...

                </div>

              ) : leaderboardError ? (

                <div

                  style={{

                    background: '#fff7f7',

                    border: '1px solid #fecaca',

                    borderRadius: '16px',

                    padding: '28px',

                    color: '#b91c1c',

                    textAlign: 'center'

                  }}

                >

                  {leaderboardError}

                </div>

              ) : (

                <>

                  <div

                    style={{

                      display: 'grid',

                      gridTemplateColumns:

                        'repeat(auto-fit, minmax(220px, 1fr))',

                      gap: '18px',

                      marginBottom: '22px'

                    }}

                  >

                    {[

                      [

                        'PARTICIPANTS',

                        leaderboardData.length,

                        '#5635e8'

                      ],

                      [

                        'TOP SCORE',

                        leaderboardData.length

                          ? `${Number(

                              leaderboardData[0].percentage || 0

                            ).toFixed(1)}%`

                          : '0%',

                        '#10b981'

                      ],

                      [

                        'AVERAGE SCORE',

                        leaderboardData.length

                          ? `${(

                              leaderboardData.reduce(

                                (sum, row) =>

                                  sum +

                                  Number(row.percentage || 0),

                                0

                              ) / leaderboardData.length

                            ).toFixed(1)}%`

                          : '0%',

                        '#3b82f6'

                      ],

                      [

                        'TOP MARKS',

                        leaderboardData.length

                          ? `${leaderboardData[0].marks ?? 0}`

                          : '0',

                        '#f59e0b'

                      ]

                    ].map(([label, value, accent]) => (

                      <div

                        key={label}

                        style={{

                          background: '#ffffff',

                          borderRadius: '16px',

                          padding: '22px',

                          borderLeft: `5px solid ${accent}`,

                          borderTop: '1px solid #e2e8f0',

                          borderRight: '1px solid #e2e8f0',

                          borderBottom: '1px solid #e2e8f0',

                          boxShadow:

                            '0 10px 30px rgba(51, 65, 85, 0.06)'

                        }}

                      >

                        <div

                          style={{

                            color: '#64748b',

                            fontSize: '11px',

                            fontWeight: 800,

                            letterSpacing: '2px'

                          }}

                        >

                          {label}

                        </div>

                        <div

                          style={{

                            marginTop: '12px',

                            color: '#14245c',

                            fontSize: '30px',

                            fontWeight: 800

                          }}

                        >

                          {value}

                        </div>

                      </div>

                    ))}

                  </div>



                  <div

                    style={{

                      background: '#ffffff',

                      border: '1px solid #e2e8f0',

                      borderRadius: '16px',

                      overflow: 'hidden',

                      boxShadow:

                        '0 10px 30px rgba(51, 65, 85, 0.06)'

                    }}

                  >

                    <div

                      style={{

                        padding: '22px 24px',

                        borderBottom: '1px solid #e2e8f0'

                      }}

                    >

                      <div

                        style={{

                          color: '#5635e8',

                          fontSize: '11px',

                          fontWeight: 800,

                          letterSpacing: '2px'

                        }}

                      >

                        EXAMINATION PERFORMANCE

                      </div>

                      <h3

                        style={{

                          margin: '6px 0 0',

                          color: '#14245c',

                          fontSize: '22px'

                        }}

                      >

                        Student Rankings

                      </h3>

                    </div>



                    {leaderboardData.length === 0 ? (

                      <div

                        style={{

                          padding: '60px 20px',

                          textAlign: 'center',

                          color: '#64748b'

                        }}

                      >

                        <div

                          style={{

                            fontSize: '40px',

                            marginBottom: '10px'

                          }}

                        >

                          🏆

                        </div>

                        <strong

                          style={{

                            display: 'block',

                            color: '#334155',

                            fontSize: '18px',

                            marginBottom: '6px'

                          }}

                        >

                          No submissions yet

                        </strong>

                        Students will appear here after submitting this examination.

                      </div>

                    ) : (

                      <div style={{ overflowX: 'auto' }}>

                        <table

                          style={{

                            width: '100%',

                            borderCollapse: 'collapse',

                            minWidth: '760px'

                          }}

                        >

                          <thead>

                            <tr style={{ background: '#f8faff' }}>

                              {[

                                'RANK',

                                'STUDENT',

                                'SCORE',

                                'PERCENTAGE',

                                'TIME TAKEN'

                              ].map((heading) => (

                                <th

                                  key={heading}

                                  style={{

                                    padding: '15px 18px',

                                    textAlign:

                                      heading === 'STUDENT'

                                        ? 'left'

                                        : 'center',

                                    color: '#64748b',

                                    fontSize: '11px',

                                    letterSpacing: '1.5px',

                                    fontWeight: 800,

                                    borderBottom:

                                      '1px solid #e2e8f0'

                                  }}

                                >

                                  {heading}

                                </th>

                              ))}

                            </tr>

                          </thead>

                          <tbody>

                            {leaderboardData.map((row, index) => (

                              <tr

                                key={`${row.username}-${index}`}

                                style={{

                                  borderBottom:

                                    '1px solid #eef2f7'

                                }}

                              >

                                <td

                                  style={{

                                    padding: '17px 18px',

                                    textAlign: 'center',

                                    fontWeight: 800,

                                    color:

                                      index === 0

                                        ? '#d97706'

                                        : index === 1

                                          ? '#64748b'

                                          : index === 2

                                            ? '#b45309'

                                            : '#475569'

                                  }}

                                >

                                  {index < 3

                                    ? ['🥇', '🥈', '🥉'][index]

                                    : `#${row.rank || index + 1}`}

                                </td>

                                <td

                                  style={{

                                    padding: '17px 18px'

                                  }}

                                >

                                  <strong

                                    style={{

                                      display: 'block',

                                      color: '#172554',

                                      fontSize: '15px'

                                    }}

                                  >

                                    {row.fullName ||

                                      row.username ||

                                      'Student'}

                                  </strong>

                                  <span

                                    style={{

                                      color: '#94a3b8',

                                      fontSize: '12px'

                                    }}

                                  >

                                    @{row.username || 'student'}

                                  </span>

                                </td>

                                <td

                                  style={{

                                    padding: '17px 18px',

                                    textAlign: 'center',

                                    fontWeight: 800,

                                    color: '#172554'

                                  }}

                                >

                                  {row.marks ?? 0}

                                </td>

                                <td

                                  style={{

                                    padding: '17px 18px',

                                    textAlign: 'center'

                                  }}

                                >

                                  <span

                                    style={{

                                      display: 'inline-block',

                                      minWidth: '70px',

                                      padding: '7px 10px',

                                      borderRadius: '999px',

                                      background:

                                        Number(row.percentage || 0) >=

                                        40

                                          ? '#dcfce7'

                                          : '#fee2e2',

                                      color:

                                        Number(row.percentage || 0) >=

                                        40

                                          ? '#15803d'

                                          : '#b91c1c',

                                      fontWeight: 800,

                                      fontSize: '12px'

                                    }}

                                  >

                                    {Number(

                                      row.percentage || 0

                                    ).toFixed(1)}

                                    %

                                  </span>

                                </td>

                                <td

                                  style={{

                                    padding: '17px 18px',

                                    textAlign: 'center',

                                    color: '#64748b'

                                  }}

                                >

                                  {row.timeTaken

                                    ? `${Math.floor(

                                        row.timeTaken / 60

                                      )}m ${

                                        row.timeTaken % 60

                                      }s`

                                    : '—'}

                                </td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </div>

                </>

              )}

            </div>

          </section>

        ) : activeSection === 'settings' ? (
          <section className="exampro-settings-page">
            <style>{`
              .exampro-settings-page {
                min-height: calc(100vh - 90px);
                background: #f7f8fc;
                padding: 28px 32px 36px;
                color: #172554;
              }
              .exampro-settings-shell {
                max-width: 1240px;
                margin: 0 auto;
              }
              .exampro-settings-topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                margin-bottom: 22px;
              }
              .exampro-settings-heading h2 {
                margin: 0;
                font-size: 30px;
                line-height: 1.15;
                letter-spacing: -0.6px;
                color: #111c46;
              }
              .exampro-settings-heading p {
                margin: 7px 0 0;
                color: #64748b;
                font-size: 14px;
              }
              .exampro-settings-search {
                width: min(330px, 100%);
                height: 44px;
                border: 1px solid #dbe2ee;
                border-radius: 11px;
                background: #fff;
                padding: 0 14px 0 40px;
                box-sizing: border-box;
                color: #172554;
                outline: none;
                box-shadow: 0 1px 2px rgba(15,23,42,.03);
              }
              .exampro-settings-layout {
                display: grid;
                grid-template-columns: 245px minmax(0, 1fr);
                min-height: 680px;
                border: 1px solid #e1e6ef;
                border-radius: 16px;
                background: #fff;
                box-shadow: 0 10px 35px rgba(15,23,42,.06);
                overflow: hidden;
              }
              .exampro-settings-nav {
                background: #fbfcff;
                border-right: 1px solid #e7ebf2;
                padding: 18px 12px;
              }
              .exampro-settings-nav-label {
                padding: 8px 11px 10px;
                color: #94a3b8;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 1.4px;
                text-transform: uppercase;
              }
              .exampro-settings-nav button {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 11px;
                border: 0;
                background: transparent;
                color: #475569;
                padding: 10px 11px;
                margin: 2px 0;
                border-radius: 9px;
                text-align: left;
                cursor: pointer;
                font-size: 13px;
                font-weight: 650;
              }
              .exampro-settings-nav button:hover {
                background: #f1f3f9;
                color: #312e81;
              }
              .exampro-settings-nav button.active {
                background: #eeeaff;
                color: #4f35d8;
                font-weight: 800;
              }
              .exampro-settings-nav-icon {
                width: 24px;
                height: 24px;
                border-radius: 7px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #f0f2f7;
                color: #64748b;
                font-size: 12px;
                flex: 0 0 24px;
              }
              .exampro-settings-nav button.active .exampro-settings-nav-icon {
                background: #5b3df5;
                color: #fff;
              }
              .exampro-settings-main {
                min-width: 0;
                background: #fff;
                display: flex;
                flex-direction: column;
              }
              .exampro-settings-main-head {
                padding: 25px 30px 19px;
                border-bottom: 1px solid #edf0f5;
              }
              .exampro-settings-main-head h3 {
                margin: 0;
                color: #111c46;
                font-size: 22px;
                letter-spacing: -.2px;
              }
              .exampro-settings-main-head p {
                margin: 6px 0 0;
                color: #64748b;
                font-size: 13px;
                line-height: 1.55;
              }
              .exampro-settings-content {
                padding: 25px 30px 30px;
              }
              .exampro-settings-card {
                border: 1px solid #e5e9f0;
                border-radius: 12px;
                margin-bottom: 18px;
                overflow: hidden;
                background: #fff;
              }
              .exampro-settings-card:last-child { margin-bottom: 0; }
              .exampro-settings-card-title {
                padding: 16px 18px 12px;
                color: #1e293b;
                font-size: 14px;
                font-weight: 800;
              }
              .exampro-settings-card-subtitle {
                padding: 0 18px 14px;
                margin-top: -7px;
                color: #64748b;
                font-size: 12px;
              }
              .exampro-settings-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 15px 18px;
                border-top: 1px solid #eef1f5;
              }
              .exampro-settings-row:first-of-type { border-top: 0; }
              .exampro-settings-row-copy { min-width: 0; }
              .exampro-settings-row-copy strong {
                display: block;
                color: #334155;
                font-size: 13px;
                line-height: 1.4;
              }
              .exampro-settings-row-copy span {
                display: block;
                margin-top: 3px;
                color: #7b8799;
                font-size: 12px;
                line-height: 1.45;
              }
              .exampro-settings-input,
              .exampro-settings-select {
                width: 230px;
                height: 40px;
                box-sizing: border-box;
                border: 1px solid #d8dfeb;
                border-radius: 8px;
                background: #fff;
                color: #1e293b;
                padding: 0 11px;
                font-size: 13px;
                outline: none;
              }
              .exampro-settings-input:focus,
              .exampro-settings-select:focus,
              .exampro-settings-search:focus {
                border-color: #765af4;
                box-shadow: 0 0 0 3px rgba(118,90,244,.10);
              }
              .exampro-settings-input.small { width: 110px; }
              .exampro-settings-input.full { width: 100%; }
              .exampro-settings-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0,1fr));
                gap: 14px;
                padding: 0 18px 18px;
              }
              .exampro-settings-field label {
                display: block;
                margin-bottom: 6px;
                color: #475569;
                font-size: 12px;
                font-weight: 750;
              }
              .exampro-settings-toggle {
                width: 42px;
                height: 24px;
                padding: 2px;
                border: 0;
                border-radius: 999px;
                background: #cbd5e1;
                cursor: pointer;
                transition: .18s ease;
                flex: 0 0 42px;
              }
              .exampro-settings-toggle.on { background: #5b3df5; }
              .exampro-settings-toggle span {
                display: block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 1px 3px rgba(15,23,42,.22);
                transition: .18s ease;
              }
              .exampro-settings-toggle.on span { transform: translateX(18px); }
              .exampro-settings-status {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 6px 9px;
                border-radius: 7px;
                background: #ecfdf5;
                color: #047857;
                font-size: 11px;
                font-weight: 800;
              }
              .exampro-settings-status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #10b981;
              }
              .exampro-settings-profile {
                display: grid;
                grid-template-columns: 58px minmax(0,1fr);
                gap: 15px;
                align-items: center;
                padding: 18px;
                border-bottom: 1px solid #eef1f5;
              }
              .exampro-settings-avatar {
                width: 58px;
                height: 58px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #eeeaff;
                color: #5b3df5;
                font-size: 21px;
                font-weight: 900;
              }
              .exampro-settings-profile strong { color: #172554; font-size: 15px; }
              .exampro-settings-profile span { display: block; color: #7b8799; font-size: 12px; margin-top: 4px; }
              .exampro-settings-footer {
                position: sticky;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                padding: 14px 30px;
                border-top: 1px solid #e9edf3;
                background: rgba(255,255,255,.96);
                backdrop-filter: blur(8px);
                z-index: 3;
              }
              .exampro-settings-save-state { color: #059669; font-size: 12px; font-weight: 750; }
              .exampro-settings-footer-actions { display: flex; gap: 9px; }
              .exampro-settings-btn {
                height: 38px;
                padding: 0 15px;
                border-radius: 8px;
                border: 1px solid #d8dfeb;
                background: #fff;
                color: #475569;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
              }
              .exampro-settings-btn.primary {
                border-color: #5b3df5;
                background: #5b3df5;
                color: #fff;
                min-width: 120px;
              }
              .exampro-settings-btn:hover { transform: translateY(-1px); }
              .exampro-settings-empty {
                padding: 50px 20px;
                text-align: center;
                color: #64748b;
                border: 1px dashed #d8dfeb;
                border-radius: 12px;
              }
              @media (max-width: 950px) {
                .exampro-settings-page { padding: 20px 16px 28px; }
                .exampro-settings-topbar { align-items: flex-start; flex-direction: column; }
                .exampro-settings-search { width: 100%; }
                .exampro-settings-layout { grid-template-columns: 1fr; }
                .exampro-settings-nav { border-right: 0; border-bottom: 1px solid #e7ebf2; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 2px; }
                .exampro-settings-nav-label { grid-column: 1 / -1; }
              }
              @media (max-width: 650px) {
                .exampro-settings-content, .exampro-settings-main-head { padding-left: 18px; padding-right: 18px; }
                .exampro-settings-row { align-items: flex-start; flex-direction: column; }
                .exampro-settings-input, .exampro-settings-select, .exampro-settings-input.small { width: 100%; }
                .exampro-settings-grid { grid-template-columns: 1fr; }
                .exampro-settings-nav { grid-template-columns: 1fr; }
                .exampro-settings-footer { padding: 12px 18px; align-items: flex-start; flex-direction: column; }
                .exampro-settings-footer-actions { width: 100%; }
                .exampro-settings-btn { flex: 1; }
              }
            `}</style>

            <div className="exampro-settings-shell">
              <div className="exampro-settings-topbar">
                <div className="exampro-settings-heading">
                  <h2>Settings</h2>
                  <p>Manage your ExamPro administrator account, examination defaults, AI proctoring, security and system preferences.</p>
                </div>
                <div style={{ position: 'relative', width: 'min(330px, 100%)' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8', fontSize: '15px' }}>⌕</span>
                  <input
                    className="exampro-settings-search"
                    value={settingsSearch}
                    onChange={(e) => setSettingsSearch(e.target.value)}
                    placeholder="Search settings..."
                    aria-label="Search settings"
                  />
                </div>
              </div>

              {settingsSaved && (
                <div style={{ marginBottom: '16px', padding: '10px 13px', borderRadius: '9px', background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#047857', fontSize: '12px', fontWeight: 750 }}>
                  ✓ Changes saved to this administrator's ExamPro preferences.
                </div>
              )}

              <div className="exampro-settings-layout">
                <aside className="exampro-settings-nav">
                  <div className="exampro-settings-nav-label">Settings</div>
                  {[
                    ['account', '◉', 'Account'],
                    ['appearance', '◐', 'Appearance'],
                    ['notifications', '♢', 'Notifications'],
                    ['exams', '▤', 'Exam Defaults'],
                    ['proctoring', '◌', 'AI Proctoring'],
                    ['reports', '▥', 'Reports & Analytics'],
                    ['security', '▣', 'Security & Privacy'],
                    ['data', '◫', 'Data & Storage'],
                    ['system', '⚙', 'System'],
                    ['about', 'ⓘ', 'Help & About']
                  ].map(([id, icon, label]) => (
                    <button
                      type="button"
                      key={id}
                      className={settingsCategory === id ? 'active' : ''}
                      onClick={() => setSettingsCategory(id)}
                    >
                      <span className="exampro-settings-nav-icon">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </aside>

                <main className="exampro-settings-main">
                  {settingsCategory === 'account' && (
                    <>
                      <div className="exampro-settings-main-head">
                        <h3>Account</h3>
                        <p>Personal information and administrator identity used across the ExamPro control panel.</p>
                      </div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-profile">
                            <div className="exampro-settings-avatar">{initials || 'A'}</div>
                            <div><strong>{adminName || 'Administrator'}</strong><span>Administrator account · ExamPro Administration</span></div>
                          </div>
                          <div className="exampro-settings-grid" style={{ paddingTop: '18px' }}>
                            <div className="exampro-settings-field"><label>Full Name</label><input className="exampro-settings-input full" value={adminName} onChange={(e) => { setAdminName(e.target.value); setSettingsSaved(false); }} /></div>
                            <div className="exampro-settings-field"><label>Email Address</label><input className="exampro-settings-input full" type="email" name="email" value={settingsData.email} onChange={handleSettingsChange} placeholder="admin@example.com" /></div>
                            <div className="exampro-settings-field"><label>Department</label><input className="exampro-settings-input full" name="department" value={settingsData.department} onChange={handleSettingsChange} placeholder="Computer Science" /></div>
                            <div className="exampro-settings-field"><label>Role</label><input className="exampro-settings-input full" value="Administrator" readOnly style={{ background: '#f8fafc', color: '#64748b' }} /></div>
                          </div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Account status</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Administrator access</strong><span>This account is currently active and can access the administration panel.</span></div><span className="exampro-settings-status"><span className="exampro-settings-status-dot" /> Active</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Authentication</strong><span>Managed by the ExamPro authentication service.</span></div><button type="button" className="exampro-settings-btn" onClick={() => alert('Password changes are managed by the ExamPro authentication service.')}>Manage password</button></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'appearance' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Appearance</h3><p>Control how the ExamPro administration interface looks and behaves on your screen.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Theme</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Color theme</strong><span>Switch between the dashboard's available light and dark appearance.</span></div><ThemeToggle /></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Compact tables</strong><span>Reduce table row spacing when viewing students, results and reports.</span></div><button type="button" className={`exampro-settings-toggle ${settingsData.compactTables ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name: 'compactTables', type: 'checkbox', checked: !settingsData.compactTables } })}><span /></button></div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Regional preferences</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Language</strong><span>Language used for administrator interface labels.</span></div><select className="exampro-settings-select" name="language" value={settingsData.language} onChange={handleSettingsChange}><option>English</option><option>Hindi</option><option>Kannada</option><option>Marathi</option></select></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Date format</strong><span>Format used for dates displayed in administrative views.</span></div><select className="exampro-settings-select" name="dateFormat" value={settingsData.dateFormat} onChange={handleSettingsChange}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'notifications' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Notifications</h3><p>Choose which administrative events should appear as notifications or reminders.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Administration</div>
                          {[
                            ['notifications', 'Admin notifications', 'Receive important system and administration notifications.'],
                            ['examReminders', 'Exam reminders', 'Receive reminders related to upcoming or active examinations.']
                          ].map(([name, title, description]) => (
                            <div className="exampro-settings-row" key={name}><div className="exampro-settings-row-copy"><strong>{title}</strong><span>{description}</span></div><button type="button" className={`exampro-settings-toggle ${settingsData[name] ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name, type: 'checkbox', checked: !settingsData[name] } })}><span /></button></div>
                          ))}
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Notification delivery</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>In-app notifications</strong><span>Notifications remain visible inside the administrator dashboard.</span></div><span className="exampro-settings-status"><span className="exampro-settings-status-dot" /> Enabled</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Email delivery</strong><span>Your configured administrator email can be used by the authentication or notification service.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>{settingsData.email || 'Not configured'}</span></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'exams' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Exam Defaults</h3><p>Default values applied when creating new examinations. Existing examinations are not changed by these preferences.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Default examination configuration</div>
                          <div className="exampro-settings-grid" style={{ paddingTop: '18px' }}>
                            <div className="exampro-settings-field"><label>Default Duration (minutes)</label><input className="exampro-settings-input full" type="number" min="1" name="defaultDuration" value={settingsData.defaultDuration} onChange={handleSettingsChange} /></div>
                            <div className="exampro-settings-field"><label>Default Passing Marks (%)</label><input className="exampro-settings-input full" type="number" min="0" max="100" name="defaultPassingMarks" value={settingsData.defaultPassingMarks} onChange={handleSettingsChange} /></div>
                          </div>
                          {[['randomizeQuestions','Randomize questions','Present questions in a different order for each candidate.'],['autoSubmitOnTime','Auto-submit when time ends','Submit the candidate attempt automatically when the examination timer expires.'],['showResultAfterSubmit','Show result after submission','Allow result information to be shown immediately after an attempt is submitted.'],['defaultProctoring','Enable AI proctoring by default','Pre-enable AI proctoring when a new examination is created.']].map(([name,title,description]) => (
                            <div className="exampro-settings-row" key={name}><div className="exampro-settings-row-copy"><strong>{title}</strong><span>{description}</span></div><button type="button" className={`exampro-settings-toggle ${settingsData[name] ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name, type: 'checkbox', checked: !settingsData[name] } })}><span /></button></div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'proctoring' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>AI Proctoring</h3><p>Configure default AI monitoring behavior used by the ExamPro proctoring workflow.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Detection preferences</div>
                          <div className="exampro-settings-grid" style={{ paddingTop: '18px' }}>
                            <div className="exampro-settings-field"><label>Frame Check Interval (seconds)</label><input className="exampro-settings-input full" type="number" min="1" name="proctoringInterval" value={settingsData.proctoringInterval} onChange={handleSettingsChange} /></div>
                            <div className="exampro-settings-field"><label>Warning Threshold</label><input className="exampro-settings-input full" type="number" min="1" name="warningThreshold" value={settingsData.warningThreshold} onChange={handleSettingsChange} /></div>
                          </div>
                          {[
                            ['blockMultipleFaces','Multiple-face detection','Flag sessions when more than one face is detected in the camera frame.'],
                            ['detectPhone','Phone detection','Enable phone-related cheating detection when supported by the AI service.'],
                            ['detectTabSwitch','Tab-switch monitoring','Track browser focus changes during a proctored examination.'],
                            ['saveProctoringSnapshots','Save proctoring snapshots','Allow detected event frames to be retained for review when supported.']
                          ].map(([name,title,description]) => (
                            <div className="exampro-settings-row" key={name}><div className="exampro-settings-row-copy"><strong>{title}</strong><span>{description}</span></div><button type="button" className={`exampro-settings-toggle ${settingsData[name] ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name, type: 'checkbox', checked: !settingsData[name] } })}><span /></button></div>
                          ))}
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Service status</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>AI detection service</strong><span>Runtime service used by the current administrator proctoring screen.</span></div><span className="exampro-settings-status"><span className="exampro-settings-status-dot" /> Flask service · Port 5000</span></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'reports' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Reports & Analytics</h3><p>Configure the default presentation and refresh behavior of administrator reports.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Report behavior</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Auto refresh reports</strong><span>Allow report views to refresh their data automatically when supported.</span></div><button type="button" className={`exampro-settings-toggle ${settingsData.autoRefreshReports ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name: 'autoRefreshReports', type: 'checkbox', checked: !settingsData.autoRefreshReports } })}><span /></button></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Rows per report page</strong><span>Default number of student results displayed in report tables.</span></div><select className="exampro-settings-select" name="reportPageSize" value={settingsData.reportPageSize} onChange={handleSettingsChange}><option value="10">10 rows</option><option value="25">25 rows</option><option value="50">50 rows</option><option value="100">100 rows</option></select></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Default report range</strong><span>Initial time range used when a report filter is available.</span></div><select className="exampro-settings-select" name="reportDateRange" value={settingsData.reportDateRange} onChange={handleSettingsChange}><option value="all">All available results</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'security' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Security & Privacy</h3><p>Review administrator session, login and audit preferences. Authentication credentials remain managed by the backend service.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Session security</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Session timeout</strong><span>Preferred idle timeout for the administrator session.</span></div><select className="exampro-settings-select" name="sessionTimeout" value={settingsData.sessionTimeout} onChange={handleSettingsChange}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="120">120 minutes</option></select></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Login alerts</strong><span>Record the preference for notifying administrators about new sign-ins.</span></div><button type="button" className={`exampro-settings-toggle ${settingsData.loginAlerts ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name: 'loginAlerts', type: 'checkbox', checked: !settingsData.loginAlerts } })}><span /></button></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Audit logging</strong><span>Keep administrative activity logging enabled where the backend supports it.</span></div><button type="button" className={`exampro-settings-toggle ${settingsData.auditLogging ? 'on' : ''}`} onClick={() => handleSettingsChange({ target: { name: 'auditLogging', type: 'checkbox', checked: !settingsData.auditLogging } })}><span /></button></div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Credentials</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Password</strong><span>Password changes are handled by the ExamPro authentication service.</span></div><button type="button" className="exampro-settings-btn" onClick={() => alert('Password changes are managed by the ExamPro authentication service.')}>Change password</button></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'data' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Data & Storage</h3><p>Review local preferences and data-retention choices used by the administrator interface.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Data retention</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Proctoring / report retention preference</strong><span>This preference describes how long relevant data should be retained where backend policies support configurable retention.</span></div><select className="exampro-settings-select" name="dataRetention" value={settingsData.dataRetention} onChange={handleSettingsChange}><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">1 year</option></select></div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Browser storage</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Administrator preferences</strong><span>Saved settings are currently stored in this browser's local storage for this administrator interface.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>Local browser storage</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Clear saved preferences</strong><span>Remove the locally stored ExamPro administrator settings and restore defaults.</span></div><button type="button" className="exampro-settings-btn" onClick={resetSettings}>Reset settings</button></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'system' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>System</h3><p>View the services used by the ExamPro administration panel and basic application configuration.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Application services</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>React administration frontend</strong><span>Current administrator interface running in the browser.</span></div><span className="exampro-settings-status"><span className="exampro-settings-status-dot" /> Running</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Spring Boot backend</strong><span>Primary ExamPro REST API used by administration features.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>http://localhost:8080</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>AI / Flask backend</strong><span>Question generation, proctoring and AI evaluation service.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>http://localhost:5000</span></div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Maintenance</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Reload dashboard data</strong><span>Return to the dashboard and refresh the current administration data.</span></div><button type="button" className="exampro-settings-btn" onClick={() => { setActiveSection('dashboard'); window.location.reload(); }}>Reload dashboard</button></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsCategory === 'about' && (
                    <>
                      <div className="exampro-settings-main-head"><h3>Help & About</h3><p>Information about this ExamPro administration module and the support actions available to you.</p></div>
                      <div className="exampro-settings-content">
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">ExamPro Administration</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Platform</strong><span>Full-stack online examination and assessment platform.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>ExamPro</span></div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Administration modules</strong><span>Dashboard, exam management, question bank, students, results, leaderboard, AI question generation, AI proctoring, reports and settings.</span></div><span style={{ color: '#64748b', fontSize: '12px' }}>Admin Panel</span></div>
                        </div>
                        <div className="exampro-settings-card">
                          <div className="exampro-settings-card-title">Support</div>
                          <div className="exampro-settings-row"><div className="exampro-settings-row-copy"><strong>Need help?</strong><span>Review the module behavior and backend logs when a feature does not respond as expected.</span></div><button type="button" className="exampro-settings-btn" onClick={() => alert('For development support, check the React browser console, Spring Boot logs, and Flask AI service logs.')}>View troubleshooting</button></div>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsSearch.trim() && ![
                    ['account', 'Account'], ['appearance', 'Appearance'], ['notifications', 'Notifications'], ['exams', 'Exam Defaults'], ['proctoring', 'AI Proctoring'], ['reports', 'Reports & Analytics'], ['security', 'Security & Privacy'], ['data', 'Data & Storage'], ['system', 'System'], ['about', 'Help & About']
                  ].some(([, label]) => label.toLowerCase().includes(settingsSearch.trim().toLowerCase())) && (
                    <div className="exampro-settings-content" style={{ paddingTop: 0 }}>
                      <div className="exampro-settings-empty">No settings category matches <strong>{settingsSearch}</strong>. Try Account, Appearance, Notifications, Exam Defaults, AI Proctoring, Reports, Security, Data, System or Help.</div>
                    </div>
                  )}
                </main>
              </div>

              <div className="exampro-settings-footer">
                <span className="exampro-settings-save-state">{settingsSaved ? '✓ All changes saved' : 'Unsaved changes are kept in this page until you save.'}</span>
                <div className="exampro-settings-footer-actions">
                  <button type="button" className="exampro-settings-btn" onClick={resetSettings}>Reset to defaults</button>
                  <button type="button" className="exampro-settings-btn primary" onClick={saveSettings}>Save changes</button>
                </div>
              </div>
            </div>
          </section>
        ) : (

          <>

        {/* ================= WELCOME ================= */}

        <section className="admin-welcome">



          <div>

            <span className="welcome-tag">

              EXAMPRO ADMINISTRATION

            </span>



            <h2>

              Welcome back, {adminName.split(' ')[0]}.

            </h2>



            <p>

              Manage examinations, students, questions and

              assessment activities from one place.

            </p>

          </div>



          <button

            className="welcome-create-btn"

            onClick={() => handleSidebarClick('create-exam')}

          >

            <span>＋</span>

            Create New Exam

          </button>



        </section>



        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">



          <div className="stat-card">



            <div className="stat-top">

              <span className="stat-title">

                TOTAL EXAMS

              </span>



              <div className="stat-icon">▣</div>

            </div>



            <div className="stat-number">

              {loadingExams ? '...' : totalExams}

            </div>



            <span className="stat-description">

              Exams available in the system

            </span>



          </div>



          <div className="stat-card">



            <div className="stat-top">

              <span className="stat-title">

                ACTIVE EXAMS

              </span>



              <div className="stat-icon">●</div>

            </div>



            <div className="stat-number">

              {loadingExams ? '...' : activeExams}

            </div>



            <span className="stat-description">

              Currently running examinations

            </span>



          </div>



          <div className="stat-card">



            <div className="stat-top">

              <span className="stat-title">

                STUDENTS

              </span>



              <div className="stat-icon">♙</div>

            </div>



            <div className="stat-number">

              {studentCount}

            </div>



            <span className="stat-description">

              Registered student accounts

            </span>



          </div>



          <div className="stat-card">



            <div className="stat-top">

              <span className="stat-title">

                ATTEMPTS

              </span>



              <div className="stat-icon">↗</div>

            </div>



            <div className="stat-number muted-number">

              —

            </div>



            <span className="stat-description">

              Attempt analytics coming soon

            </span>



          </div>



        </section>



        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-section">



          <div className="section-heading">



            <div>

              <span>QUICK ACCESS</span>

              <h2>Administration Tools</h2>

            </div>



          </div>



          <div className="quick-grid">



            <button

              className="quick-card"

              onClick={() => handleSidebarClick('create-exam')}

            >

              <div className="quick-icon black-icon">

                ＋

              </div>



              <div>

                <strong>Create Exam</strong>

                <p>Build a new assessment</p>

              </div>



              <span className="quick-arrow">→</span>

            </button>



            <button

              className="quick-card"

              onClick={() => handleSidebarClick('question-bank')}

            >

              <div className="quick-icon">

                ▤

              </div>



              <div>

                <strong>Question Bank</strong>

                <p>Manage examination questions</p>

              </div>



              <span className="quick-arrow">→</span>

            </button>



            <button

              className="quick-card"

              onClick={() => setActiveSection('ai-generator')}

            >

              <div className="quick-icon">

                ✦

              </div>



              <div>

                <strong>AI Generator</strong>

                <p>Generate questions with AI</p>

              </div>



              <span className="quick-arrow">→</span>

            </button>



            <button

              className="quick-card"

              onClick={() => handleSidebarClick('reports')}

            >

              <div className="quick-icon">

                ▥

              </div>



              <div>

                <strong>Reports</strong>

                <p>View assessment reports</p>

              </div>



              <span className="quick-arrow">→</span>

            </button>



          </div>



        </section>



        {/* ================= CREATE EXAM ================= */}

        <section

          id="create-exam-section"

          className="create-exam-section"

        >



          <div className="section-heading create-heading">



            <div>

              <span>EXAM MANAGEMENT</span>

              <h2>Create New Examination</h2>

              <p>

                Configure your exam, schedule and questions.

              </p>

            </div>



            <div className="question-counter">

              <strong>{examData.questions.length}</strong>

              <span>Questions Added</span>

            </div>



          </div>



          <form

            className="exam-form"

            onSubmit={createExam}

          >



            {/* EXAM DETAILS */}

            <div className="form-card">



              <div className="form-card-header">

                <div className="form-number">01</div>



                <div>

                  <h3>Exam Details</h3>

                  <p>

                    Basic information about the examination

                  </p>

                </div>

              </div>



              <div className="form-grid">



                <div className="input-group full-width">

                  <label>Exam Title *</label>



                  <input

                    type="text"

                    name="title"

                    placeholder="e.g. Java Full Stack Placement Assessment"

                    value={examData.title}

                    onChange={handleExamChange}

                    required

                  />

                </div>



                <div className="input-group full-width">

                  <label>Description</label>



                  <textarea

                    name="description"

                    placeholder="Describe the purpose and scope of this examination..."

                    value={examData.description}

                    onChange={handleExamChange}

                    rows="4"

                  />

                </div>



                <div className="input-group">

                  <label>Duration (Minutes) *</label>



                  <input

                    type="number"

                    name="durationMinutes"

                    min="1"

                    value={examData.durationMinutes}

                    onChange={handleExamChange}

                    required

                  />

                </div>



                <div className="input-group">

                  <label>Passing Marks (%)</label>



                  <input

                    type="number"

                    name="passingMarks"

                    min="0"

                    max="100"

                    value={examData.passingMarks}

                    onChange={handleExamChange}

                  />

                </div>



                <div className="input-group">

                  <label>Start Time *</label>



                  <input

                    type="datetime-local"

                    name="startTime"

                    value={examData.startTime}

                    onChange={handleExamChange}

                    required

                  />

                </div>



                <div className="input-group">

                  <label>End Time *</label>



                  <input

                    type="datetime-local"

                    name="endTime"

                    value={examData.endTime}

                    onChange={handleExamChange}

                    required

                  />

                </div>



              </div>



              <div className="proctoring-row">



                <div className="proctoring-content">



                  <div className="proctoring-icon">

                    ◉

                  </div>



                  <div>

                    <strong>AI Proctoring</strong>



                    <p>

                      Monitor candidate activity during the

                      examination.

                    </p>

                  </div>



                </div>



                <label className="switch">



                  <input

                    type="checkbox"

                    name="enableProctoring"

                    checked={examData.enableProctoring}

                    onChange={handleExamChange}

                  />



                  <span className="slider"></span>



                </label>



              </div>



            </div>



            {/* QUESTIONS */}

            <div className="form-card">



              <div className="form-card-header">



                <div className="form-number">02</div>



                <div>

                  <h3>Build Question Paper</h3>

                  <p>

                    Add MCQ or coding questions to the exam.

                  </p>

                </div>



              </div>



              {/* CURRENT QUESTION */}

              <div className="question-builder">



                <div className="builder-header">



                  <div>

                    <strong>New Question</strong>

                    <span>

                      Question #{examData.questions.length + 1}

                    </span>

                  </div>



                </div>



                <div className="input-group">



                  <label>Question Text *</label>



                  <textarea

                    name="questionText"

                    placeholder="Enter your question here..."

                    value={currentQuestion.questionText}

                    onChange={handleQuestionChange}

                    rows="4"

                  />



                </div>



                <div className="form-grid">



                  <div className="input-group">



                    <label>Question Type</label>



                    <select

                      name="questionType"

                      value={currentQuestion.questionType}

                      onChange={handleQuestionChange}

                    >

                      <option value="MCQ">

                        Multiple Choice

                      </option>



                      <option value="CODING">

                        Coding

                      </option>

                    </select>



                  </div>



                  <div className="input-group">



                    <label>Marks</label>



                    <input

                      type="number"

                      name="marks"

                      min="1"

                      value={currentQuestion.marks}

                      onChange={handleQuestionChange}

                    />



                  </div>



                </div>



                {/* MCQ */}

                {currentQuestion.questionType === 'MCQ' && (

                  <div className="mcq-area">



                    <div className="options-title">

                      Answer Options

                    </div>



                    <div className="option-grid">



                      <div className="option-input">

                        <span>A</span>



                        <input

                          type="text"

                          name="optionA"

                          placeholder="Option A"

                          value={currentQuestion.optionA}

                          onChange={handleQuestionChange}

                        />

                      </div>



                      <div className="option-input">

                        <span>B</span>



                        <input

                          type="text"

                          name="optionB"

                          placeholder="Option B"

                          value={currentQuestion.optionB}

                          onChange={handleQuestionChange}

                        />

                      </div>



                      <div className="option-input">

                        <span>C</span>



                        <input

                          type="text"

                          name="optionC"

                          placeholder="Option C"

                          value={currentQuestion.optionC}

                          onChange={handleQuestionChange}

                        />

                      </div>



                      <div className="option-input">

                        <span>D</span>



                        <input

                          type="text"

                          name="optionD"

                          placeholder="Option D"

                          value={currentQuestion.optionD}

                          onChange={handleQuestionChange}

                        />

                      </div>



                    </div>



                    <div className="input-group correct-answer">



                      <label>Correct Answer</label>



                      <select

                        name="correctAnswer"

                        value={currentQuestion.correctAnswer}

                        onChange={handleQuestionChange}

                      >

                        <option value="A">

                          Option A

                        </option>



                        <option value="B">

                          Option B

                        </option>



                        <option value="C">

                          Option C

                        </option>



                        <option value="D">

                          Option D

                        </option>

                      </select>



                    </div>



                  </div>

                )}



                {/* CODING */}

                {currentQuestion.questionType === 'CODING' && (

                  <div className="coding-area">



                    <div className="input-group">

                      <label>Problem Statement</label>



                      <textarea

                        name="problemStatement"

                        placeholder="Describe the coding problem..."

                        value={currentQuestion.problemStatement}

                        onChange={handleQuestionChange}

                        rows="5"

                      />

                    </div>



                    <div className="form-grid">



                      <div className="input-group">

                        <label>Sample Input</label>



                        <textarea

                          className="code-input"

                          name="sampleInput"

                          placeholder="5"

                          value={currentQuestion.sampleInput}

                          onChange={handleQuestionChange}

                          rows="4"

                        />

                      </div>



                      <div className="input-group">

                        <label>Sample Output</label>



                        <textarea

                          className="code-input"

                          name="sampleOutput"

                          placeholder="25"

                          value={currentQuestion.sampleOutput}

                          onChange={handleQuestionChange}

                          rows="4"

                        />

                      </div>



                    </div>



                    <div className="input-group">



                      <label>

                        Test Cases (JSON)

                      </label>



                      <textarea

                        className="code-input"

                        name="testCases"

                        placeholder='[{"input":"5","output":"25"}]'

                        value={currentQuestion.testCases}

                        onChange={handleQuestionChange}

                        rows="5"

                      />



                    </div>



                  </div>

                )}



                <button

                  type="button"

                  className="add-question-btn"

                  onClick={addQuestion}

                >

                  <span>＋</span>

                  Add Question

                </button>



              </div>



              {/* ADDED QUESTIONS */}

              {examData.questions.length > 0 && (

                <div className="added-questions">



                  <div className="added-heading">

                    <div>

                      <strong>

                        Added Questions

                      </strong>



                      <span>

                        {examData.questions.length}{' '}

                        question

                        {examData.questions.length !== 1

                          ? 's'

                          : ''}

                      </span>

                    </div>

                  </div>



                  {examData.questions.map((q, index) => (

                    <div

                      className="added-question"

                      key={index}

                    >



                      <div className="added-question-number">

                        {String(index + 1).padStart(2, '0')}

                      </div>



                      <div className="added-question-content">



                        <strong>

                          {q.questionText.length > 80

                            ? q.questionText.substring(0, 80) +

                              '...'

                            : q.questionText}

                        </strong>



                        <div className="question-meta">



                          <span>

                            {q.questionType === 'MCQ'

                              ? 'Multiple Choice'

                              : 'Coding'}

                          </span>



                          <span>•</span>



                          <span>

                            {q.marks} marks

                          </span>



                        </div>



                      </div>



                      <button

                        type="button"

                        className="remove-question-btn"

                        onClick={() =>

                          removeQuestion(index)

                        }

                      >

                        Remove

                      </button>



                    </div>

                  ))}



                </div>

              )}



            </div>



            {/* FORM ACTIONS */}

            <div className="form-actions">



              <div className="form-summary">



                <span>

                  {examData.questions.length} question

                  {examData.questions.length !== 1

                    ? 's'

                    : ''}{' '}

                  added

                </span>



                <span className="summary-dot">

                  •

                </span>



                <span>

                  {examData.questions.reduce(

                    (total, question) =>

                      total + Number(question.marks || 0),

                    0

                  )}{' '}

                  total marks

                </span>



              </div>



              <button

                type="submit"

                className="create-exam-btn"

              >

                Create Examination

                <span>→</span>

              </button>



            </div>



          </form>



        </section>



        {/* ================= CURRENT EXAMS ================= */}

        <section className="current-exams-section">



          <div className="section-heading">



            <div>

              <span>OVERVIEW</span>

              <h2>Available Examinations</h2>

            </div>



            <span className="exam-count-badge">

              {totalExams} Total

            </span>



          </div>



          {loadingExams ? (

            <div className="empty-exams">

              <div className="loading-spinner"></div>

              <p>Loading examinations...</p>

            </div>

          ) : availableExams.length === 0 ? (

            <div className="empty-exams">

              <div className="empty-icon">

                ▣

              </div>



              <h3>No examinations yet</h3>



              <p>

                Create your first examination using the

                form above.

              </p>

            </div>

          ) : (

            <div className="admin-exam-list">



              {availableExams.slice(0, 6).map((exam) => (

                <div

                  className="admin-exam-card"

                  key={exam.id}

                >



                  <div className="admin-exam-main">



                    <div className="exam-status-dot"></div>



                    <div>

                      <h3>{exam.title}</h3>



                      <p>

                        {exam.description ||

                          'No description provided.'}

                      </p>

                    </div>



                  </div>



                  <div className="admin-exam-meta">



                    <span>

                      ⏱ {exam.durationMinutes || 0} min

                    </span>



                    <span>

                      ✓ {exam.totalMarks || 0} marks

                    </span>



                    <span>

                      Pass {exam.passingMarks || 0}%

                    </span>



                  </div>



                </div>

              ))}



            </div>

          )}



        </section>



        {/* FOOTER */}

        <footer className="admin-footer">

          <span>

            ExamPro Administration Panel

          </span>



          <span>

            AI-Powered Online Examination System

          </span>

        </footer>

          </>

        )}



      </main>



    </div>

  );

}



export default AdminDashboard;