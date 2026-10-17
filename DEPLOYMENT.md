# SkillMatch AI - GitHub & Production Hosting Guide

This guide details how to publish **SkillMatch AI** to GitHub and host the frontend on **GitHub Pages** with automated CI/CD, plus options for running the Spring Boot backend.

---

## 1. Quick GitHub Publish (Push to GitHub)

### Step 1: Create a new repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Repository name: `SkillMatch` (or any name you prefer).
3. Set visibility to **Public** (required for free GitHub Pages).
4. **Do NOT** check "Add a README file", `.gitignore`, or license (we already have them).
5. Click **Create repository**.

### Step 2: Push your code from your terminal
Open PowerShell in this project folder (`SkillMatch`) and run:

```bash
# Rename default branch to main
git branch -M main

# Link your local repo to GitHub (replace YOUR_USERNAME with your GitHub handle)
git remote add origin https://github.com/YOUR_USERNAME/SkillMatch.git

# Push your code to GitHub
git push -u origin main
```

---

## 2. Enable Free Frontend Hosting on GitHub Pages

The project includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds Vite and publishes the frontend automatically on every `git push`.

### Activate GitHub Pages in 2 clicks:
1. On GitHub, navigate to your repository.
2. Click **Settings** (top tabs) -> **Pages** (left sidebar under "Code and automation").
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. That's it! GitHub will now trigger the workflow under the **Actions** tab.
5. In ~1 minute, your site will be live at:
   ```
   https://<YOUR_USERNAME>.github.io/SkillMatch/
   ```

### Client-Side SPA Routing & 404 Prevention
- GitHub Pages is a static host. Standard single-page apps (SPAs) crash with a 404 error when users refresh pages like `/login` or `/dashboard`.
- SkillMatch AI is pre-configured with `404.html` and automatic URL rewriting in `index.html` + dynamic base path detection in React Router so every route, refresh, and direct link works seamlessly.

---

## 3. Backend (Spring Boot + MongoDB) Hosting Options

The backend is built with Spring Boot 3 + MongoDB. For full production functionality where any visitor on the internet can register, login, analyze resumes, and take AI voice interviews:

### Option A: Render.com (Recommended Free/Low-Cost)
1. Sign up at [Render.com](https://render.com).
2. Create a free **MongoDB Atlas** database at [mongodb.com/atlas](https://www.mongodb.com/atlas) (M0 Free Tier).
3. On Render, click **New +** -> **Web Service** -> connect your GitHub repo `SkillMatch`.
4. Settings:
   - **Root Directory**: `backend`
   - **Environment**: `Java` (or Docker with `backend/Dockerfile` if preferred)
   - **Build Command**: `./mvnw clean package -DskipTests` (or `mvn clean package -DskipTests`)
   - **Start Command**: `java -jar target/*.jar`
5. Add Environment Variables on Render:
   - `SPRING_DATA_MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random 64-character hex string
6. Copy your Render backend URL (e.g., `https://skillmatch-api.onrender.com`).
7. In GitHub Pages, add a repository secret or update `frontend/.env.production`:
   ```bash
   VITE_API_BASE_URL=https://skillmatch-api.onrender.com/api
   ```
   Commit and push to trigger an automatic frontend redeploy!

### Option B: Railway.app
1. Go to [Railway.app](https://railway.app) -> **New Project** -> **Deploy from GitHub repo**.
2. Add a MongoDB plugin with one click inside Railway.
3. Railway automatically detects Maven and Java 21, sets the port, and deploys the backend with zero manual config.

---

## 4. Local Development

To run locally anytime:

### Backend:
```bash
cd backend
mvn spring-boot:run
```
Running on: `http://localhost:8080`

### Frontend:
```bash
cd frontend
npm run dev
```
Running on: `http://localhost:5173`
