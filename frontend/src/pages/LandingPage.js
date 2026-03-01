import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import { Zap, Play, Wand2, Download, Shield, Clock, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    { icon: Play, title: "Motion Preservation", desc: "AI perfectly replicates movement patterns from your reference reel." },
    { icon: Wand2, title: "Face Swap AI", desc: "Seamlessly swap faces while maintaining natural expressions." },
    { icon: Clock, title: "60s Reel Support", desc: "Process reels up to 60 seconds with full quality retention." },
    { icon: Download, title: "Instant Download", desc: "Get your generated video in HD quality, ready to post." },
    { icon: Shield, title: "Content Safe", desc: "Built-in moderation ensures all content stays appropriate." },
    { icon: Sparkles, title: "High Quality", desc: "1080p and 4K output with natural motion and expressions." },
  ];

  const plans = [
    { id: "free", name: "Free", price: 0, credits: 3, features: ["3 watermarked videos", "720p quality", "Basic support"], popular: false },
    { id: "starter", name: "Starter", price: 29, credits: 50, features: ["50 HD videos", "1080p quality", "No watermark", "Priority support"], popular: false },
    { id: "pro", name: "Pro", price: 79, credits: 200, features: ["200 HD videos", "1080p quality", "No watermark", "Priority support", "Batch processing"], popular: true },
    { id: "agency", name: "Agency", price: 199, credits: 1000, features: ["1000 HD videos", "4K quality", "No watermark", "Dedicated support", "API access", "Team seats"], popular: false },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.05),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-6 px-3 py-1" data-testid="hero-badge">
                  <Sparkles className="h-3 w-3 mr-1" /> AI-Powered Video Generation
                </Badge>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-none" data-testid="hero-title">
                  Replicate Any Reel<br />
                  <span className="text-indigo-600">With Your Face</span>
                </h1>
              </div>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                Upload a reference reel, swap in your face, and let AI recreate the video with perfect motion preservation. Built for creators, agencies, and brands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleLogin} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 transition-all text-base px-8" data-testid="hero-cta">
                  Generate for Free <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-base px-8" data-testid="hero-secondary-cta" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  See How It Works
                </Button>
              </div>
              <p className="text-xs text-slate-400">3 free generations. No credit card required.</p>
            </div>

            {/* Right - Visual */}
            <div className="relative hidden lg:block" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100/50 rounded-3xl blur-2xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                      <img src="https://images.unsplash.com/photo-1758273238139-e6cb4d330fa1?w=400&h=500&fit=crop" alt="Creator" className="w-full h-64 object-cover" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-medium text-slate-600">Reference Reel</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-slate-600">Processing</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-indigo-600 rounded-full" style={{ transition: 'width 2s ease' }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <Wand2 className="h-5 w-5 text-indigo-600 mb-2" />
                      <p className="text-xs font-medium text-slate-700">AI Transformation</p>
                      <p className="text-xs text-slate-400 mt-1">Face swap with motion sync</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                      <img src="https://images.unsplash.com/photo-1699120491601-37e4a6041b83?w=400&h=500&fit=crop" alt="Result" className="w-full h-64 object-cover" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-medium text-indigo-600">AI Generated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-medium mb-3">Capabilities</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need to create viral reels
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="bg-white border-slate-200 hover:shadow-md transition-shadow duration-200" style={{ animationDelay: `${i * 0.1}s` }} data-testid={`feature-card-${i}`}>
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-medium mb-3">Pricing</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Simple, credit-based pricing
            </h2>
            <p className="text-slate-500 mt-4">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-indigo-500 shadow-lg animate-pulse-glow' : 'border-slate-200'}`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0 px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="font-heading text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-heading font-bold text-slate-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-slate-500 text-sm ml-1">one-time</span>}
                  </div>
                  <CardDescription>{plan.credits} video credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleLogin}
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
                    data-testid={`pricing-cta-${plan.id}`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-heading font-semibold text-slate-900">ReelAI</span>
            </div>
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} ReelAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
