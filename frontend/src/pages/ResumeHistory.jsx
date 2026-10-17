import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { 
  Search, Filter, ArrowUpDown, FileText, Eye, RefreshCw, Trash2, MoreVertical, File, AlertCircle, Loader2, Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';

import Modal from '../components/Modal';

const ResumeHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Deletion modal and feedback states
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get('/resumes');
        
        const mappedData = (response.data || []).map(resume => {
          const skillsCount = resume.detectedSkills ? resume.detectedSkills.length : 0;
          // Calculate a fallback derived score for older resumes that don't have an ATS score in the DB
          const derivedScore = skillsCount > 0 ? Math.min(100, 45 + (skillsCount * 3)) : 0; 
          
          return {
            id: resume.id,
            name: resume.originalFileName || 'Untitled_Resume.pdf',
            version: `v${resume.version || 1}.0`,
            date: resume.uploadedAt || new Date().toISOString(),
            skillsFound: skillsCount,
            score: resume.atsScore != null ? resume.atsScore : derivedScore,
            status: resume.analysisComplete ? 'Analyzed' : 'Pending'
          };
        });
        
        setHistory(mappedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setError('Failed to load your resume history. Please try again later.');
        setLoading(false);
      }
    };

    fetchResumes();
  }, [navigate]);

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;
    setIsDeleting(true);
    const targetId = resumeToDelete.id;
    try {
      await api.delete(`/resumes/${targetId}`);
      setHistory(prev => prev.filter(item => item.id !== targetId));
      setActionFeedback('Resume deleted successfully.');
      setTimeout(() => setActionFeedback(''), 3000);
      setResumeToDelete(null);
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setActionFeedback('Failed to delete resume. Please try again.');
      setTimeout(() => setActionFeedback(''), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.version.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'score-desc': return b.score - a.score;
        case 'score-asc': return a.score - b.score;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

    return result;
  }, [history, searchQuery, statusFilter, sortBy]);

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your resume history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Resume History</h1>
        <p className="text-slate-500 mt-2 text-lg">View and manage your previously analyzed resumes.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md flex items-start gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-96">
              <Input
                placeholder="Search resumes..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select 
                  className="w-32 h-10"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Analyzed">Analyzed</option>
                  <option value="Archived">Archived</option>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
                <Select 
                  className="w-40 h-10"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="score-desc">Highest Score</option>
                  <option value="score-asc">Lowest Score</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </Select>
              </div>
            </div>
          </div>

          {filteredAndSortedHistory.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon={FileText}
                title="No resumes found"
                description={history.length === 0 ? "You haven't uploaded any resumes yet." : "Try adjusting your search or filters to find what you're looking for."}
                action={
                  <Button onClick={() => {
                    if (history.length === 0) {
                      navigate('/dashboard/resume');
                    } else {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }
                  }}>
                    {history.length === 0 ? "Analyze Resume" : "Clear Filters"}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Resume Name</th>
                      <th className="px-6 py-4">Version</th>
                      <th className="px-6 py-4">Uploaded Date</th>
                      <th className="px-6 py-4 text-center">Skills Found</th>
                      <th className="px-6 py-4 text-center">ATS Score</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAndSortedHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <File className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-900 truncate max-w-[200px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.version}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4 text-center text-slate-700 font-medium">{item.skillsFound}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getScoreColor(item.score)} className="font-bold">
                            {item.score}/100
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${item.status === 'Analyzed' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500 border border-dashed border-slate-300'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View" onClick={() => navigate('/dashboard/resume', { state: { resumeId: item.id } })}>
                              <Eye className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Analyze Job" onClick={() => navigate('/dashboard/jobs', { state: { resumeId: item.id } })}>
                              <Briefcase className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600" 
                              title="Delete Resume" 
                              onClick={() => setResumeToDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredAndSortedHistory.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <File className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{item.version} • {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={getScoreColor(item.score)} className="font-bold shrink-0">
                        {item.score}/100
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-t border-b border-slate-100 my-3">
                      <div className="text-center flex-1">
                        <p className="text-xs text-slate-500 mb-1">Skills Found</p>
                        <p className="font-medium text-slate-900">{item.skillsFound}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <p className="font-medium text-slate-900 text-sm">{item.status}</p>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1" leftIcon={<Eye className="h-4 w-4" />} onClick={() => navigate('/dashboard/resume', { state: { resumeId: item.id } })}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" leftIcon={<Briefcase className="h-4 w-4 text-indigo-600" />} onClick={() => navigate('/dashboard/jobs', { state: { resumeId: item.id } })}>
                        Analyze Job
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-3 text-rose-600 hover:bg-rose-50 border-slate-200" 
                        title="Delete Resume"
                        onClick={() => setResumeToDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </CardContent>
      </Card>
      {/* Delete Resume Confirmation Modal */}
      <Modal
        isOpen={!!resumeToDelete}
        onClose={() => !isDeleting && setResumeToDelete(null)}
        title="Delete Resume"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setResumeToDelete(null)} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white border-none"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Resume
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4 py-2">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              Delete &quot;{resumeToDelete?.name}&quot;?
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete this resume? This document and its parsed skills, bullet points, and ATS evaluation will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>

      {/* Floating feedback notification toast */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 transition-all animate-in fade-in slide-in-from-bottom-2">
          <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
          <span className="text-sm font-medium">{actionFeedback}</span>
        </div>
      )}

    </div>
  );
};

export default ResumeHistory;
