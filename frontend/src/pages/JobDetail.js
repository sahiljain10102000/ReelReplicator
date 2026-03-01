import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Clock, CheckCircle2, Loader2, AlertCircle, Download, Play, FileVideo, User, Wand2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusConfig = {
  queued: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Queued', progress: 10 },
  processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Loader2, label: 'Processing', progress: 60 },
  completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Completed', progress: 100 },
  failed: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Failed', progress: 0 },
};

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${API}/jobs/${jobId}`, { withCredentials: true });
      setJob(res.data);
      if (res.data.status === 'completed' || res.data.status === 'failed') {
        // Stop polling handled by checking in interval
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Job not found.</p>
          <Link to="/dashboard"><Button variant="outline" className="mt-4">Go to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const sc = statusConfig[job.status] || statusConfig.queued;
  const StatusIcon = sc.icon;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="job-detail-page">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/history" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6" data-testid="back-link">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>

        {/* Status Card */}
        <Card className="border-slate-200 mb-6" data-testid="job-status-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 font-mono">{job.job_id}</p>
                <h1 className="font-heading text-xl font-semibold text-slate-900 mt-1">{job.prompt || 'Untitled Reel'}</h1>
              </div>
              <Badge className={`${sc.color} border gap-1`} data-testid="job-status-badge">
                <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                {sc.label}
              </Badge>
            </div>
            {(job.status === 'queued' || job.status === 'processing') && (
              <div className="space-y-2">
                <Progress value={sc.progress} className="h-2" />
                <p className="text-xs text-slate-400">
                  {job.status === 'queued' ? 'Waiting in queue...' : 'AI is generating your reel...'}
                </p>
              </div>
            )}
            <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
              <span>Created: {new Date(job.created_at).toLocaleString()}</span>
              {job.watermarked && <Badge variant="outline" className="text-xs">Watermarked</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Output Video */}
        {job.status === 'completed' && job.output_video_url && (
          <Card className="border-slate-200 mb-6 overflow-hidden" data-testid="output-video-card">
            <div className="bg-black aspect-video relative">
              <video src={job.output_video_url} controls className="w-full h-full object-contain" data-testid="output-video" />
            </div>
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Generated Reel</p>
              <a href={job.output_video_url} target="_blank" rel="noopener noreferrer" download>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" size="sm" data-testid="download-btn">
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Job Details */}
        <Card className="border-slate-200" data-testid="job-details-card">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-slate-900">Job Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileVideo className="h-4 w-4 text-slate-400" />
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Reference Video</span>
                </div>
                <p className="text-sm text-slate-700">{job.reference_video_name}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Face Image</span>
                </div>
                <p className="text-sm text-slate-700">{job.face_image_name}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Prompt</span>
              </div>
              <p className="text-sm text-slate-700">{job.prompt}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
