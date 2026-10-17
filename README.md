# 🎯 SkillMatch AI - AI-Powered Career Intelligence Platform

SkillMatch AI is a full-stack career acceleration platform featuring automated resume analysis, AI-driven skill gap detection, dynamic learning roadmaps, interactive skill assessments, and AI voice mock interviews with real-time feedback.

![SkillMatch Platform](https://raw.githubusercontent.com/sabarigiri/SkillMatch/main/frontend/public/favicon.svg)

---

## ✨ Features

- **📊 AI Resume Analyzer**: Upload resumes (PDF/DOCX) for deep extraction, ATS score calculation, strength breakdown, and improvement tips.
- **🎯 Job Description Matcher**: Compare any resume against job postings with granular keyword matching and missing skills analysis.
- **🧭 Dynamic Learning Roadmap**: Generate role-specific career milestones, step-by-step certifications, and curated study tracks.
- **📝 Interactive Skill Assessment**: 10-question timed quizzes tailored to specific technologies with difficulty levels and instant score calculation.
- **🎙️ Real-time Voice Mock Interviews**: Browser-based speech recognition microphone interviews with questions, recording indicators, transcript storage, and database persistence.
- **📈 Comprehensive Progress Tracker**: Visual analytics, radar charts, and score trends across assessments and resume iterations.
- **🔐 Modern Auth & Privacy**: Anti-autofill credential management, "Remember Me" local persistence, JWT token authentication, and instant 1-click credential clearing.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** + **Lucide React Icons**
- **React Router v6** (with GitHub Pages SPA support)
- **Web Speech API** for hands-free voice interviews
- **Axios** with automatic auth token interceptors

### Backend
- **Java 21** + **Spring Boot 3**
- **Spring Security** + **JWT (JSON Web Tokens)**
- **Spring Data MongoDB** + **MongoDB**
- **Apache PDFBox** for resume document parsing

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or v20+
- **Java**: JDK 21+
- **Maven**: 3.8+
- **MongoDB**: Local MongoDB instance running on port 27017 or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```
Backend API will start at `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🌐 Deployment to GitHub Pages

For complete step-by-step instructions on deploying the frontend to GitHub Pages via automated GitHub Actions and hosting the backend on Render/Railway, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📄 License
MIT License. Built for high-performance career intelligence.
