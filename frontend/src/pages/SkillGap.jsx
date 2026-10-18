import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Target, Zap, AlertTriangle, CheckCircle2, AlertCircle, 
  XCircle, Compass, ArrowRight, TrendingUp, BookOpen 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';



import api from '../utils/api';
import { useWorkspace } from '../context/WorkspaceContext';

const SkillGap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeJobMatchId } = useWorkspace();
  
  const [matchData, setMatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatchData = async () => {
      // 1. If we came strictly from the Job Analyzer flow (state is present), use it immediately
      if (location.state?.matchData) {
        setMatchData(location.state.matchData);
        setIsLoading(false);
        return;
      } 
      
      // 2. If navigating via sidebar or back button, try to load the active workspace's match or latest match
      setIsLoading(true);
      try {
        const res = await api.get('/matches');
        if (res.data && res.data.length > 0) {
          let match = null;
          if (activeJobMatchId) {
            match = res.data.find(m => m.id === activeJobMatchId);
          }
          if (!match) {
            match = res.data[0];
          }
          setMatchData(match || null);
        } else {
          setMatchData(null);
        }
      } catch (err) {
        console.error("Failed to load match data for skill gaps", err);
        setMatchData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchData();
  }, [location.state, activeJobMatchId]);

  const getGapColor = (gap) => {
    const lowerGap = (gap || '').toLowerCase();
    if (lowerGap.includes('high')) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (lowerGap.includes('medium')) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (lowerGap.includes('low')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading analysis...</div>;
  }

  if (!matchData && !isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <EmptyState 
          icon={Target}
          title="Job Analysis Required"
          description="Skill gaps are generated based on your job analysis. You must complete a job analysis first to view this section."
          action={
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              Go to Job Analyzer <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your Skill Gaps</h1>
        <p className="text-slate-500 mt-2 text-lg">Understand what you need to improve for your target roles.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200 shadow-sm border-t-4 bg-emerald-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold text-lg">
              <CheckCircle2 className="h-5 w-5" />
              Strong Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {matchData.matchedSkills && matchData.matchedSkills.length > 0 ? (
                matchData.matchedSkills.map((skill, idx) => (
                  <Badge key={idx} variant="success" className="bg-emerald-100/80 text-emerald-700 border-none">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">No matching skills found.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm border-t-4 bg-amber-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-amber-600 font-semibold text-lg">
              <AlertTriangle className="h-5 w-5" />
              Developing Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {matchData.partialSkills && matchData.partialSkills.length > 0 ? (
                matchData.partialSkills.map((skill, idx) => (
                  <Badge key={idx} variant="warning" className="bg-amber-100/80 text-amber-700 border-none">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">None identified.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-sm border-t-4 bg-rose-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-rose-600 font-semibold text-lg">
              <XCircle className="h-5 w-5" />
              Missing Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                matchData.missingSkills.map((skill, idx) => (
                  <Badge key={idx} variant="danger" className="bg-rose-100 text-rose-700 border-none">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">None identified.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-600" />
          Detailed Analysis
        </h2>
        <div className="space-y-4">
          {matchData.skillGaps && matchData.skillGaps.length > 0 ? (
            matchData.skillGaps.map((gap, idx) => (
              <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12 md:items-center">
                  
                  {/* Skill & Priority */}
                  <div className="w-full md:w-1/4 shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{gap.skill}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Priority 
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center font-bold">
                        {gap.priority || idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Level Progression */}
                  <div className="w-full md:w-1/3 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Current Level</div>
                      <div className="font-semibold text-slate-800">{gap.currentLevel || 'None'}</div>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <ArrowRight className="h-5 w-5 text-slate-300 mb-1" />
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border text-center ${getGapColor(gap.gap)}`}>
                        {gap.gap}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Required Level</div>
                      <div className="font-semibold text-slate-800">{gap.requiredLevel || 'Intermediate'}</div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="w-full md:w-5/12">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase mb-2">
                      <BookOpen className="h-4 w-4" /> Recommendation
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {gap.recommendation || `Focus on learning ${gap.skill} to bridge the gap from ${gap.currentLevel || 'none'} to ${gap.requiredLevel || 'intermediate'} level.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center text-slate-500">
                You have no major skill gaps for this job! Excellent match.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Next Steps CTA */}
      <Card className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg border-none">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold mb-2">Ready to close the gap?</h3>
            <p className="text-indigo-100 text-lg">Let AI generate a personalized, week-by-week learning roadmap focused strictly on what you're missing.</p>
          </div>
          <Button 
            variant="secondary" 
            size="lg" 
            className="rounded-full px-8 py-6 text-lg whitespace-nowrap bg-white text-indigo-600 hover:bg-indigo-50"
            rightIcon={<Compass className="h-5 w-5" />}
            onClick={() => navigate('/dashboard/roadmap', { state: { matchData } })}
          >
            Generate Learning Roadmap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillGap;
