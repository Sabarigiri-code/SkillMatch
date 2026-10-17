import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Award, Filter, Search, Plus, Trash2, RefreshCw, Eye
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const AssessmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/assessments/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch assessment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment record?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Failed to delete assessment", err);
        alert("Failed to delete the assessment. Please try again.");
      }
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const filteredAndSortedHistory = history
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const role = item.jobTitle || item.skill || 'General Assessment';
      const type = item.assessmentType || '';
      return role.toLowerCase().includes(q) || type.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortOrder === 'date-desc') return new Date(b.takenAt) - new Date(a.takenAt);
      if (sortOrder === 'date-asc') return new Date(a.takenAt) - new Date(b.takenAt);
      if (sortOrder === 'score-desc') return (b.score || 0) - (a.score || 0);
      if (sortOrder === 'score-asc') return (a.score || 0) - (b.score || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
          <p>Loading assessment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment History</h1>
          <p className="text-slate-500 mt-1">Review your past skill assessments and scores.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/dashboard/interview')} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            Start Interview Prep
          </Button>
          <Button onClick={() => navigate('/dashboard/assessment')} leftIcon={<Plus className="h-4 w-4" />}>
            Take New Assessment
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-96">
              <Input
                placeholder="Search by role or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                fullWidth
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="score-desc">Highest Score</option>
                  <option value="score-asc">Lowest Score</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAndSortedHistory.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon={Award}
                title="No assessments found"
                description={history.length === 0 ? "You haven't taken any assessments yet." : "Try adjusting your search to find what you're looking for."}
                action={
                  <Button onClick={() => {
                    if (history.length === 0) {
                      navigate('/dashboard/assessment');
                    } else {
                      setSearchQuery('');
                    }
                  }}>
                    {history.length === 0 ? "Take Assessment" : "Clear Filters"}
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
                      <th className="px-6 py-4">Target Role / Skill</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Date Taken</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAndSortedHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Award className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-900 truncate max-w-[200px]">
                              {item.jobTitle || item.skill || 'General Assessment'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.assessmentType === 'WEEKLY_FULL' ? 'Roadmap Assessment' : 'Skill Assessment'}</td>
                        <td className="px-6 py-4 text-slate-500 capitalize">{item.difficulty?.toLowerCase() || 'Intermediate'}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(item.takenAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getScoreColor(item.score)} className="font-bold">
                            {item.score}/100
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="View Results" 
                              onClick={() => navigate('/dashboard/assessment', { state: { pastAssessment: item } })}
                            >
                              <Eye className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600" title="Delete" onClick={() => handleDelete(item.id)}>
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
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 line-clamp-1">{item.jobTitle || item.skill || 'General Assessment'}</h4>
                          <p className="text-xs text-slate-500 mt-1">{item.assessmentType} • {new Date(item.takenAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={getScoreColor(item.score)} className="font-bold shrink-0">
                        {item.score}/100
                      </Badge>
                    </div>

                    <div className="flex justify-between gap-2 pt-1 mt-3 border-t border-slate-100 pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1" 
                        leftIcon={<Eye className="h-4 w-4" />} 
                        onClick={() => navigate('/dashboard/assessment', { state: { pastAssessment: item } })}
                      >
                        View Results
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 text-rose-600 hover:bg-rose-50 border-slate-200" onClick={() => handleDelete(item.id)}>
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
    </div>
  );
};

export default AssessmentHistory;
