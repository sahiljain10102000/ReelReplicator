import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Upload, User, Wand2, ArrowRight, ArrowLeft, X, CheckCircle2, Loader2, FileVideo, ImageIcon } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  { id: 1, label: 'Reference Video', icon: FileVideo },
  { id: 2, label: 'Face Image', icon: User },
  { id: 3, label: 'Prompt', icon: Wand2 },
  { id: 4, label: 'Review', icon: CheckCircle2 },
];

export default function CreateReel() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVideoDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }, []);

  const handleFaceDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFaceFile(file);
    setFacePreview(URL.createObjectURL(file));
  }, []);

  const canNext = () => {
    if (step === 1) return !!videoFile;
    if (step === 2) return !!faceFile;
    if (step === 3) return prompt.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!videoFile || !faceFile || !prompt.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reference_video', videoFile);
      formData.append('face_image', faceFile);
      formData.append('prompt', prompt);
      const res = await axios.post(`${API}/jobs`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Reel generation started!');
      refreshUser();
      navigate(`/jobs/${res.data.job_id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create reel');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="create-reel-page">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" data-testid="create-title">Create New Reel</h1>
          <p className="text-slate-500 mt-1 text-sm">Follow the steps to generate your AI reel.</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8" data-testid="step-indicators">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  step === s.id ? 'bg-indigo-600 text-white shadow-md' :
                  step > s.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}
                data-testid={`step-${s.id}`}
              >
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${step > s.id ? 'bg-indigo-300' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-slate-200 shadow-sm" data-testid="step-content">
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Upload Video */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in" data-testid="step-1-content">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Upload Reference Reel</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload the video you want to replicate (max 60 seconds, 100MB)</p>
                </div>
                {!videoFile ? (
                  <div
                    className="upload-zone border-2 border-dashed border-slate-200 rounded-xl p-12 text-center cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleVideoDrop}
                    onClick={() => document.getElementById('video-input').click()}
                    data-testid="video-dropzone"
                  >
                    <FileVideo className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-700">Drop your video here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-2">MP4, MOV, AVI up to 100MB</p>
                    <input id="video-input" type="file" accept="video/*" className="hidden" onChange={handleVideoDrop} data-testid="video-input" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <video src={videoPreview} controls className="w-full h-full object-contain" data-testid="video-preview" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileVideo className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{videoFile.name}</span>
                        <span className="text-xs text-slate-400">({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setVideoFile(null); setVideoPreview(null); }} data-testid="remove-video">
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Upload Face */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in" data-testid="step-2-content">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Upload Face Image</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload a clear, front-facing photo of the face to use</p>
                </div>
                {!faceFile ? (
                  <div
                    className="upload-zone border-2 border-dashed border-slate-200 rounded-xl p-12 text-center cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFaceDrop}
                    onClick={() => document.getElementById('face-input').click()}
                    data-testid="face-dropzone"
                  >
                    <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-700">Drop face image here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP up to 10MB</p>
                    <input id="face-input" type="file" accept="image/*" className="hidden" onChange={handleFaceDrop} data-testid="face-input" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-100 shadow-lg">
                        <img src={facePreview} alt="Face" className="w-full h-full object-cover" data-testid="face-preview" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-sm text-slate-600">{faceFile.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => { setFaceFile(null); setFacePreview(null); }} data-testid="remove-face">
                        <X className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Prompt */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in" data-testid="step-3-content">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Describe the Transformation</h2>
                  <p className="text-sm text-slate-500 mt-1">Tell our AI how you want the reel to be transformed</p>
                </div>
                <div className="relative">
                  <Wand2 className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Recreate this dance reel with my face, keeping the same energy and movements. Add a warm filter."
                    className="w-full min-h-[160px] pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400 text-sm resize-none"
                    data-testid="prompt-input"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-slate-400">{prompt.length}/500</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in" data-testid="step-4-content">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Review & Generate</h2>
                  <p className="text-sm text-slate-500 mt-1">Review your inputs before generating</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Reference Video</p>
                    {videoPreview && (
                      <video src={videoPreview} className="w-full rounded-lg aspect-video object-cover" data-testid="review-video" />
                    )}
                    <p className="text-xs text-slate-500 mt-2">{videoFile?.name}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Face Image</p>
                    {facePreview && (
                      <div className="flex justify-center">
                        <img src={facePreview} alt="Face" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow" data-testid="review-face" />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2 text-center">{faceFile?.name}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">Prompt</p>
                  <p className="text-sm text-slate-700" data-testid="review-prompt">{prompt}</p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <Wand2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  <p className="text-sm text-indigo-700">
                    This will use <strong>1 credit</strong>. You have <strong>{user?.credits ?? 0} credits</strong> remaining.
                    {user?.plan === 'free' && ' Output will be watermarked.'}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="border-slate-200"
                data-testid="prev-step-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={!canNext()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
                  data-testid="next-step-btn"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (user?.credits ?? 0) <= 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
                  data-testid="generate-btn"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="h-4 w-4 mr-2" /> Generate Reel</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
