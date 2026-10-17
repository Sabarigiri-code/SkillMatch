import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Sparkles, BrainCircuit, Terminal, 
  Layers, ArrowRight, CheckCircle2, ChevronRight, Copy, Check
} from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('architecture');
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    { id: 'architecture', title: 'Architecture & Tech Stack', icon: Layers },
    { id: 'resume-pipeline', title: 'Resume Parsing & ATS', icon: FileText },
    { id: 'skill-gap', title: 'Skill Gap Analysis Engine', icon: Sparkles },
    { id: 'learning-roadmap', title: 'Dynamic Roadmap Generator', icon: BrainCircuit },
    { id: 'api-reference', title: 'API Endpoints & Schemas', icon: Terminal },
    { id: 'security', title: 'Security & Enterprise Privacy', icon: CheckCircle2 }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 uppercase tracking-wider">
              <BrainCircuit className="h-4 w-4" /> Technical Documentation & Guide
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              SkillMatch AI Documentation
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              Learn how SkillMatch AI harnesses Google Gemini, Spring Boot, and modern client architecture to parse resumes, compute precision ATS match scores, and generate customized career roadmaps.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-indigo-600 hover:bg-indigo-500 shadow-md"
              >
                Open Dashboard
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  const el = document.getElementById('api-reference');
                  setActiveSection('api-reference');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                View API Reference
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 sticky top-24 space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                Table of Contents
              </div>
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id);
                      const el = document.getElementById(s.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{s.title}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto text-indigo-600" />}
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100/80">
                  <p className="text-xs text-indigo-900 font-medium mb-2">Need direct integration assistance?</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs font-semibold border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                    onClick={() => navigate('/help')}
                  >
                    Contact Help Center
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Docs Content Area */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Section 1: Architecture */}
            <section id="architecture" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">Architecture</Badge>
                <span className="text-xs text-slate-400">Core Blueprint</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                System Architecture & Tech Stack
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                SkillMatch AI uses a decoupled client-server architecture. The frontend handles responsive presentation and reactive state, while the Java Spring Boot backend provides strict JWT authentication, document text extraction, and orchestration with Google Gemini LLMs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Backend (Spring Boot 3)
                  </h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• <strong>Framework:</strong> Spring Boot 3.4.2 & Java 21</li>
                    <li>• <strong>Security:</strong> Spring Security + JJWT 0.12.6</li>
                    <li>• <strong>Persistence:</strong> Spring Data MongoDB</li>
                    <li>• <strong>File Processing:</strong> Apache PDFBox 3.0 & Apache POI</li>
                    <li>• <strong>AI Engine:</strong> Google Gemini 2.5 Flash via REST</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Frontend (React 19 & Vite)
                  </h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• <strong>Framework:</strong> React 19 + Vite HMR</li>
                    <li>• <strong>Styling:</strong> Tailwind CSS v4</li>
                    <li>• <strong>State Management:</strong> WorkspaceContext API</li>
                    <li>• <strong>Routing:</strong> React Router DOM v7</li>
                    <li>• <strong>Visualization:</strong> Recharts (Skill Radar Charts)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Resume Pipeline */}
            <section id="resume-pipeline" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">Processing</Badge>
                <span className="text-xs text-slate-400">Text Extraction & Scoring</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Resume Parsing & ATS Matching
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                When a user uploads a resume (.pdf, .docx, or plain text), the file is parsed into normalized plain text. The AI extracts technical skills, years of experience, and role specializations. It then performs semantic comparison against the targeted Job Description.
              </p>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-5 mb-6 overflow-x-auto text-xs font-mono relative">
                <button 
                  onClick={() => copyToClipboard(`POST /api/resume/analyze-with-job\nContent-Type: multipart/form-data\n\nresumeFile: [binary]\njobDescription: "Senior Full Stack Engineer with React, Node, and AWS..."`, 'code-1')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy Request"
                >
                  {copiedId === 'code-1' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <div className="text-indigo-400 mb-2">// Multi-part Resume + Job Description Payload</div>
                <div>POST /api/resume/analyze-with-job</div>
                <div>Authorization: Bearer &lt;JWT_TOKEN&gt;</div>
                <div>Content-Type: multipart/form-data</div>
                <div className="mt-2 text-slate-400">Parameters:</div>
                <div className="text-emerald-300 ml-2">• resumeFile: [File payload .pdf/.docx]</div>
                <div className="text-emerald-300 ml-2">• jobDescription: "Senior Full Stack Engineer..."</div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-950">
                <h4 className="font-semibold mb-1">ATS Score Calculation Factors:</h4>
                <p className="text-slate-700">
                  Scores range from 0 to 100 based on exact skill matches (40%), contextual experience alignment (30%), domain familiarity (20%), and role seniority relevance (10%).
                </p>
              </div>
            </section>

            {/* Section 3: Skill Gap Analysis */}
            <section id="skill-gap" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">Analytics</Badge>
                <span className="text-xs text-slate-400">Diagnostic Engine</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Skill Gap Analysis Engine
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                The Skill Gap engine categorizes competencies into three clear buckets:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="text-emerald-700 font-bold mb-1">Matched Skills</div>
                  <p className="text-xs text-slate-600">Skills present in both your resume and the job description with equivalent proficiency.</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="text-amber-700 font-bold mb-1">Developing Skills</div>
                  <p className="text-xs text-slate-600">Skills mentioned with basic familiarity but requiring deeper project experience for senior requirements.</p>
                </div>
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="text-rose-700 font-bold mb-1">Missing Skills</div>
                  <p className="text-xs text-slate-600">Critical requirements requested by the employer that have zero presence on your current resume.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Learning Roadmap */}
            <section id="learning-roadmap" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">Roadmap</Badge>
                <span className="text-xs text-slate-400">AI Syllabus</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Dynamic Learning Roadmap Generator
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Based on missing and developing competencies, the platform queries Gemini to assemble a customized multi-week syllabus. Each week focuses on specific technologies with real-world deliverables, capstone project prompts, and curated resource links.
              </p>
            </section>

            {/* Section 5: API Reference */}
            <section id="api-reference" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">REST API</Badge>
                <span className="text-xs text-slate-400">Backend Specification</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                API Endpoints Reference
              </h2>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="font-mono text-sm font-semibold text-slate-800">/api/auth/register</span>
                  </div>
                  <p className="text-xs text-slate-600">Creates a new user profile and sends a verification OTP to the registered email.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="font-mono text-sm font-semibold text-slate-800">/api/auth/login</span>
                  </div>
                  <p className="text-xs text-slate-600">Authenticates user credentials and returns a signed HS256 JWT Bearer token.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">GET</span>
                    <span className="font-mono text-sm font-semibold text-slate-800">/api/resume/history</span>
                  </div>
                  <p className="text-xs text-slate-600">Retrieves historical resume analysis records and past match scores for the active user.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="font-mono text-sm font-semibold text-slate-800">/api/assessment/generate</span>
                  </div>
                  <p className="text-xs text-slate-600">Generates targeted multiple choice assessments for the user's specific skill gap roadmap.</p>
                </div>
              </div>
            </section>

            {/* Section 6: Security */}
            <section id="security" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">Security</Badge>
                <span className="text-xs text-slate-400">Enterprise Standards</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Security & Data Protection
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                SkillMatch AI is engineered with defense-in-depth security principles. Passwords are salted and hashed using BCrypt, JWTs are signed with a 256-bit secret key, and API communications are restricted through strict CORS origin policies.
              </p>
              <div className="flex gap-4 items-center pt-2">
                <Button 
                  onClick={() => navigate('/privacy')}
                  variant="outline"
                  className="text-xs"
                >
                  Read Full Privacy Policy
                </Button>
                <Button 
                  onClick={() => navigate('/terms')}
                  variant="outline"
                  className="text-xs"
                >
                  View Terms of Service
                </Button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
