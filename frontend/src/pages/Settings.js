import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { User, Mail, Zap, LogOut, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50" data-testid="settings-page">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8" data-testid="settings-title">Settings</h1>

        {/* Profile */}
        <Card className="border-slate-200 mb-6" data-testid="profile-card">
          <CardContent className="p-6">
            <h2 className="font-heading text-base font-semibold text-slate-900 mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900" data-testid="profile-name">{user?.name}</p>
                <p className="text-sm text-slate-500" data-testid="profile-email">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Credits */}
        <Card className="border-slate-200 mb-6" data-testid="plan-card">
          <CardContent className="p-6">
            <h2 className="font-heading text-base font-semibold text-slate-900 mb-4">Plan & Credits</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Current Plan:</span>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 capitalize">{user?.plan || 'free'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Credits Remaining:</span>
                  <span className="font-semibold text-slate-900" data-testid="settings-credits">{user?.credits ?? 0}</span>
                </div>
              </div>
              <Link to="/pricing">
                <Button variant="outline" className="border-slate-200" data-testid="upgrade-btn">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Danger */}
        <Card className="border-slate-200" data-testid="danger-card">
          <CardContent className="p-6">
            <h2 className="font-heading text-base font-semibold text-slate-900 mb-4">Account</h2>
            <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50" data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
