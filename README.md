# ExamPro — AI-Powered Online Examination System

> A full-stack intelligent examination platform with AI-powered question generation, secure online assessments, AI-based proctoring, coding examinations, automated code evaluation, and performance analytics.

---

## 📸 Project Screenshots

### Landing Page

![ExamPro Landing Page](screenshots/landing-page.png)

### Admin Login

![Admin Login](screenshots/admin-login.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### My Examinations

![My Examinations](screenshots/my-examinations.png)

### Coding Examination & Result

![Coding Examination Result](screenshots/coding-exam-result.png)

### AI Proctoring

![AI Proctoring](screenshots/ai-proctoring.png)

---

## 🎯 Project Overview

**ExamPro** is a full-stack AI-powered online examination system designed to provide a secure, intelligent, and interactive environment for conducting online assessments.

The platform provides separate experiences for **Administrators** and **Students**.

Administrators can create and manage examinations, generate questions using AI, manage students, maintain a question bank, and analyze examination results.

Students can register, take examinations, solve programming problems, receive automated coding evaluation, view their performance, and download examination-related reports.

The system also integrates **AI-based proctoring** to detect suspicious activities during examinations.

---

## ✨ Key Features

### 👨‍💼 Admin Features

- Secure Admin Login
- Admin Registration with Authorization Code
- Admin Dashboard
- Create and Manage Examinations
- Add Multiple-Choice Questions
- Add Coding Questions
- AI-Powered Question Generation
- Question Bank Management
- Student Management
- Examination Results
- Leaderboard
- Performance Analytics
- Examination Management

---

### 👨‍🎓 Student Features

- Student Registration
- Student Login
- Personalized Student Dashboard
- View Available Examinations
- Start Online Examination
- Multiple-Choice Questions
- Coding Questions
- Programming Language Selection
- Starter / Boilerplate Code
- Run Code
- Submit Code
- Automated Test Case Evaluation
- Examination Timer
- Examination Result
- Performance Tracking
- Profile and Account Management

---

## 🤖 AI-Powered Features

### 1. AI Question Generation

ExamPro can generate examination questions based on:

- Topic
- Question Type
- Difficulty Level
- Programming Language
- Number of Questions

Supported areas include:

- Aptitude
- Java
- Python
- SQL
- JavaScript
- HTML
- CSS
- Spring Boot
- Programming / Coding

---

### 2. AI-Based Proctoring

The examination system uses computer vision techniques to monitor examination sessions.

The AI proctoring system can detect suspicious situations such as:

- Multiple faces
- Face absence
- Electronic devices
- Suspicious examination activity

The system uses:

- MediaPipe
- YOLO11
- OpenCV
- Python

---

### 3. Automated Coding Evaluation

The coding examination system allows students to solve programming problems directly inside the examination environment.

Supported executable languages include:

- Python
- Java
- C
- C++
- JavaScript

The system:

1. Provides a programming problem.
2. Displays starter code.
3. Allows the student to write code.
4. Runs the submitted code.
5. Executes test cases.
6. Compares actual and expected output.
7. Calculates marks.
8. Displays passed and failed test cases.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      ExamPro         │
                         │  Online Examination  │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             ┌────────────┐  ┌────────────┐  ┌──────────────┐
             │  React     │  │ Spring Boot│  │ Python AI    │
             │ Frontend   │  │  Backend   │  │   Service    │
             └─────┬──────┘  └─────┬──────┘  └──────┬───────┘
                   │               │                │
                   │               ▼                │
                   │        ┌──────────────┐        │
                   │        │    MySQL     │        │
                   │        │   Database   │        │
                   │        └──────────────┘        │
                   │                                │
                   │                                ▼
                   │                       ┌─────────────────┐
                   │                       │ AI Proctoring   │
                   │                       │ & Code          │
                   │                       │ Evaluation      │
                   │                       └─────────────────┘
                   │
                   └──────────── API Communication ────────────