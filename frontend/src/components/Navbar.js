import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Zap, Menu, X, LogOut, User, CreditCard, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-lg font-semibold text-slate-900 tracking-tight">ReelAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors" data-testid="nav-dashboard">Dashboard</Link>
                <Link to="/create" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors" data-testid="nav-create">Create</Link>
                <Link to="/history" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors" data-testid="nav-history">History</Link>
                <Link to="/pricing" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors" data-testid="nav-pricing">Pricing</Link>
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5" data-testid="nav-credits">
                  <Zap className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-900">{user.credits}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none" data-testid="nav-user-menu">
                      <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-200 transition-all">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer" data-testid="nav-settings">
                        <User className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer" data-testid="nav-logout">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <a href="#features" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#pricing" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
                <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 transition-all" data-testid="nav-login-btn">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-toggle">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 animate-fade-in">
            {user ? (
              <div className="space-y-2 pt-3">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">Dashboard</Link>
                <Link to="/create" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">Create</Link>
                <Link to="/history" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">History</Link>
                <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">Pricing</Link>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">Settings</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Logout</button>
              </div>
            ) : (
              <div className="space-y-2 pt-3">
                <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700">Features</a>
                <a href="#pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-700">Pricing</a>
                <Button onClick={handleLogin} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
