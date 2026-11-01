import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import axios from 'axios';
import {
  Target, Zap, ShieldCheck, PlayCircle, Trophy, FileText,
  ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Building2, Briefcase, RefreshCw, BarChart3, Lightbulb, Info, Clock, Check,
  BookOpen, TrendingUp, Award, Sparkles, Filter, CheckCheck, Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Select from '../components/Select';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';
import EmptyState from '../components/EmptyState';

const SkillAssessment = () => {
  const { activeJobMatchId } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  // If navigating from Assessment History, load past results immediately
  const pastAssessment = location.state?.pastAssessment;
  const [step, setStep] = useState(pastAssessment ? 'results' : 'config'); 
  const [resultData, setResultData] = useState(pastAssessment || null);

  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  
  const [activeSkill, setActiveSkill] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [assessment, setAssessment] = useState(null);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [error, setError] = useState('');

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const assessmentRef = useRef(assessment);
  useEffect(() => { assessmentRef.current = assessment; }, [assessment]);

  const tok = () => localStorage.getItem('token');

  const setupFromRoadmap = (rm) => {
    setRoadmap(rm);
    if (rm && rm.weeks) {
      const skills = rm.weeks.map(w => w.skill).filter(Boolean);
      const uniqueSkills = [...new Set(skills)];
      setExtractedSkills(uniqueSkills);
      if (uniqueSkills.length > 0) setActiveSkill(uniqueSkills[0]);
    } else {
      setExtractedSkills([]);
      setActiveSkill('');
    }
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      
      let targetRoadmapId = location.state?.roadmapId;
      
      // If no routing state, lookup roadmap by active workspace or latest available roadmap
      if (!targetRoadmapId) {
        try {
          const roadmapsRes = await axios.get('http://localhost:8080/api/roadmaps', {
            headers: { Authorization: `Bearer ${tok()}` }
          });
          if (roadmapsRes.data && roadmapsRes.data.length > 0) {
            let existing = null;
            if (activeJobMatchId) {
              existing = roadmapsRes.data.find(r => r.jobMatchId === activeJobMatchId);
            }
            if (!existing) {
              existing = roadmapsRes.data[0];
            }
            if (existing) {
              targetRoadmapId = existing.id;
            }
          }
        } catch (err) {
          console.error("Failed to lookup roadmap for assessment", err);
        }
      }

      if (!targetRoadmapId) {
        setupFromRoadmap(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8080/api/roadmaps/${targetRoadmapId}`, { 
          headers: { Authorization: `Bearer ${tok()}` } 
        });
        setupFromRoadmap(res.data);
      } catch (err) {
        console.error("Failed to fetch roadmap for assessment", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (step === 'config') {
      fetchRoadmap();
    } else {
      setIsLoading(false);
    }
  }, [location.state, activeJobMatchId, step]);

  const triggerAutoSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsTimeExpired(true);
    setStep('submitting');
    if (timerRef.current) clearInterval(timerRef.current);

    const activeAssessment = assessmentRef.current || assessment;
    if (!activeAssessment || !activeAssessment.id) {
      console.error("Assessment ID missing for auto-submit");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/assessments/${activeAssessment.id}/submit`,
        { answers: answersRef.current },
        { headers: { Authorization: `Bearer ${tok()}` } }
      );
      setResultData(res.data);
      setStep('results');
      window.dispatchEvent(new CustomEvent('assessment-completed', { detail: res.data }));
    } catch (err) {
      console.error("Auto-submit failed", err);
      setError('Time expired, but automatic grading encountered an issue. Please click Submit to finalize.');
      setStep('active');
      isSubmittingRef.current = false;
    }
  };

  // Timer Effect — strictly monitors the 20-minute countdown and automatically submits on expiry
  useEffect(() => {
    if (step === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            triggerAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGenerateAssessment = async () => {
    if (!difficulty || extractedSkills.length === 0) {
      setError("Please select a difficulty level.");
      return;
    }
    
    setStep('generating'); 
    setError('');
    setIsTimeExpired(false);
    isSubmittingRef.current = false;

    try {
      const payload = { 
        jobTitle: roadmap?.targetRole || "Skill Assessment", 
        difficulty: difficulty.toUpperCase(), 
        assessmentType: 'WEEKLY',
        skills: extractedSkills,
        jobMatchId: activeJobMatchId
      };
      
      const res = await axios.post('http://localhost:8080/api/assessments/generate', payload, { headers: { Authorization: `Bearer ${tok()}` } });
      setAssessment(res.data);
      assessmentRef.current = res.data;
      setCurrentIdx(0); 
      setAnswers({}); 
      answersRef.current = {};
      
      // Fixed 20-minute timer as stated in configuration guidelines
      setTimeLeft(20 * 60);
      
      setStep('active');
    } catch (err) { 
      setError('Failed to generate assessment. Please try again.'); 
      setStep('config'); 
    }
  };

  const handleSelectOption = (qId, opt) => setAnswers(prev => ({ ...prev, [qId]: opt }));
  const handleNext = () => { if (currentIdx < (assessment?.questions?.length || 0) - 1) setCurrentIdx(i => i + 1); };
  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStep('submitting'); 
    setError('');
    if (timerRef.current) clearInterval(timerRef.current);
    
    const activeAssessment = assessmentRef.current || assessment;
    if (!activeAssessment || !activeAssessment.id) {
      setError('Assessment data missing. Please try again.');
      setStep('active');
      isSubmittingRef.current = false;
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/assessments/${activeAssessment.id}/submit`, { answers: answersRef.current }, { headers: { Authorization: `Bearer ${tok()}` } });
      setResultData(res.data);
      setStep('results');
      window.dispatchEvent(new CustomEvent('assessment-completed', { detail: res.data }));
    } catch (err) { 
      setError('Failed to submit assessment.'); 
      setStep('active'); // Allow retry
      isSubmittingRef.current = false;
    }
  };

  if (step === 'config') {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Checking roadmap status...</p>
        </div>
      );
    }
    
    if (!roadmap) {
      return (
        <EmptyState 
          icon={Target} 
          title="Learning Roadmap Required" 
          description="You must generate a learning roadmap first before taking an assessment." 
          action={
            <Button onClick={() => navigate('/dashboard/roadmap')}>
              Go to Learning Roadmap
            </Button>
          }
        />
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Roadmap Assessment</h1>
          <p className="text-slate-500 mt-2">Test your knowledge on the skills from your active roadmap.</p>
        </div>
        
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md">
            <p className="text-rose-700">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Assessment Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Skills</label>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map(s => <Badge key={s} variant="primary">{s}</Badge>)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty Level</label>
              <Select value={difficulty} onChange={e => setDifficulty(e.target.value)} required>
                <option value="" disabled>Select Difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">This assessment contains targeted MCQs based on your roadmap skills. You will have a <strong>20-minute timer</strong> to complete it.</p>
            </div>

            <Button size="lg" className="w-full" onClick={handleGenerateAssessment} disabled={!difficulty}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
         <div className="relative mx-auto w-20 h-20">
            <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Generating Assessment</h2>
          <p className="text-slate-500">AI is crafting 20 highly-targeted questions based on {extractedSkills.length} skills...</p>
      </div>
    );
  }

  if (step === 'active' && assessment) {
    const q = assessment.questions[currentIdx];
    const totalQ = assessment.questions.length;
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-10">
          <div>
            <h2 className="font-bold text-slate-900">Question {currentIdx + 1} of {totalQ}</h2>
            <ProgressBar progress={((currentIdx) / totalQ) * 100} color="bg-indigo-600" className="mt-2 w-32" />
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg border transition-colors ${
            timeLeft <= 60 
              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse' 
              : timeLeft <= 300 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            <Clock className={`h-5 w-5 ${timeLeft <= 60 ? 'text-rose-600 animate-pulse' : timeLeft <= 300 ? 'text-amber-600' : 'text-indigo-600'}`} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="mb-6 flex gap-2">
              <Badge variant="primary">{q.skillCategory}</Badge>
              <Badge variant="outline">{q.difficulty}</Badge>
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-6 leading-relaxed">{q.questionText}</h3>
            
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectOption(q.id, opt)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
                      ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                  >
                    {/* Radio indicator — always same size & shape */}
                    <div className={`h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
                      ${isSelected ? 'border-indigo-600 bg-white' : 'border-slate-300 bg-white'}`}>
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                    </div>
                    <span className={`text-sm leading-relaxed ${isSelected ? 'font-semibold text-indigo-900' : 'text-slate-700'}`}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} leftIcon={<ChevronLeft className="h-4 w-4" />}>
            Previous
          </Button>
          {currentIdx === totalQ - 1 ? (
            <Button onClick={handleSubmit} rightIcon={<CheckCircle2 className="h-4 w-4" />}>
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!answers[q.id]} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Next Question
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (step === 'submitting') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {isTimeExpired ? "Time Limit Reached" : "Grading Assessment..."}
        </h2>
        <p className="text-slate-500">
          {isTimeExpired 
            ? "Your 20-minute countdown has expired. Automatically submitting and grading your assessment..." 
            : "Calculating accuracy and generating detailed competency breakdown..."}
        </p>
      </div>
    );
  }

  if (step === 'results' && resultData) {
    return (
      <AssessmentResultsView 
        resultData={resultData} 
        isTimeExpired={isTimeExpired}
        onRetake={() => window.location.reload()}
        onNavigateHistory={() => navigate('/dashboard/assessment-history', { state: { fromAssessment: true } })}
        navigate={navigate}
      />
    );
  }

  return null;
};

/* ─────────────────────────────────────────────────────────────
   AssessmentResultsView — Rich, informative analytics dashboard
───────────────────────────────────────────────────────────── */
const AssessmentResultsView = ({ resultData, isTimeExpired, onRetake, onNavigateHistory, navigate }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'incorrect', 'correct'
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const score = resultData.score != null ? resultData.score : 0;
  const isPass = score >= 70;
  const targetRole = resultData.jobTitle || resultData.skill || 'Full Stack Engineering';
  const company = resultData.companyName;
  const difficulty = resultData.difficulty || 'Intermediate';
  const isFullAssessment = resultData.assessmentType === 'WEEKLY_FULL' || (resultData.skills && resultData.skills.length > 1);
  const typeLabel = isFullAssessment ? 'Weekly Full-Portion Assessment' : 'Daily Skill Assessment';
  
  const takenDate = resultData.takenAt 
    ? new Date(resultData.takenAt).toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
    : null;

  // Normalize questions list
  const results = useMemo(() => {
    const rawQuestions = resultData.questions || resultData.results || [];
    return rawQuestions.map((q, idx) => ({
      id: q.id || `q-${idx}`,
      originalIndex: idx + 1,
      questionText: q.questionText || '',
      options: q.options || [],
      userAnswer: q.userResponse || q.userAnswer || null,
      correctAnswer: q.correctOption || q.correctAnswer || '',
      isCorrect: q.correct ?? q.isCorrect ?? false,
      explanation: q.explanation || '',
      skillCategory: q.skillCategory || q.skill || (resultData.skill ? resultData.skill : 'General Competency'),
      type: q.type || 'MCQ'
    }));
  }, [resultData.questions, resultData.results, resultData.skill]);

  const totalCount = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectCount = totalCount - correctCount;
  const accuracyPct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Topic / Skill breakdown analytics
  const topicBreakdown = useMemo(() => {
    const map = {};
    results.forEach(r => {
      const cat = r.skillCategory?.trim() || 'Core Engineering';
      if (!map[cat]) {
        map[cat] = { total: 0, correct: 0 };
      }
      map[cat].total += 1;
      if (r.isCorrect) map[cat].correct += 1;
    });

    return Object.entries(map).map(([name, data]) => {
      const pct = Math.round((data.correct / data.total) * 100);
      return {
        name,
        total: data.total,
        correct: data.correct,
        percentage: pct,
        status: pct >= 80 ? 'Mastered' : pct >= 60 ? 'Proficient' : 'Needs Review',
        variant: pct >= 80 ? 'success' : pct >= 60 ? 'primary' : 'warning',
        colorClass: pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
      };
    }).sort((a, b) => a.percentage - b.percentage); // Lowest accuracy first so user immediately sees what to review!
  }, [results]);

  const weakTopics = topicBreakdown.filter(t => t.percentage < 70);
  const strongTopics = topicBreakdown.filter(t => t.percentage >= 70);

  // Filtered questions
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (filterType === 'correct' && !r.isCorrect) return false;
      if (filterType === 'incorrect' && r.isCorrect) return false;
      if (selectedTopic !== 'all' && r.skillCategory !== selectedTopic) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inQuestion = r.questionText.toLowerCase().includes(query);
        const inCategory = r.skillCategory.toLowerCase().includes(query);
        const inExpl = r.explanation.toLowerCase().includes(query);
        if (!inQuestion && !inCategory && !inExpl) return false;
      }
      return true;
    });
  }, [results, filterType, selectedTopic, searchQuery]);

  // Readiness classification
  let readinessTier = {
    title: 'Needs Focused Revision',
    desc: 'Targeted study in missed concepts is recommended before technical interviews.',
    color: 'amber'
  };
  if (score >= 80) {
    readinessTier = {
      title: 'Interview Ready & Advanced',
      desc: 'Demonstrated strong technical command across all tested competency areas.',
      color: 'emerald'
    };
  } else if (score >= 70) {
    readinessTier = {
      title: 'Passing Benchmark Met',
      desc: 'Solid practical foundation with minor knowledge gaps to polish.',
      color: 'emerald'
    };
  } else if (score < 50) {
    readinessTier = {
      title: 'Foundational Review Needed',
      desc: 'Fundamental gaps detected. Follow your structured roadmap to master core topics.',
      color: 'rose'
    };
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* ── Document Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Badge variant="primary" className="font-semibold text-xs px-2.5 py-0.5">
              {typeLabel}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium">
              {difficulty} Level
            </Badge>
            {company && (
              <Badge variant="default" className="text-xs flex items-center gap-1 font-medium bg-slate-100 text-slate-700">
                <Building2 className="h-3 w-3 text-slate-500" /> {company} Pattern
              </Badge>
            )}
            {takenDate && (
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-1 font-medium">
                <Clock className="h-3 w-3" /> {takenDate}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Assessment Results & Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Performance diagnosis for candidate targeting <span className="font-semibold text-indigo-600">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <Button 
            onClick={() => window.print()} 
            variant="outline"
            leftIcon={<FileText className="h-4 w-4 text-slate-600" />}
            className="shadow-xs hover:bg-slate-50 font-medium"
          >
            Download / Print
          </Button>
          <Button 
            onClick={onRetake}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold"
          >
            Retake Assessment
          </Button>
        </div>
      </div>

      {/* ── Auto-submit Timeout Notification Banner ── */}
      {isTimeExpired && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Time Limit Reached — Automatic Submission</h4>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              The 20-minute assessment countdown concluded. All answered questions were automatically saved, evaluated, and recorded to your placement profile.
            </p>
          </div>
        </div>
      )}

      {/* ── Executive Performance Overview Card ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Score Ring */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border border-slate-100">
              <CircularProgress 
                value={score} 
                size={160} 
                strokeWidth={14} 
                label="SCORE"
                color={isPass ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e"} 
              />
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <Badge 
                  variant={isPass ? 'success' : score >= 50 ? 'warning' : 'danger'} 
                  className="text-sm px-4 py-1 font-bold shadow-xs tracking-wide"
                >
                  {isPass ? 'Passed Benchmark' : 'Needs Improvement'}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">
                  Role Benchmark Threshold: 70%
                </span>
              </div>
            </div>

            {/* Performance Summary & KPI Strip */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900">{readinessTier.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  You answered <span className="font-bold text-slate-900">{correctCount} of {totalCount} questions correctly</span> ({accuracyPct}% accuracy). 
                  {isPass 
                    ? " Your score surpasses the technical threshold for this role. Review the few missed topics below to aim for complete mastery."
                    : ` You are ${70 - score}% away from the recommended 70% passing benchmark. Study the prioritized focus topics below to boost your score.`}
                </p>
              </div>

              {/* 4-Stat Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/80">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">Accuracy</span>
                  <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100">{accuracyPct}%</span>
                  <span className="text-[11px] text-indigo-500 dark:text-indigo-400 block mt-0.5">overall precision</span>
                </div>
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/80">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-1">Correct</span>
                  <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">{correctCount}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">questions mastered</span>
                </div>
                <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-800/80">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block mb-1">Missed</span>
                  <span className="text-2xl font-black text-rose-950 dark:text-rose-100">{incorrectCount}</span>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 block mt-0.5">questions to review</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">Total Items</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">evaluated questions</span>
                </div>
              </div>

              {/* Quick Jump Action Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
                <Button 
                  onClick={onNavigateHistory} 
                  variant="outline" 
                  size="sm"
                  className="text-xs font-medium"
                >
                  View Assessment History
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/gap')} 
                  variant="ghost" 
                  size="sm"
                  className="text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Review Skill Gaps
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/roadmap')} 
                  variant="ghost" 
                  size="sm"
                  className="text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Open Learning Roadmap
                </Button>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Topic & Competency Mastery Breakdown ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 font-bold">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Topic & Competency Mastery
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated skill mastery across technical modules. Click any topic to filter the question list.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 print:hidden">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Mastered (80%+)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Proficient (60-79%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Needs Work (&lt;60%)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicBreakdown.map((t, idx) => {
              const isSelected = selectedTopic === t.name;
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedTopic(isSelected ? 'all' : t.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/50 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-900 text-sm truncate" title={t.name}>
                      {t.name}
                    </span>
                    <Badge variant={t.variant} className="text-[11px] py-0.5 px-2 font-bold shrink-0">
                      {t.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>{t.correct} of {t.total} Correct</span>
                    <span className="font-bold text-slate-800">{t.percentage}%</span>
                  </div>
                  <ProgressBar value={t.percentage} colorClass={t.colorClass} heightClass="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Strategic Insights: Verified Strengths vs Priority Areas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Verified Competencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strongTopics.length > 0 ? (
              <>
                <p className="text-xs text-emerald-800 font-medium">
                  Demonstrated 70%+ benchmark proficiency in:
                </p>
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((st, i) => (
                    <Badge key={i} variant="success" className="font-semibold text-xs py-1 px-3 border border-emerald-200">
                      {st.name} • {st.percentage}%
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Aim for 70%+ accuracy in any topic to establish verified competency badges.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Priority Focus Areas */}
        <Card className="border-amber-200 bg-amber-50/30 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-900 font-bold">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Priority Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakTopics.length > 0 ? (
              <>
                <p className="text-xs text-amber-800 font-medium">
                  Recommended review topics to clear the 70% passing threshold:
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((wt, i) => (
                    <Badge key={i} variant="warning" className="font-semibold text-xs py-1 px-3 border border-amber-200">
                      {wt.name} • {wt.percentage}%
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-emerald-800 font-medium">
                Outstanding! You scored 70%+ across every tested technical topic.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Detailed Question Breakdown Section ── */}
      <div className="space-y-5 pt-4">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Detailed Question Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review each question, your answer choices, correct answers, and AI explanations
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'all' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filterType === 'incorrect' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" /> Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filterType === 'correct' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Correct ({correctCount})
            </button>
            {selectedTopic !== 'all' && (
              <button
                onClick={() => setSelectedTopic('all')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1"
                title="Clear topic filter"
              >
                Topic: {selectedTopic} <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((res, i) => (
              <Card 
                key={res.id} 
                className={`border-l-4 ${
                  res.isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                } overflow-hidden bg-white shadow-xs print:overflow-visible print:break-inside-avoid`}
              >
                <CardContent className="p-0">
                  
                  {/* Question Header Bar */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b ${
                    res.isCorrect 
                      ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' 
                      : 'bg-rose-50/60 border-rose-100 text-rose-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {res.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                      <span className="text-sm font-bold tracking-wide">
                        Question {res.originalIndex} • {res.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                        {res.skillCategory}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Question text */}
                    <h4 className="font-bold text-slate-900 text-base leading-relaxed">
                      {res.questionText}
                    </h4>

                    {/* 4 Options Grid (when available) */}
                    {res.options && res.options.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Answer Options
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {res.options.map((opt, optIdx) => {
                            const isUserChoice = opt === res.userAnswer;
                            const isCorrectOpt = opt === res.correctAnswer;
                            
                            let optStyle = "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200";
                            let badgeStyle = "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
                            
                            if (isCorrectOpt) {
                              optStyle = "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-400";
                              badgeStyle = "bg-emerald-600 text-white";
                            } else if (isUserChoice && !res.isCorrect) {
                              optStyle = "border-rose-400 bg-rose-50/80 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 font-medium ring-1 ring-rose-300";
                              badgeStyle = "bg-rose-600 text-white";
                            }

                            return (
                              <div 
                                key={optIdx} 
                                className={`p-3 rounded-xl border text-sm flex items-start gap-2.5 transition-colors ${optStyle}`}
                              >
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
                                  {isCorrectOpt ? "✓" : (isUserChoice && !res.isCorrect ? "✗" : String.fromCharCode(65 + optIdx))}
                                </span>
                                <div className="leading-snug">
                                  <span className="block">{opt}</span>
                                  {isUserChoice && (
                                    <span className={`text-[11px] font-bold mt-1 inline-block ${res.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                                      (Your Selected Choice)
                                    </span>
                                  )}
                                  {isCorrectOpt && !isUserChoice && (
                                    <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-block">
                                      (Correct Choice)
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Fallback side-by-side tiles if options array not populated */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-4 rounded-xl border-2 ${
                          res.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
                        }`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {res.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-500" />
                            )}
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              res.isCorrect ? 'text-emerald-700' : 'text-rose-600'
                            }`}>
                              Your Answer
                            </span>
                          </div>
                          <p className={`text-sm font-medium ${res.isCorrect ? 'text-emerald-900' : 'text-rose-800'}`}>
                            {res.userAnswer || <em className="opacity-60">Not answered</em>}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                              Correct Answer
                            </span>
                          </div>
                          <p className="text-sm font-medium text-emerald-900">{res.correctAnswer}</p>
                        </div>
                      </div>
                    )}

                    {/* Explanatory Reason Box */}
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 rounded-xl p-4 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                          Why this is correct
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                          {res.explanation || 'The answer is verified according to standard technical specifications for this question.'}
                        </p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">No questions matching filter</h4>
              <p className="text-xs text-slate-500 mt-1">
                {filterType === 'incorrect' 
                  ? "Congratulations! You didn't miss any questions matching this criteria."
                  : "Try clearing filters to view all questions."}
              </p>
              <Button 
                onClick={() => { setFilterType('all'); setSelectedTopic('all'); setSearchQuery(''); }}
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SkillAssessment;
