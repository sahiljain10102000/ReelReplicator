import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Zap, Plus, Clock, CheckCircle2, Loader2, AlertCircle, Play, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusConfig = {
  queued: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Queued' },
  processing: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Processing' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`, { withCredentials: true });
      setJobs(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const recentJobs = jobs.slice(0, 5);
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const processingCount = jobs.filter(j => j.status === 'processing' || j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" data-testid="dashboard-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening with your reels.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200" data-testid="credits-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Credits Remaining</p>
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-4xl font-heading font-bold text-slate-900">{user?.credits ?? 0}</p>
              <div className="mt-2">
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs capitalize">{user?.plan || 'free'} plan</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200" data-testid="completed-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-4xl font-heading font-bold text-slate-900">{completedCount}</p>
              <p className="text-xs text-slate-400 mt-2">Total reels generated</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200" data-testid="processing-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">In Progress</p>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-4xl font-heading font-bold text-slate-900">{processingCount}</p>
              <p className="text-xs text-slate-400 mt-2">Currently processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Create */}
        <Card className="border-slate-200 mb-8 overflow-hidden" data-testid="quick-create-card">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-slate-900">Create New Reel</h2>
              <p className="text-sm text-slate-500 mt-1">Upload a reference video, add your face, and let AI do the magic.</p>
            </div>
            <Link to="/create">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 transition-all" data-testid="quick-create-btn">
                <Plus className="h-4 w-4 mr-2" /> New Reel
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Jobs */}
        <div data-testid="recent-jobs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Recent Jobs</h2>
            {jobs.length > 5 && (
              <Link to="/history" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : recentJobs.length === 0 ? (
            <Card className="border-slate-200 border-dashed" data-testid="empty-jobs">
              <CardContent className="p-12 text-center">
                <Play className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No reels yet</p>
                <p className="text-sm text-slate-400 mt-1">Create your first AI reel to get started.</p>
                <Link to="/create">
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="empty-create-btn">
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Reel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const sc = statusConfig[job.status] || statusConfig.queued;
                const StatusIcon = sc.icon;
                return (
                  <Link key={job.job_id} to={`/jobs/${job.job_id}`} data-testid={`job-card-${job.job_id}`}>
                    <Card className="job-card border-slate-200 cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <Play className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">{job.prompt || 'Untitled'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <Badge className={`${sc.color} border-0 gap-1`}>
                          <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                          {sc.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
