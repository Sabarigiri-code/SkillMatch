# SkillMatch AI - Project Documentation & Interview Guide

## 1. Project Overview
**SkillMatch AI** is an intelligent, full-stack career acceleration platform designed to bridge the gap between a candidate's current skill set and the requirements of their target job. By leveraging Generative AI (Google Gemini), the platform analyzes a user's resume alongside a specific job description to provide a realistic ATS match score, identify critical skill gaps, and dynamically generate a personalized week-by-week learning roadmap.

The platform goes beyond analysis by offering **Skill Assessments** and **AI-Driven Mock Interviews** tailored specifically to the user's weak points and the target role, ensuring complete interview readiness.

---

## 2. Tech Stack & Architecture

### **Frontend (Client-Side)**
- **Framework:** React.js (Bootstrapped with Vite for fast HMR and optimized builds)
- **Styling:** Tailwind CSS v4 (Utility-first CSS framework for rapid, responsive UI development)
- **Routing:** React Router DOM (Client-side routing with state preservation)
- **State Management:** React Context API (`WorkspaceContext` for maintaining the active job match globally)
- **HTTP Client:** Axios (For communicating with the Spring Boot backend)
- **Icons & UI:** Lucide React (Icons), Recharts (Radar charts for skill visualization)

### **Backend (Server-Side)**
- **Framework:** Java Spring Boot 3
- **Security:** Spring Security with JWT (JSON Web Tokens) for stateless authentication.
- **Database:** MongoDB (Spring Data MongoDB) - Chosen for its flexible document schema, perfect for storing complex, nested AI-generated JSON objects (like roadmaps and assessments).
- **AI Integration:** Google Gemini API (Accessed via custom `GeminiService` with Spring's `RestTemplate`)

### **Architecture Pattern**
The application follows a **Monolithic Client-Server Architecture** with a clear separation of concerns:
1. **Presentation Layer (React):** Handles UI, user interactions, and client-side validation.
2. **Controller Layer (Spring Boot):** Exposes RESTful endpoints (`@RestController`).
3. **Service Layer (Spring Boot):** Contains core business logic and AI orchestration.
4. **Data Access Layer (Spring Boot):** Interfaces with MongoDB.

---

## 3. Core Features & Workflow

The platform enforces a strict, logical **Continuous Workflow**:

### **Step 1: Resume & Job Analyzer**
- The user uploads their resume (parsed by AI to extract skills, experience, and education).
- The user inputs a Job Description.
- **AI Processing:** Gemini compares the two, calculating an ATS score and categorizing skills into "Matched", "Developing", and "Missing".

### **Step 2: Skill Gap Analysis**
- Visualizes the extracted data.
- Categorizes gaps into High, Medium, and Low priorities.
- If a user navigates here without a current analysis, the system seamlessly pulls the active workspace data from the backend.

### **Step 3: Learning Roadmap Generator**
- Takes the "Missing" and "Developing" skills and asks the AI to construct a personalized syllabus.
- Generates a week-by-week plan containing:
  - Key Topics to study.
  - Practical Tasks.
  - Capstone Projects.

### **Step 4: Skill Assessment**
- Based on the Learning Roadmap, the AI generates a dynamic multiple-choice quiz.
- Evaluates the user's understanding of the required skills, returning a score and detailed explanations for incorrect answers.

### **Step 5: AI Interview Prep**
- Context-aware mock interview simulation.
- The AI adopts the persona of a hiring manager for the specific target role.
- It formulates questions heavily weighted toward the user's identified skill gaps, providing real-time feedback on answers.

---

## 4. Key Technical Challenges & Solutions

### **1. AI Prompt Engineering & JSON Formatting**
**Challenge:** Generative AI models often return unstructured text, making it difficult to render UI components (like charts and roadmaps).
**Solution:** Built robust system prompts enforcing strict JSON schemas. Implemented regex parsing in the Spring Boot `GeminiService` to extract the JSON payload from Markdown blocks, ensuring the frontend always receives structured data.

### **2. Preserving User Flow & State**
**Challenge:** Users navigating via the sidebar or using browser "Back/Forward" buttons would lose their active analysis state, causing the app to crash or show empty screens.
**Solution:** Implemented a `WorkspaceContext` to globally track the `activeJobMatchId`. Updated `useEffect` hooks across all pages to first check local routing state, and if missing, automatically fetch the active workspace's data from MongoDB, ensuring a seamless, constant workflow.

### **3. Quota Management & Fallbacks**
**Challenge:** Free-tier AI APIs (like Gemini Flash) often throw `429 Too Many Requests`.
**Solution:** Implemented mock fallback data generators in the backend `GeminiService`. If the AI API rate-limits the request, the backend safely catches the exception and returns highly realistic, structurally identical mock data so the user experience is never interrupted.

### **4. Security & Authentication**
**Challenge:** Securing user data and roadmaps.
**Solution:** Implemented JWT-based authentication. A custom `JwtAuthenticationFilter` intercepts requests, validates the token, and sets the SecurityContext. Each database query (e.g., fetching roadmaps) strictly filters by the authenticated user's ID.

---

## 5. Potential Interview Questions to Prepare For

**Q: Why did you choose MongoDB instead of a relational database like MySQL or PostgreSQL?**
*Answer:* The core of this application relies on storing highly dynamic, deeply nested JSON data generated by AI (e.g., a roadmap with weeks, topics, tasks, and projects). MongoDB's document-oriented structure maps perfectly to this data, allowing us to store and retrieve these complex objects without requiring complicated SQL JOINs or strict schema migrations every time we tweak the AI's output format.

**Q: How do you handle authentication in this app?**
*Answer:* We use stateless JWT authentication. When a user logs in, Spring Security verifies the credentials and generates a signed JWT. The React frontend stores this token in `localStorage` and attaches it to the `Authorization: Bearer` header of every Axios request. The backend validates the signature on each request to identify the user.

**Q: What would you do to scale this application if you had 10,000 active users?**
*Answer:* 
1. I would implement caching (e.g., Redis) for frequently accessed, non-dynamic data.
2. I would decouple the AI generation into asynchronous background tasks using message queues (like RabbitMQ or Kafka) so the frontend doesn't timeout while waiting for the AI to generate large roadmaps.
3. I would migrate from `localStorage` to `HttpOnly` cookies for better XSS protection for the JWTs.

---

**Built with ❤️ using React, Tailwind V4, Spring Boot, MongoDB, and Gemini AI.**
