import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Check, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/pricing`);
        setPlans(res.data);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleUpgrade = async (planId) => {
    if (!user) {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUrl = window.location.origin + '/pricing';
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      return;
    }
    setUpgrading(planId);
    try {
      const res = await axios.post(`${API}/user/upgrade`, { plan: planId }, { withCredentials: true });
      toast.success(res.data.message);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upgrade failed');
    }
    setUpgrading(null);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-indigo-600 font-medium mb-3">Pricing</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight" data-testid="pricing-title">
            Simple, credit-based pricing
          </h1>
          <p className="text-slate-500 mt-4 text-base">Start free. Scale as you grow. No hidden fees.</p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-slate-700">You have <strong>{user.credits}</strong> credits on the <strong className="capitalize">{user.plan}</strong> plan</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 ${plan.popular ? 'border-indigo-500 shadow-lg scale-[1.02]' : 'border-slate-200 hover:shadow-md'}`}
                data-testid={`plan-card-${plan.id}`}
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
                  {plan.id === 'free' ? (
                    <Button variant="outline" className="w-full border-slate-200" disabled data-testid={`plan-btn-${plan.id}`}>
                      {user?.plan === 'free' ? 'Current Plan' : 'Free Tier'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                      className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
                      data-testid={`plan-btn-${plan.id}`}
                    >
                      {upgrading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user?.plan === plan.id ? 'Current Plan' : 'Upgrade (MOCK)'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          Payment integration is mocked for this MVP. No real charges will occur.
        </p>
      </div>
    </div>
  );
}
