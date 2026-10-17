import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  UploadCloud, File, X, CheckCircle2, AlertTriangle, FileText, Zap,
  Briefcase, GraduationCap, Code, Server, Lightbulb, TrendingUp, Sparkles, FolderGit2, Award, Target, ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import ATSOptimizer from '../components/resume/ATSOptimizer';

let cachedResumeData = null;

const ResumeAnalyzer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem('token');


  useEffect(() => {
    const fetchSpecificResume = async (id) => {
      setIsAnalyzing(true);
      setAnalysisProgress(30);
      try {
        const response = await api.get(`/resumes/${id}`);
        setResumeData(response.data);
        cachedResumeData = response.data;
        setHasResults(true);
        setAnalysisProgress(100);
      } catch (err) {
        console.error("Failed to load requested resume", err);
        setError("Failed to load the selected resume.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (location.state?.resumeId) {
      // If we routed here with a specific resume ID, bypass cache and load it!
      // But only if it's not already the cached one to save network
      if (!cachedResumeData || cachedResumeData.id !== location.state.resumeId) {
        fetchSpecificResume(location.state.resumeId);
      } else {
        setResumeData(cachedResumeData);
        setHasResults(true);
      }
    } else if (cachedResumeData) {
      setResumeData(cachedResumeData);
      setHasResults(true);
    }
  }, [location.state?.resumeId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOCX, or Image (JPG/PNG/WEBP) file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setFile(selectedFile);
    setIsAnalyzing(true);
    setError('');
    
    // Simulate progress bar while API call happens
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      clearInterval(interval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setResumeData(res.data);
        cachedResumeData = res.data;
        setHasResults(true);
        setIsAnalyzing(false);
        window.dispatchEvent(new CustomEvent('resume-uploaded', { detail: res.data }));
      }, 500);
      
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      setIsAnalyzing(false);
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setHasResults(false);
    setAnalysisProgress(0);
    setResumeData(null);
    cachedResumeData = null;
    setError('');
  };
  
  // Helpers to parse API response to UI structures
  const parseSkillLevels = (levelsMap) => {
    if (!levelsMap) return [];
    return Object.entries(levelsMap).map(([name, level]) => {
       const lowerLevel = (level || '').toLowerCase();
       let score = 50;
       if (lowerLevel.includes('expert') || lowerLevel.includes('advanced')) score = 90;
       else if (lowerLevel.includes('intermediate')) score = 65;
       else if (lowerLevel.includes('beginner') || lowerLevel.includes('basic')) score = 35;
       return { name, level, score };
    });
  };

  const parseEducation = (eduArray) => {
     if (!eduArray) return [];
     return eduArray.map(edu => {
       const parts = edu.split('|').map(s => s.trim());
       return {
         degree: parts[0] || edu,
         school: parts[1] || '',
         year: parts[2] || ''
       };
     });
  };
  
  const parseProjects = (projArray) => {
     if (!projArray) return [];
     return projArray.map(proj => {
       const parts = proj.split('|').map(s => s.trim());
       return {
         name: parts[0] || proj,
         tech: parts[1] || ''
       };
     });
  };

  const parseCertifications = (certArray) => {
     if (!certArray) return [];
     return certArray.map(cert => {
       const parts = cert.split('|').map(s => s.trim());
       return {
         name: parts[0] || cert,
         issuer: parts[1] || ''
       };
     });
  };

  const mappedLevels = parseSkillLevels(resumeData?.skillLevels);
  const mappedEdu = parseEducation(resumeData?.education);
  const mappedProjects = parseProjects(resumeData?.projects);
  const mappedCerts = parseCertifications(resumeData?.certifications);
  
  // Default strengths/improvements based on presence of data
  const defaultStrengths = resumeData?.aiAnalysisSummary ? [
     "Resume successfully parsed by AI.",
     `Detected ${resumeData?.detectedSkills?.length || 0} core skills.`,
     resumeData?.experience?.length > 0 ? "Experience section properly formatted." : ""
  ].filter(Boolean) : [];
  
  const defaultImprovements = [
     resumeData?.experience?.length === 0 ? "Consider adding more detailed work experience." : "",
     !resumeData?.projects || resumeData?.projects?.length === 0 ? "Add personal or academic projects to stand out." : "",
     "Ensure bullet points are quantified with metrics."
  ].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resume Analyzer</h1>
          <p className="text-slate-500 mt-2">Upload your resume to get AI-powered insights, ATS scoring, and targeted improvements.</p>
        </div>
        {hasResults && (
          <Button variant="outline" onClick={resetAnalyzer}>
            Upload New Resume
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Upload State */}
      {!isAnalyzing && !hasResults && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="p-0">
            <div 
              className={`rounded-xl p-16 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-slate-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Drag and drop your resume here</h3>
              <p className="text-slate-500 mb-8 max-w-sm">Upload your PDF, DOCX, or Image file to instantly analyze your skills, experience, and ATS readiness.</p>
              <Button type="button" size="lg" className="px-8 shadow-md">Browse Files</Button>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><File className="h-4 w-4" /> PDF, DOCX, or Image</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span className="flex items-center gap-1.5"><Server className="h-4 w-4" /> Max size: 5MB</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.docx,.webp,image/webp,image/jpeg,image/png,image/jpg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="relative mb-8">
              <div className="h-24 w-24 border-4 border-indigo-100 rounded-full border-t-indigo-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">AI is analyzing your resume</h2>
            <p className="text-slate-500 max-w-md mb-8">Extracting skills, evaluating experience, and generating your personalized ATS improvement plan...</p>
            
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <ProgressBar value={analysisProgress} colorClass="bg-indigo-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results State */}
      {hasResults && resumeData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg">
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-indigo-100 font-medium mb-1">ATS Match Score</p>
                    <h2 className="text-4xl font-black">
                      {resumeData?.atsScore != null 
                        ? resumeData.atsScore 
                        : (resumeData?.detectedSkills?.length > 0 ? Math.min(100, 45 + (resumeData.detectedSkills.length * 3)) : 0)}
                      <span className="text-xl font-medium text-indigo-200">/100</span>
                    </h2>
                  </div>
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    {resumeData?.atsFeedback || "Analysis pending."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-slate-200 shadow-sm">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">AI Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {resumeData.aiAnalysisSummary || "Analysis completed successfully."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    Skill Proficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {mappedLevels.length > 0 ? mappedLevels.map((skill, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-800">{skill.name}</span>
                          <span className="text-slate-500 font-medium">{skill.level}</span>
                        </div>
                        <ProgressBar 
                          value={skill.score} 
                          colorClass={
                            skill.score >= 80 ? 'bg-emerald-500' : 
                            skill.score >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                          } 
                        />
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">No explicit skill levels identified by AI. Showing general detected skills below.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {resumeData.experience?.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-indigo-200 pl-4 py-1">
                        <h4 className="font-bold text-slate-900">{exp.role}</h4>
                        <p className="text-sm font-semibold text-indigo-600 mb-2">{exp.company}</p>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {exp.bullets?.map((b, i) => (
                            <li key={i} className="text-xs text-slate-600">{b.originalText}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {(!resumeData.experience || resumeData.experience.length === 0) && (
                      <p className="text-sm text-slate-500">No experience extracted.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FolderGit2 className="h-5 w-5 text-indigo-600" />
                      Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {mappedProjects.map((proj, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">{proj.name}</h4>
                        {proj.tech && <p className="text-xs font-medium text-indigo-600">{proj.tech}</p>}
                      </div>
                    ))}
                    {mappedProjects.length === 0 && (
                      <p className="text-sm text-slate-500">No projects extracted.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              
              <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Resume Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {defaultStrengths.map((str, idx) => (
                      <li key={idx} className="flex gap-2.5 text-sm text-emerald-800 dark:text-emerald-300 font-medium items-start">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/30 shadow-sm dark:bg-amber-950/20 dark:border-amber-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {defaultImprovements.length > 0 ? defaultImprovements.map((imp, idx) => (
                      <li key={idx} className="flex gap-2.5 text-sm text-amber-800 dark:text-amber-300 font-medium items-start">
                        <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    )) : (
                      <li className="text-sm text-amber-800 dark:text-amber-300">No immediate issues found!</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    Detected Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.detectedSkills?.map((skill, idx) => (
                      <Badge key={idx} variant="primary" className="font-semibold bg-indigo-50 border border-indigo-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    Education & Certs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-4">
                    {mappedEdu.map((edu, idx) => (
                      <div key={idx}>
                        <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{edu.school} {edu.year ? `• ${edu.year}` : ''}</p>
                      </div>
                    ))}
                    {mappedEdu.length === 0 && <p className="text-sm text-slate-500">No education extracted.</p>}
                  </div>
                  
                  {mappedCerts.length > 0 && (
                    <div className="pt-5 border-t border-slate-100 space-y-4">
                      {mappedCerts.map((cert, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="mt-0.5 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Award className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{cert.name}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{cert.issuer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* ATS Optimizer Component */}
          {resumeData.experience && resumeData.experience.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
               <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">ATS Optimizer & AI Tailoring</h2>
                  <p className="text-slate-500 mt-1">Select a missing keyword to automatically optimize your resume bullets based on real company requirements.</p>
               </div>
               <ATSOptimizer 
                  matchData={{
                     atsScore: resumeData?.atsScore != null 
                        ? resumeData.atsScore 
                        : (resumeData?.detectedSkills?.length > 0 ? Math.min(100, 45 + (resumeData.detectedSkills.length * 3)) : 0),
                     roleReadiness: 65,
                     keywordAnalysis: { missing: ["AWS", "Microservices", "Docker", "Kubernetes"] }
                  }} 
                  resumeData={resumeData} 
               />
            </div>
          )}

          {/* Next Step Action */}
          <div className="mt-10 flex justify-end border-t border-slate-200 pt-8">
            <Button 
              size="lg" 
              rightIcon={<ArrowRight className="h-5 w-5" />}
              onClick={() => navigate('/dashboard/jobs')}
              className="px-8"
            >
              Continue to Job Analyzer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
