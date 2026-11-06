import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import axios from 'axios';
import api from '../utils/api';
import { 
  Search, Building2, Briefcase, FileText, Sparkles, 
  CheckCircle2, PlusCircle, Wrench, Clock, GraduationCap, Users, Target, AlertCircle, ArrowRight,
  Upload, X, FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';

let cachedJobData = null;
let cachedMatchData = null;
let cachedFormData = null;

const JobAnalyzer = () => {
  const navigate = useNavigate();
  const { setActiveJobMatchId } = useWorkspace();
  const location = useLocation();
  const initialResumeId = location.state?.resumeId || null;
  const pdfInputRef = useRef(null);

  const [formData, setFormData] = useState({
    company: location.state?.company || '',
    title: location.state?.jobTitle || '',
    description: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isPdfParsing, setIsPdfParsing] = useState(false);
  
  const [jobResult, setJobResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [latestResumeId, setLatestResumeId] = useState(initialResumeId);

  useEffect(() => {
    const fetchLatestResume = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await api.get('/resumes');
        
        if (response.data && response.data.length > 0) {
          // Auto-select based on routing state, or fallback to the latest
          if (!initialResumeId) {
             setLatestResumeId(response.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch resumes', err);
      }
    };
    
    // Restore cache if available, BUT only if we aren't explicitly loading a DIFFERENT resume
    if (cachedJobData && cachedMatchData) {
      if (!initialResumeId || initialResumeId === cachedMatchData.resumeId) {
        setJobResult(cachedJobData);
        setMatchResult(cachedMatchData);
        if (cachedFormData) setFormData(cachedFormData);
        setHasResults(true);
      } else {
        // We are starting a new analysis for a different resume
        resetAnalyzer();
      }
    }
    
    fetchLatestResume();
  }, [initialResumeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const extractFieldFromText = (text, patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Clean up the extracted value - take only the first meaningful chunk
        const value = match[1].trim().split(/\s{2,}|\n/)[0].trim();
        if (value.length > 1 && value.length < 100) return value;
      }
    }
    return '';
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setIsPdfParsing(true);
    setError('');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      const extracted = fullText.trim();

      // Auto-extract Company Name
      const companyPatterns = [
        /(?:Name of the Company|Company Name|Company|Organisation|Organization|Employer|Client)\s*[:\-]?\s*([A-Za-z0-9&\s,.()\-]+?)(?:\s{2,}|\n|Location|Date|$)/i,
        /^([A-Z][A-Za-z0-9\s&.,]+(?:Pvt\.?\s*Ltd\.?|Inc\.?|Corp\.?|Technologies|Solutions|Systems|Services|Infotech|InfoTech|Software|Digital|Global|Group))/m,
      ];

      // Auto-extract Job Title / Role
      const titlePatterns = [
        /(?:Job Role|Job Title|Position|Role|Designation|Post|Vacancy|Hiring for)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9\s\/\-,&]+?)(?:\s{2,}|\d{2,}|\n|Eligib|Batch|Depart|Qualif|$)/i,
        /(?:We are hiring|Looking for|Requirement for|Opening for|Recruiting for)\s*(?:a\s+|an\s+)?([A-Za-z][A-Za-z0-9\s\/\-]+?)(?:\s{2,}|\n|at\s|in\s|for\s|with\s)/i,
      ];

      const extractedCompany = extractFieldFromText(extracted, companyPatterns);
      const extractedTitle = extractFieldFromText(extracted, titlePatterns);

      setFormData(prev => ({
        ...prev,
        description: extracted,
        company: extractedCompany || prev.company,
        title: extractedTitle || prev.title,
      }));
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Failed to extract text from PDF. Please paste the description manually.');
      setPdfFile(null);
    } finally {
      setIsPdfParsing(false);
    }
  };


  const clearPdf = () => {
    setPdfFile(null);
    setFormData(prev => ({ ...prev, description: '' }));
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!formData.description.trim()) return;
    if (!latestResumeId) {
       setError("No resume found. Please upload a resume first.");
       return;
    }
    
    setIsAnalyzing(true);
    setProgress(10);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 8 : prev));
      }, 500);

      // Step 1: Analyze Job Description
      const jobResponse = await api.post('/jobs', {
        company: formData.company || 'Unknown Company',
        jobTitle: formData.title || 'Untitled Role',
        jobDescription: formData.description
      });
      
      const parsedJobId = jobResponse.data.id;
      setJobResult(jobResponse.data);
      cachedJobData = jobResponse.data;
      cachedFormData = formData;

      setProgress(60);

      // Step 2: Automatically calculate ATS Match Score
      const matchResponse = await api.post('/matches', {
        resumeId: latestResumeId,
        jobId: parsedJobId
      });

      setMatchResult(matchResponse.data);
      cachedMatchData = matchResponse.data;
      
      // Enforce the strict flow pipeline!
      localStorage.setItem('activeFlow_match', JSON.stringify(matchResponse.data));
      localStorage.removeItem('activeFlow_roadmap');
      localStorage.removeItem('activeFlow_assessment');
      
      // Set the active workspace to this new match!
      setActiveJobMatchId(matchResponse.data.id);
      window.dispatchEvent(new CustomEvent('match-created', { detail: matchResponse.data }));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => setHasResults(true), 500);

    } catch (err) {
      console.error(err);
      setProgress(0);
      setError('Analysis failed. Please check your connection or try again later.');
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setHasResults(false);
    setJobResult(null);
    setMatchResult(null);
    setFormData({ company: '', title: '', description: '' });
    setPdfFile(null);
    cachedJobData = null;
    cachedMatchData = null;
    cachedFormData = null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Analyzer</h1>
          <p className="text-slate-500 mt-2">Compare your resume against any job description to get instant ATS scoring and gap analysis.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {!hasResults ? (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Target Job Details
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Senior Frontend Developer" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                  <Input 
                    name="company" 
                    value={formData.company} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Google, Stripe" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {pdfFile ? (
                      <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <FileCheck className="h-3.5 w-3.5" />
                        <span className="max-w-[140px] truncate font-medium">{pdfFile.name}</span>
                        <button onClick={clearPdf} className="text-emerald-500 hover:text-rose-500 transition-colors ml-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isPdfParsing}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {isPdfParsing ? (
                          <><div className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> Extracting...</>
                        ) : (
                          <><Upload className="h-3.5 w-3.5" /> Upload JD PDF</>
                        )}
                      </button>
                    )}
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-400">or paste below</span>
                  </div>
                </div>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={10} 
                  className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 text-slate-700 font-sans outline-none resize-y"
                  placeholder={isPdfParsing ? "Extracting text from PDF..." : "Paste the job description here, or upload a PDF above..."}
                  disabled={isPdfParsing}
                ></textarea>
              </div>

              {isAnalyzing ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">AI is analyzing the job</h3>
                    <p className="text-slate-500 text-sm mt-1">Extracting skills, evaluating match, and generating ATS score...</p>
                  </div>
                  <div className="w-full max-w-md pt-4">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                      <span>Analysis Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} color="bg-indigo-600" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-4">
                  <Button 
                    size="lg" 
                    onClick={handleAnalyze} 
                    disabled={!formData.description.trim()}
                    rightIcon={<Search className="h-4 w-4" />}
                  >
                    Analyze & Match Job
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{jobResult?.jobTitle || "Job Analysis"}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-4 w-4" />
                  {jobResult?.company || "Company"}
                </p>
              </div>
            </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Button variant="outline" onClick={resetAnalyzer} className="whitespace-nowrap">Analyze Another</Button>
                <Button 
                  onClick={() => navigate('/dashboard/skills', { state: { matchData: matchResult } })} 
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="whitespace-nowrap"
                >
                  View Skill Gaps
                </Button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ATS Match Score */}
            <Card className="border-slate-200 shadow-sm col-span-1">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  ATS Match Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                <CircularProgress 
                  value={matchResult?.overallScore || 0} 
                  size={180} 
                  strokeWidth={14} 
                  label="Match"
                  color={matchResult?.overallScore >= 80 ? "#10b981" : matchResult?.overallScore >= 60 ? "#f59e0b" : "#ef4444"} 
                />
                <p className="text-center text-slate-500 mt-6 text-sm max-w-xs">
                  Your resume is a {matchResult?.overallScore >= 80 ? 'strong' : matchResult?.overallScore >= 60 ? 'moderate' : 'weak'} match for this role based on required skills and experience.
                </p>
              </CardContent>
            </Card>

            {/* Extracted Job Details */}
            <Card className="border-slate-200 shadow-sm lg:col-span-2">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Job Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                
                <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Required Skills</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {jobResult?.requiredSkills && jobResult.requiredSkills.length > 0 ? (
                    jobResult.requiredSkills.map((skill, idx) => {
                      // Check if skill is matched
                      const isMatched = matchResult?.matchedSkills?.includes(skill);
                      return (
                        <Badge key={idx} variant={isMatched ? "success" : "secondary"} className={`px-3 py-1.5 ${!isMatched ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''}`}>
                          {skill} {isMatched && <CheckCircle2 className="h-3 w-3 ml-1 inline" />}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-slate-500">No specific skills extracted.</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                   <div>
                     <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                       <Clock className="h-4 w-4 text-slate-400" />
                       Experience
                     </h4>
                     <p className="text-sm text-slate-600">{jobResult?.experienceRequired || "Not specified"}</p>
                   </div>
                   <div>
                     <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                       <GraduationCap className="h-4 w-4 text-slate-400" />
                       Education
                     </h4>
                     <p className="text-sm text-slate-600">{jobResult?.educationRequired || "Not specified"}</p>
                   </div>
                </div>

              </CardContent>
            </Card>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalyzer;
