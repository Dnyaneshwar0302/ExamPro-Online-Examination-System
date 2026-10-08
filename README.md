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

<div align="center">

# ✨ EXAMPRO ECOSYSTEM

<i>Everything required to conduct secure, intelligent and modern online examinations.</i>

</div>

<br>

<table>
<tr>

<td width="25%" align="center">

### 🤖

# AI PROCTORING

AI-powered examination monitoring using computer vision.

<br>

**Face Detection**

**Multiple Face Detection**

**Device Detection**

**Cheating Detection**

<br>

<img src="https://img.shields.io/badge/AI-667EEA?style=for-the-badge&logoColor=white"/>

</td>

<td width="25%" align="center">

### 💻

# CODING EVALUATION

Automated programming examination and code evaluation.

<br>

**Run Code**

**Test Cases**

**Output Matching**

**Automatic Scoring**

<br>

<img src="https://img.shields.io/badge/CODE-E67E22?style=for-the-badge&logoColor=white"/>

</td>

<td width="25%" align="center">

### 📝

# EXAM MANAGEMENT

Complete examination management for administrators and students.

<br>

**Create Exams**

**MCQ Questions**

**Coding Questions**

**Question Bank**

<br>

<img src="https://img.shields.io/badge/EXAMS-00BCD4?style=for-the-badge&logoColor=white"/>

</td>

<td width="25%" align="center">

### 📊

# ANALYTICS

Monitor examination performance and student results.

<br>

**Results**

**Leaderboard**

**Performance**

**Reports**

<br>

<img src="https://img.shields.io/badge/ANALYTICS-E91E63?style=for-the-badge&logoColor=white"/>

</td>

</tr>
</table>

---

# 🏗️ SYSTEM ARCHITECTURE

<div align="center">

### ⚡ Interactive Architecture Overview

The architecture below shows how the frontend, backend, database and AI services communicate.

</div>

```mermaid
flowchart LR

    %% USERS
    U["👨‍🎓 STUDENT<br/>Login • Exams • Results"]
    A["👨‍💼 ADMIN<br/>Manage • Generate • Analyze"]

    %% FRONTEND
    F["⚛️ REACT FRONTEND<br/><br/>Dashboard<br/>Exam Room<br/>Code Editor<br/>Admin Panel<br/>Analytics"]

    %% BACKEND
    B["☕ SPRING BOOT BACKEND<br/><br/>Authentication<br/>Exam Management<br/>Question Management<br/>Result Processing<br/>REST APIs"]

    %% DATABASE
    DB[("🗄️ MYSQL DATABASE<br/><br/>Users<br/>Exams<br/>Questions<br/>Results<br/>Cheating Logs")]

    %% AI SERVICE
    AI["🐍 PYTHON AI SERVICE<br/><br/>AI Question Generation<br/>AI Proctoring<br/>Code Evaluation<br/>Computer Vision"]

    %% AI COMPONENTS
    CV["👁️ COMPUTER VISION<br/><br/>OpenCV<br/>MediaPipe<br/>YOLO11"]

    CODE["💻 CODE EVALUATOR<br/><br/>Java<br/>Python<br/>C<br/>C++<br/>JavaScript"]

    %% CONNECTIONS
    U -->|"HTTP Requests"| F
    A -->|"HTTP Requests"| F

    F -->|"REST API / JSON"| B

    B <-->|"JPA / SQL"| DB

    B -->|"HTTP / AI APIs"| AI

    AI --> CV
    AI --> CODE

    %% STYLES
    classDef user fill:#172554,stroke:#6366f1,color:#ffffff,stroke-width:2px;
    classDef frontend fill:#071f3d,stroke:#00d9ff,color:#ffffff,stroke-width:3px;
    classDef backend fill:#052e1b,stroke:#22c55e,color:#ffffff,stroke-width:3px;
    classDef database fill:#082f49,stroke:#38bdf8,color:#ffffff,stroke-width:3px;
    classDef ai fill:#3b0764,stroke:#d946ef,color:#ffffff,stroke-width:3px;
    classDef vision fill:#164e63,stroke:#22d3ee,color:#ffffff,stroke-width:3px;
    classDef coding fill:#451a03,stroke:#fb923c,color:#ffffff,stroke-width:3px;

    class U,A user;
    class F frontend;
    class B backend;
    class DB database;
    class AI ai;
    class CV vision;
    class CODE coding;
