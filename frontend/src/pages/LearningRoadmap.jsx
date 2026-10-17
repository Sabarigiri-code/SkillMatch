import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import axios from 'axios';
import { 
  RefreshCw, CheckCircle2, CircleDashed, Clock, Lock,
  BookOpen, Code, Terminal, PlayCircle, Trophy, AlertCircle, 
  Compass, Printer, ChevronDown, ChevronUp, Zap, Star, ArrowRight,
  Calendar, Sparkles, CheckCheck, Briefcase
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { cn } from '../utils/cn';
import EmptyState from '../components/EmptyState';

const statusConfig = {
  completed: {
    border: 'border-emerald-300',
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    badge: 'bg-emerald-500 text-white',
    badgeLabel: 'Completed',
    dot: 'bg-emerald-500 ring-4 ring-emerald-100',
    numberClass: 'text-white',
  },
  current: {
    border: 'border-indigo-400',
    bg: 'bg-gradient-to-r from-indigo-50/80 to-violet-50/80',
    badge: 'bg-indigo-600 text-white',
    badgeLabel: 'Active Sprint',
    dot: 'bg-indigo-600 ring-4 ring-indigo-100',
    numberClass: 'text-white',
  },
  locked: {
    border: 'border-slate-200',
    bg: 'bg-white',
    badge: 'bg-slate-100 text-slate-500',
    badgeLabel: 'Upcoming',
    dot: 'bg-slate-100 ring-4 ring-slate-50 border border-slate-200',
    numberClass: 'text-slate-500',
  },
};

const LearningRoadmap = () => {
  const { activeJobMatchId } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([0]));
  const [sprintDuration, setSprintDuration] = useState(3); // 3 weeks (15-21 days) default
  const [showSprintSuccess, setShowSprintSuccess] = useState(false);

  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem('activeFlow_roadmap');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const getActiveMatchData = () => {
    if (!activeJobMatchId) return null;
    if (location.state?.matchData && location.state.matchData.id === activeJobMatchId) return location.state.matchData;
    const saved = localStorage.getItem('activeFlow_match');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === activeJobMatchId) return parsed;
      } catch (e) {
        // ignore parse error
      }
    }
    return null;
  };

  const resolveSkillGaps = async () => {
    // 1. From active match data in location state or localStorage
    const activeMatch = getActiveMatchData();
    if (activeMatch) {
      if (activeMatch.skillGaps && activeMatch.skillGaps.length > 0) {
        return {
          role: activeMatch.jobTitle || 'Associate Java Full Stack Developer',
          skills: activeMatch.skillGaps.map(g => (typeof g === 'string' ? g : g.skill)),
          matchId: activeMatch.id
        };
      }
      if (activeMatch.missingSkills && activeMatch.missingSkills.length > 0) {
        return {
          role: activeMatch.jobTitle || 'Associate Java Full Stack Developer',
          skills: activeMatch.missingSkills,
          matchId: activeMatch.id
        };
      }
    }

    // 2. Try fetching from server match record
    const matchId = activeJobMatchId || roadmap?.jobMatchId;
    if (matchId) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8080/api/matches/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          const s = (res.data.skillGaps && res.data.skillGaps.length > 0)
            ? res.data.skillGaps.map(g => (typeof g === 'string' ? g : g.skill))
            : (res.data.missingSkills || []);
          return {
            role: res.data.jobTitle || roadmap?.targetRole || 'Associate Java Full Stack Developer',
            skills: s,
            matchId: matchId
          };
        }
      } catch (e) {
        console.warn('Could not fetch match by id:', e);
      }
    }

    // 3. Fallback: extract skill names from existing roadmap weeks
    if (roadmap?.weeks && roadmap.weeks.length > 0) {
      const extracted = roadmap.weeks.map(w => w.skill).filter(Boolean);
      return {
        role: roadmap.targetRole || 'Associate Java Full Stack Developer',
        skills: extracted,
        matchId: roadmap.jobMatchId || activeJobMatchId
      };
    }

    return null;
  };

  const handleRegenerateSprint = async (weeks = sprintDuration) => {
    setIsGenerating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in again to regenerate your roadmap.');
        setIsGenerating(false);
        return;
      }

      const matchInfo = await resolveSkillGaps();
      if (!matchInfo || !matchInfo.skills || matchInfo.skills.length === 0) {
        setError('Unable to find skill gaps. Please review your Job Analyzer or Skill Gaps page.');
        setIsGenerating(false);
        return;
      }

      const reqBody = {
        targetRole: matchInfo.role,
        skillGaps: matchInfo.skills,
        jobMatchId: matchInfo.matchId,
        sprintWeeks: weeks
      };

      const res = await axios.post('http://localhost:8080/api/roadmaps/generate', reqBody, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRoadmap(res.data);
      localStorage.setItem('activeFlow_roadmap', JSON.stringify(res.data));
      setExpandedWeeks(new Set([0]));
      setShowSprintSuccess(true);
      setTimeout(() => setShowSprintSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to regenerate sprint roadmap:', err);
      setError(err.response?.data?.message || 'Failed to generate sprint roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchOrGenerateRoadmap = async () => {
      // 1. If we clicked a specific roadmap from the Dashboard
      if (location.state?.roadmapId) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            setIsLoading(true);
            const res = await axios.get('http://localhost:8080/api/roadmaps', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const specificRoadmap = res.data.find(r => r.id === location.state.roadmapId);
            if (specificRoadmap) {
              setRoadmap(specificRoadmap);
              setIsLoading(false);
              return;
            }
          }
        } catch(e) {
          console.error("Failed to fetch specific roadmap", e);
        }
      }

      // 2. If we just navigated from Skill Gaps, generate a new sprint roadmap
      if (location.state?.matchData) {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoading(true);
          try {
            // First check if one already exists for this match
            const res = await axios.get('http://localhost:8080/api/roadmaps', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existing = res.data.find(r => r.jobMatchId === location.state.matchData.id);
            if (existing) {
              setRoadmap(existing);
              setIsLoading(false);
              return;
            }

            // Generate new sprint roadmap (3 weeks / 15-25 days default)
            const matchData = location.state.matchData;
            const reqBody = {
              targetRole: matchData.jobTitle || 'Target Role',
              skillGaps: matchData.skillGaps ? matchData.skillGaps.map(g => (typeof g === 'string' ? g : g.skill)) : (matchData.missingSkills || []),
              jobMatchId: matchData.id,
              sprintWeeks: 3
            };

            const generateRes = await axios.post('http://localhost:8080/api/roadmaps/generate', reqBody, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setRoadmap(generateRes.data);
            localStorage.setItem('activeFlow_roadmap', JSON.stringify(generateRes.data));
          } catch(e) {
            console.error("Failed to fetch or generate roadmap", e);
          } finally {
            setIsLoading(false);
          }
          return;
        }
      }

      // 3. Fallback: If navigating via sidebar/back button, load the active workspace's roadmap
      if (activeJobMatchId) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:8080/api/roadmaps', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const existing = res.data.find(r => r.jobMatchId === activeJobMatchId);
          if (existing) {
            setRoadmap(existing);
            localStorage.setItem('activeFlow_roadmap', JSON.stringify(existing));
          } else {
            setRoadmap(null);
          }
        } catch (err) {
          console.error("Failed to load roadmap for workspace", err);
          setRoadmap(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 4. No state and no active workspace
        setRoadmap(null);
        setIsLoading(false);
      }
    };
    
    fetchOrGenerateRoadmap();
  }, [location.state, activeJobMatchId]);

  const toggleStatus = async (weekNumber, currentStatus) => {
    if (!roadmap) return;
    try {
      const token = localStorage.getItem('token');
      const isCompleted = !currentStatus;
      const response = await axios.put(
        `http://localhost:8080/api/roadmaps/${roadmap.id}/progress?weekNumber=${weekNumber}&completed=${isCompleted}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoadmap(response.data);
      localStorage.setItem('activeFlow_roadmap', JSON.stringify(response.data));
      window.dispatchEvent(new CustomEvent('roadmap-updated', { detail: response.data }));
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const toggleExpand = (idx) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (isLoading || isGenerating) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[65vh] gap-6 px-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
            <Zap className="h-12 w-12 text-white animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </div>
        <div className="text-center max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-3">
            <Clock className="h-3.5 w-3.5" /> 15–25 Day Campus Placement Sprint
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            {isGenerating ? 'Synthesizing High-Yield Placement Sprint...' : 'Loading Your Learning Plan...'}
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Grouping all required technical skills into intensive 3-week modules with high-frequency campus placement interview questions, coding drills, and capstone project defenses.
          </p>
        </div>
        <div className="flex gap-2.5 mt-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <EmptyState
          icon={Compass}
          title="Skill Gaps Required"
          description="Your personalized learning roadmap is built from your skill gaps. Please review your skill gaps first."
          action={
            <button
              onClick={() => navigate('/dashboard/skills')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Skill Gaps <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  const completedCount = roadmap.weeks?.filter(w => w.completed).length || 0;
  const totalWeeks = roadmap.weeks?.length || 0;
  const isMultiMonthPlan = totalWeeks > 5;
  const progress = roadmap.progressPercentage || (totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0);

  return (
    <div className="roadmap-print-root max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* Success Notification */}
      {showSprintSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">
              ✨ 15–25 Day Campus Placement Sprint Roadmap generated! All skills synthesized with placement interview prep.
            </p>
          </div>
          <button 
            onClick={() => setShowSprintSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Campus Placement Alert Banner if previously had 29 weeks */}
      {isMultiMonthPlan && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/60 rounded-2xl p-5 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm print:hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Campus Drive Timeline Alert
                </span>
                <span className="text-xs font-bold text-amber-800">
                  ⚡ 15–25 Days to Recruitment Drive
                </span>
              </div>
              <h4 className="font-extrabold text-base md:text-lg mt-1 text-slate-900">
                Current Plan spans {totalWeeks} weeks (~{Math.round(totalWeeks * 7 / 30)} months)
              </h4>
              <p className="text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
                With your campus drive arriving in <strong>15–25 days</strong>, studying 1 skill per week for 29 weeks will take too long. Condense all {totalWeeks} missing skills into an intensive <strong>3-Week Placement Sprint</strong> containing high-frequency interview questions, rapid coding drills, and project defense scenarios.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRegenerateSprint(3)}
            disabled={isGenerating}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Zap className="h-4 w-4" /> Convert to 15–25 Day Sprint
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="roadmap-hero relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 rounded-2xl p-8 shadow-xl text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                <Zap className="h-3.5 w-3.5 fill-current" /> CAMPUS PLACEMENT SPRINT (15–25 DAYS)
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> All Skills Included
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Fast-Track Learning Roadmap
            </h1>
            <p className="text-indigo-200 text-base">
              Target Role:{' '}
              <span className="font-semibold text-white">{roadmap.targetRole || 'Software Engineer'}</span>
            </p>

            <div className="mt-5 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-indigo-200 mb-1.5">
                <span>Sprint Curriculum Completion</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Sprint Duration & Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-6 print:hidden">
              <div className="inline-flex items-center rounded-xl bg-white/10 p-1 backdrop-blur-sm border border-white/20 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setSprintDuration(3); handleRegenerateSprint(3); }}
                  disabled={isGenerating}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    totalWeeks === 3
                      ? "bg-white text-indigo-900 font-bold shadow-sm"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  ⚡ 3 Weeks (15–21 Days)
                </button>
                <button
                  type="button"
                  onClick={() => { setSprintDuration(4); handleRegenerateSprint(4); }}
                  disabled={isGenerating}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    totalWeeks === 4
                      ? "bg-white text-indigo-900 font-bold shadow-sm"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  📅 4 Weeks (21–28 Days)
                </button>
              </div>

              <button 
                onClick={() => handleRegenerateSprint(sprintDuration)}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm shadow-sm"
                title="Regenerate Placement Sprint with fresh AI synthesis"
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                {isGenerating ? "Regenerating..." : "Regenerate Sprint"}
              </button>

              <button 
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm shadow-sm"
              >
                <Printer className="h-4 w-4" /> Export PDF
              </button>

              <button 
                onClick={() => navigate('/dashboard/assessment', { state: { roadmapId: roadmap.id } })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <PlayCircle className="h-4 w-4" /> Mock Assessment
              </button>
            </div>
          </div>

          <div className="flex md:flex-col gap-3 shrink-0 print:hidden">
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 shadow-inner">
              <div className="text-3xl font-extrabold">{progress}%</div>
              <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-0.5">Mastered</div>
            </div>
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 shadow-inner">
              <div className="text-3xl font-extrabold">{completedCount}<span className="text-lg text-indigo-300">/{totalWeeks}</span></div>
              <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-0.5">Modules Done</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* Placement Roadmap Summary Box */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Campus Placement Strategy:</strong> Focus 2.5–3 hours daily per module. Review top interview questions & complete the coding scenario before college interviews.
          </span>
        </div>
        <div className="shrink-0 font-bold bg-white px-3 py-1 rounded-lg border border-indigo-200 text-indigo-700 shadow-sm">
          Target: Complete in {totalWeeks <= 3 ? '15–21 Days' : '21–28 Days'}
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          Placement Sprint Modules
          <span className="ml-auto text-sm font-normal text-slate-500">
            {totalWeeks} intensive {totalWeeks === 1 ? 'module' : 'modules'} total
          </span>
        </h2>

        {roadmap.weeks && roadmap.weeks.map((week, idx) => {
          const isCompleted = week.completed;
          const isCurrent = !isCompleted && (idx === 0 || roadmap.weeks[idx - 1]?.completed);
          const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
          const cfg = statusConfig[status];
          const isExpanded = expandedWeeks.has(idx);

          // Calculate day ranges (e.g., Days 1–7, Days 8–14, Days 15–21)
          const startDay = (week.weekNumber - 1) * 7 + 1;
          const endDay = week.weekNumber * 7;

          return (
            <div
              key={idx}
              className={cn(
                'week-card rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md print:break-inside-avoid print:mb-4',
                cfg.border,
                cfg.bg,
                status === 'locked' && 'opacity-75',
                isCompleted && 'week-card-completed',
                isCurrent && 'week-card-current ring-2 ring-indigo-400/30'
              )}
            >
              <div
                className="flex items-center gap-4 p-5 cursor-pointer select-none"
                onClick={() => toggleExpand(idx)}
              >
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl font-extrabold text-lg shrink-0 transition-transform',
                  cfg.dot
                )}>
                  <span className={cfg.numberClass}>
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : week.weekNumber}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      Days {startDay}–{endDay}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Week {week.weekNumber}: {week.skill}
                    </h3>
                    <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider', cfg.badge)}>
                      {cfg.badgeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" /> {week.estimatedTime || `15 hours (Days ${startDay}-${endDay})`}
                    </span>
                    {week.topics && week.topics.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" /> {week.topics.length} key topics & interview focus areas
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStatus(week.weekNumber, week.completed); }}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                        : 'bg-white text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'
                    )}
                    title={isCompleted ? 'Mark module as incomplete' : 'Mark module as completed'}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                  </button>
                  <div className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {(isExpanded) && (
                <div className="border-t border-slate-200/80 p-5 print:block bg-white/60">
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* Topics and Interview Focus */}
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600 print:hidden" /> Key Placement Topics & Interview Concepts
                      </div>
                      <div className="flex flex-col gap-2">
                        {week.topics && week.topics.length > 0 ? (
                          week.topics.map((topic, i) => {
                            const isInterview = /interview|question|tricky|frequently|scenario|core|pattern|edge/i.test(topic);
                            return (
                              <div 
                                key={i} 
                                className={cn(
                                  "text-xs font-medium p-2 rounded-lg border shadow-xs leading-relaxed flex items-start gap-2",
                                  isInterview
                                    ? "bg-violet-50/80 border-violet-200 text-violet-950"
                                    : "bg-white border-slate-200 text-slate-700"
                                )}
                              >
                                <span className={cn(
                                  "text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider mt-0.5",
                                  isInterview ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"
                                )}>
                                  {isInterview ? '🎯 Interview' : `T${i + 1}`}
                                </span>
                                <span>{topic}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">No topics listed</span>
                        )}
                      </div>
                    </div>

                    {/* Practical Coding Task / Drill */}
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-emerald-600 print:hidden" /> Hands-On Placement Coding Drill
                      </div>
                      <div className="task-box bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs font-mono leading-relaxed shadow-sm border border-slate-800">
                        <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-sans uppercase font-bold">
                          <Code className="h-3 w-3 text-emerald-400" /> Practical Task Prompt:
                        </div>
                        <p className="text-slate-100 font-sans text-xs leading-relaxed">
                          {week.practicalTask || 'Hands-on coding exercise tailored for campus drive technical rounds.'}
                        </p>
                      </div>
                    </div>

                    {/* Capstone Project Highlight */}
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500 print:hidden" /> Capstone Project Defense
                      </div>
                      <div className="project-box bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200 p-4 text-xs text-indigo-950 leading-relaxed shadow-sm">
                        <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Resume Project Defense:
                        </div>
                        <p className="font-medium text-slate-800">
                          {week.project || 'Resume project showcase to discuss with the technical interviewer.'}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center justify-between text-[11px] text-indigo-700 font-semibold">
                          <span>Interview Round Focus</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">STAR Method</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Print layout fallback */}
              {!isExpanded && (
                <div className="hidden print:block border-t border-slate-100 p-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-1.5">
                        {week.topics && week.topics.map((topic, i) => (
                          <span key={i} className="topic-badge text-xs font-medium bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Practical Task</div>
                      <div className="task-box bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
                        {week.practicalTask || 'No task specified.'}
                      </div>
                    </div>
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capstone Project</div>
                      <div className="project-box bg-indigo-50 rounded-xl border border-indigo-100 p-3 text-sm text-indigo-900 leading-relaxed">
                        {week.project || 'No project specified.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="print:hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-900/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Campus Interview Simulation</span>
          </div>
          <h3 className="text-xl font-bold">Validate Your Placement Readiness</h3>
          <p className="text-slate-300 text-sm mt-1 max-w-lg">
            Test your knowledge with company-specific placement assessment MCQs and technical code predicting challenges.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/assessment', { state: { roadmapId: roadmap.id } })}
          className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Start Mock Assessment <ArrowRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};

export default LearningRoadmap;
