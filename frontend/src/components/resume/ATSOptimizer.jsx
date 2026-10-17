import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import Button from '../Button';
import Badge from '../Badge';

export default function ATSOptimizer({ matchData, resumeData }) {
  const [selectedMissingSkill, setSelectedMissingSkill] = useState(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [localResumeData, setLocalResumeData] = useState(resumeData);

  const handleAITailor = async (skill) => {
    setSelectedMissingSkill(skill);
    // In a real flow, this would select the skill and prompt the user to click a bullet point to tailor.
    // We'll simulate picking the first bullet point of the first experience for demo purposes.
  };

  const tailorBullet = async (expIdx, bulletIdx) => {
    if (!selectedMissingSkill) return;
    
    setIsTailoring(true);
    
    // Simulate API call POST /api/resumes/{id}/tailor
    setTimeout(() => {
      const updatedResume = { ...localResumeData };
      const bullet = updatedResume.experience[expIdx].bullets[bulletIdx];
      
      bullet.optimizedText = `Strategically leveraged ${selectedMissingSkill} to ${bullet.originalText.toLowerCase()}, improving system performance by 25%.`;
      if (!bullet.injectedSkills) bullet.injectedSkills = [];
      bullet.injectedSkills.push(selectedMissingSkill);
      
      setLocalResumeData(updatedResume);
      setIsTailoring(false);
      setSelectedMissingSkill(null);
    }, 1500);
  };

  if (!matchData || !localResumeData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
      
      {/* LEFT COLUMN: ATS Score & Gap Analysis */}
      <div className="lg:col-span-1 space-y-6">
        {/* ATS Score Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="text-slate-100 stroke-current" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className="text-indigo-600 stroke-current transition-all duration-1000 ease-in-out" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={351} 
                  strokeDashoffset={351 - (351 * matchData.atsScore) / 100} 
                />
              </svg>
              <div className="absolute text-3xl font-bold text-slate-900">{matchData.atsScore}%</div>
            </div>
            <h3 className="mt-4 font-bold text-lg text-slate-900">ATS Match Score</h3>
            <p className="text-sm text-slate-500 mt-1">Role Readiness: {matchData.roleReadiness}%</p>
          </CardContent>
        </Card>

        {/* Missing Keywords Action List */}
        <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-rose-700 flex items-center gap-2 text-md">
              <AlertCircle className="w-5 h-5" /> Missing Critical Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchData.keywordAnalysis.missing.map((skill) => (
              <div key={skill} className={`flex items-center justify-between p-3 rounded-lg border shadow-sm transition-colors ${selectedMissingSkill === skill ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-rose-100'}`}>
                <span className="font-semibold text-slate-800 text-sm">{skill}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant={selectedMissingSkill === skill ? "primary" : "outline"} onClick={() => handleAITailor(skill)} title="Inject into Resume">
                    <Sparkles className={`w-4 h-4 ${selectedMissingSkill === skill ? 'text-white' : 'text-indigo-600'}`} />
                  </Button>
                  <Button size="sm" variant="outline" title="Take Micro-Quiz to Verify">
                    <Award className="w-4 h-4 text-amber-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Interactive Resume Tailoring */}
      <div className="lg:col-span-2">
        <Card className="h-full border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" /> AI Resume Tailoring
            </CardTitle>
            <p className="text-sm text-slate-500">Inject missing keywords into your experience automatically.</p>
          </CardHeader>
          <CardContent>
            {selectedMissingSkill ? (
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> 
                  Click any bullet point below to rewrite it with <strong>{selectedMissingSkill}</strong>
                </p>
                <Button size="sm" variant="ghost" onClick={() => setSelectedMissingSkill(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm text-slate-500 text-center">
                Select a missing keyword on the left to seamlessly inject it into your resume.
              </div>
            )}

            {/* Experience Iteration */}
            <div className="space-y-6">
              {localResumeData.experience.map((exp, expIdx) => (
                <div key={expIdx} className="border-l-2 border-slate-200 pl-4">
                  <h4 className="font-bold text-slate-800">{exp.role} @ {exp.company}</h4>
                  <ul className="mt-3 space-y-3">
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <li 
                        key={bullet.id} 
                        className={`text-sm flex items-start gap-3 group relative p-2 -ml-2 rounded-lg transition-colors
                          ${selectedMissingSkill ? 'cursor-pointer hover:bg-indigo-50' : ''}
                          ${isTailoring && selectedMissingSkill ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        onClick={() => tailorBullet(expIdx, bulletIdx)}
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <div className="flex-1">
                          <p className={`${bullet.optimizedText ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                            {bullet.optimizedText || bullet.originalText}
                          </p>
                          
                          {/* Inline Badges for injected skills */}
                          {bullet.injectedSkills && bullet.injectedSkills.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {bullet.injectedSkills.map(s => (
                                <Badge key={s} variant="success" className="text-[10px] bg-emerald-100 text-emerald-700">
                                  + {s} added
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedMissingSkill && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button size="sm" variant="secondary" className="h-7 text-xs">Rewrite</Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
