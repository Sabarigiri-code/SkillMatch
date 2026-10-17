import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ResumeHistory from './pages/ResumeHistory';
import JobAnalyzer from './pages/JobAnalyzer';
import SkillGap from './pages/SkillGap';
import LearningRoadmap from './pages/LearningRoadmap';
import SkillAssessment from './pages/SkillAssessment';
import AssessmentHistory from './pages/AssessmentHistory';
import InterviewPrep from './pages/InterviewPrep';
import ProgressTracker from './pages/ProgressTracker';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Documentation from './pages/Documentation';
import Blog from './pages/Blog';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

import { WorkspaceProvider } from './context/WorkspaceContext';

// Automatically detect GitHub Pages subdirectory repo path if hosted on github.io
const getBasename = () => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      return `/${pathSegments[0]}`;
    }
  }
  return '';
};

function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter basename={getBasename()}>
        <ScrollToTop />
        <Routes>
          {/* Main Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="docs" element={<Documentation />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="blog" element={<Blog />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="cookies" element={<CookiePolicy />} />
          </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="history" element={<ResumeHistory />} />
            <Route path="jobs" element={<JobAnalyzer />} />
            <Route path="skills" element={<SkillGap />} />
            <Route path="roadmap" element={<LearningRoadmap />} />
            <Route path="assessment" element={<SkillAssessment />} />
            <Route path="assessment-history" element={<AssessmentHistory />} />
            <Route path="interview" element={<InterviewPrep />} />
            <Route path="progress" element={<ProgressTracker />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all to redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;
