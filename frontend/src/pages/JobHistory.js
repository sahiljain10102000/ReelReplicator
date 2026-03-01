import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Clock, CheckCircle2, Loader2, AlertCircle, Play, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusConfig = {
  queued: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Queued' },
  processing: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Processing' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' },
};

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`, { withCredentials: true });
      setJobs(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="history-page">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" data-testid="history-title">Job History</h1>
            <p className="text-slate-500 mt-1 text-sm">{jobs.length} total generations</p>
          </div>
          <Link to="/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" data-testid="new-reel-btn">
              New Reel
            </Button>
          </Link>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-slate-100" data-testid="history-tabs">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
            <TabsTrigger value="processing" data-testid="tab-processing">Processing</TabsTrigger>
            <TabsTrigger value="queued" data-testid="tab-queued">Queued</TabsTrigger>
            <TabsTrigger value="failed" data-testid="tab-failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 border-dashed" data-testid="empty-history">
            <CardContent className="p-12 text-center">
              <Play className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No jobs found</p>
              <p className="text-sm text-slate-400 mt-1">{filter === 'all' ? 'Create your first reel to get started.' : `No ${filter} jobs.`}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="job-list">
            {filtered.map((job) => {
              const sc = statusConfig[job.status] || statusConfig.queued;
              const StatusIcon = sc.icon;
              return (
                <Link key={job.job_id} to={`/jobs/${job.job_id}`} data-testid={`history-job-${job.job_id}`}>
                  <Card className="job-card border-slate-200 cursor-pointer mb-3">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          {job.status === 'completed' && job.output_video_url ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Play className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{job.prompt || 'Untitled'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">
                              {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-slate-300">|</span>
                            <span className="text-xs text-slate-400">{job.reference_video_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${sc.color} border-0 gap-1 shrink-0`}>
                          <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                          {sc.label}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
