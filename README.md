<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,50:764ba2,100:f093fb&height=220&section=header&text=ExamPro&fontSize=70&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Online%20Examination%20System&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<br>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=667EEA&center=true&vCenter=true&width=750&lines=AI-Powered+Online+Examination+Platform;Intelligent+AI+Proctoring;Automated+Coding+Evaluation;Real-Time+Examination+Management;Performance+Analytics+%26+Leaderboards" alt="Typing Animation"/>

<br><br>

<img src="https://img.shields.io/badge/Project-ExamPro-667eea?style=for-the-badge&logo=googleclassroom&logoColor=white"/>
<img src="https://img.shields.io/badge/AI-Powered-764ba2?style=for-the-badge&logo=artificialintelligence&logoColor=white"/>
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>

<br>

<img src="https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white"/>
<img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white"/>
<img src="https://img.shields.io/badge/MediaPipe-00A98F?style=flat-square&logo=google&logoColor=white"/>
<img src="https://img.shields.io/badge/YOLO11-111111?style=flat-square&logo=yolo&logoColor=white"/>

<br><br>

<p>
  <b>🚀 A complete full-stack examination platform combining Web Development, Artificial Intelligence, Computer Vision and Automated Code Evaluation.</b>
</p>

</div>

---

# 📑 Table of Contents

- [🎯 About ExamPro](#-about-exampro)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🔄 System Workflow](#-system-workflow)
- [🤖 AI-Powered Features](#-ai-powered-features)
- [💻 Coding Examination System](#-coding-examination-system)
- [👨‍💼 Admin Module](#-admin-module)
- [👨‍🎓 Student Module](#-student-module)
- [📸 Screenshots](#-screenshots)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔐 Security & Configuration](#-security--configuration)
- [📊 Main Components](#-main-components)
- [🚀 Future Enhancements](#-future-enhancements)
- [🎓 Project Highlights](#-project-highlights)
- [👨‍💻 Developer](#-developer)

---

# 🎯 About ExamPro

**ExamPro** is a full-stack **AI-Powered Online Examination System** designed to provide a secure, intelligent and interactive environment for conducting online assessments.

The platform provides dedicated experiences for:

- 👨‍💼 Administrators
- 👨‍🎓 Students

Administrators can create and manage examinations, generate questions using AI, manage students, maintain question banks and analyze examination results.

Students can register, participate in examinations, solve MCQ and programming questions, receive automated coding evaluation and view their performance.

The platform also includes an **AI-based proctoring system** that uses computer vision to detect suspicious activities during examinations.

---

# ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 Artificial Intelligence

- AI Question Generation
- AI-Based Proctoring
- Face Detection
- Multiple Face Detection
- Face Absence Detection
- Electronic Device Detection
- Automated Code Evaluation

</td>

<td width="50%">

### 📝 Examination

- MCQ Examinations
- Coding Examinations
- Online Timer
- Automatic Evaluation
- Test Case Execution
- Marks Calculation
- Result Generation
- Leaderboard

</td>
</tr>

<tr>
<td>

### 👨‍💼 Administration

- Admin Authentication
- Examination Management
- Question Bank
- Student Management
- AI Question Generator
- Results Management
- Performance Analytics

</td>

<td>

### 👨‍🎓 Student

- Student Registration
- Student Login
- Examination Dashboard
- Online Examination
- Coding Editor
- Code Execution
- Result Analysis
- Profile Management

</td>
</tr>
</table>

---

# 🏗️ System Architecture

<div align="center">

```text
                         ┌──────────────────────────────┐
                         │          👨‍🎓 STUDENT          │
                         │                              │
                         │  Login / Register            │
                         │  Take Examination            │
                         │  Solve MCQ / Coding          │
                         │  View Results                 │
                         └──────────────┬───────────────┘
                                        │
                                        │ HTTP / REST API
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         ⚛️ REACT FRONTEND                                │
│                                                                          │
│  Landing Page │ Authentication │ Dashboard │ Exam Room │ Code Editor    │
│  Admin Panel   │ Question Bank │ Results   │ Analytics │ Leaderboard    │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
                               │ REST APIs
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         ☕ SPRING BOOT BACKEND                           │
│                                                                          │
│  Authentication │ Exam Management │ Question Management                 │
│  Student Management │ Result Processing │ Leaderboard                    │
│  Coding Evaluation │ AI Service Communication                           │
└───────────────┬──────────────────────────────┬───────────────────────────┘
                │                              │
                │                              │ HTTP
                ▼                              ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────┐
│        🗄️ MYSQL             │    │          🐍 PYTHON AI SERVICE         │
│                              │    │                                      │
│ Users                        │    │ AI Question Generation               │
│ Exams                        │    │ AI Proctoring                        │
│ Questions                    │    │ Face Detection                       │
│ Results                      │    │ Device Detection                     │
│ Cheating Logs                │    │ Code Evaluation                      │
└──────────────────────────────┘    └───────────────┬──────────────────────┘
                                                     │
                              ┌──────────────────────┼──────────────────────┐
                              │                      │                      │
                              ▼                      ▼                      ▼
                         OpenCV                MediaPipe                 YOLO11
                         Computer Vision       Face Analysis            Object Detection
