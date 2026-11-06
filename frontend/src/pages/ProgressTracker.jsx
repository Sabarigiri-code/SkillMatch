import React, { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Activity, Award, Compass, Lightbulb, AlertTriangle, CheckCircle2, Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import EmptyState from '../components/EmptyState';
import axios from 'axios';
import api from '../utils/api';

const PIE_COLORS = ['#10b981', '#cbd5e1']; // Completed, Pending

const ProgressTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [progressData, setProgressData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [progressRes, assessRes] = await Promise.all([
          api.get('/progress'),
          api.get('/assessments/history')
        ]);

        setProgressData(progressRes.data);
        
        // Sort assessments by date oldest to newest
        const sortedAssess = (assessRes.data || []).sort((a, b) => new Date(a.completedAt || a.id) - new Date(b.completedAt || b.id));
        setAssessments(sortedAssess);

      } catch (err) {
        console.error("Failed to load progress data", err);
        setError("Failed to load your progress data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your career progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        icon={AlertTriangle}
        title="Error Loading Data"
        description={error}
        action={
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        }
      />
    );
  }

  // Transform Data for Charts
  const readinessBreakdown = [
    { name: 'Resume', score: progressData?.resumeQualityScore || 0 },
    { name: 'Skills', score: progressData?.verifiedSkillsScore || 0 },
    { name: 'Assessments', score: progressData?.assessmentScore || 0 },
    { name: 'Interviews', score: progressData?.interviewScore || 0 },
  ];

  const assessmentHistory = assessments.map((a, i) => ({
    name: `Attempt ${i+1}`,
    topic: a.roadmapId ? "Roadmap Quiz" : "Skill Quiz",
    score: a.score || 0
  }));

  const completion = progressData?.roadmapCompletion || 0;
  const roadmapPieData = [
    { name: 'Completed', value: completion },
    { name: 'Pending', value: Math.max(0, 100 - completion) }
  ];

  const insights = [
    { icon: <TrendingUp className="h-5 w-5 text-indigo-500" />, text: `Your overall career readiness is currently at ${progressData?.overallReadinessScore || 0}% !` },
    { icon: <Lightbulb className="h-5 w-5 text-amber-500" />, text: `You have completed ${completion}% of your active learning roadmap.` },
    { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, text: assessments.length > 0 ? `You've taken ${assessments.length} assessments so far.` : "Take an assessment to verify your skills!" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Career Progress</h1>
          <p className="text-slate-500 mt-2 text-lg">Track your growth, assessment scores, and roadmap completion over time.</p>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start shadow-sm">
            <div className="shrink-0 mt-0.5">{insight.icon}</div>
            <p className="text-sm text-indigo-900 font-medium leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Readiness Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              Career Readiness Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={readinessBreakdown}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.4} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Assessment Trend */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Assessment History Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentHistory.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="score" name="Score %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4 flex flex-col items-center justify-center text-slate-500">
                <p>No assessment history yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Recent Assessment Scores */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Recent Assessment Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assessmentHistory.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="score" name="Score %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4 flex flex-col items-center justify-center text-slate-500">
                <p>Take an assessment to see your scores here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Roadmap Completion */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-rose-500" />
              Learning Roadmap Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="pointer-events-none">
                    <tspan x="50%" dy="-0.5em" fontSize="30" fontWeight="bold" fill="#0f172a">{completion}%</tspan>
                    <tspan x="50%" dy="1.5em" fontSize="12" fontWeight="600" fill="#64748b" letterSpacing="1">COMPLETED</tspan>
                  </text>
                  <Pie
                    data={roadmapPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {roadmapPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default ProgressTracker;
