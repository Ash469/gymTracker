import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';
import { User, LogIn, Sparkles, X, LogOut, CheckCircle2, UserPlus } from 'lucide-react';
import { loginUser, registerUser, fetchUserProfile } from '../services/api';

export default function Navbar({ route, navigate, user, setUser, onGetStarted }) {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('home');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fitnessLevel: 'INTERMEDIATE',
    primaryGoal: 'HYPERTROPHY',
    workoutFrequency: '3-4x/week',
  });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('formfit_token');
    if (token) {
      fetchUserProfile()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('formfit_token');
          setUser(null);
        });
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const data = await loginUser({ email: formData.email, password: formData.password });
        setUser(data.user);
      } else {
        const data = await registerUser({
          name: formData.name || 'Athlete',
          email: formData.email,
          password: formData.password,
          fitnessLevel: formData.fitnessLevel,
          primaryGoal: formData.primaryGoal,
          workoutFrequency: formData.workoutFrequency,
        });
        setUser(data.user);
      }
      setShowSignInModal(false);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('formfit_token');
    setUser(null);
    if (route.path === '/profile') navigate('/');
  };

  const scrollToSection = (sectionId) => {
    if (route.path !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (tabKey, sectionId) => {
    setActiveTab(tabKey);
    if (tabKey === 'home') {
      if (route.path !== '/') navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(sectionId);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/profile');
    } else {
      setAuthMode('register');
      setShowSignInModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e6e2dc] py-3.5 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">

          {/* 1. Left: Logo */}
          <div
            className="cursor-pointer group flex items-center gap-2.5 select-none smooth-press"
            onClick={() => handleNavClick('home', 'hero')}
          >
            <img src={logoImg} alt="FormFit Logo" className="h-8 w-auto object-contain max-w-[180px]" />
          </div>

          {/* 2. Middle: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f5efe8] p-1.5 rounded-2xl border border-[#e8dfd5]">
            <button
              onClick={() => handleNavClick('home', 'hero')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${activeTab === 'home' && route.path === '/'
                  ? 'bg-[#1c1917] text-white shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-white/60'
                }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('features', 'how-it-works')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${activeTab === 'features'
                  ? 'bg-[#1c1917] text-white shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-white/60'
                }`}
            >
              Features
            </button>

            <button
              onClick={() => handleNavClick('exercises', 'catalog')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${activeTab === 'exercises'
                  ? 'bg-[#1c1917] text-white shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-white/60'
                }`}
            >
              Exercises
            </button>

            <button
              onClick={() => handleNavClick('about', 'privacy')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${activeTab === 'about'
                  ? 'bg-[#1c1917] text-white shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-white/60'
                }`}
            >
              About
            </button>
          </nav>

          {/* 3. Right: Auth / Profile Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-[#e6e2dc] bg-white text-[#78716c] hover:text-[#e11d48] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setFormData({ name: '', email: 'demo@formfit.com', password: 'Demo1234!', fitnessLevel: 'INTERMEDIATE', primaryGoal: 'HYPERTROPHY', workoutFrequency: '3-4x/week' }); setShowSignInModal(true); }}
                className="px-4 py-2 text-xs font-bold text-[#171513] hover:text-[#da7756] transition-colors font-sans flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md hover:bg-[#d4603c] smooth-press flex items-center gap-1.5"
              style={{ background: '#E87552' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {user ? 'My Profile' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal (Login & Register) */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#faf8f5] border border-[#e6e2dc] rounded-2xl p-6 sm:p-8 max-w-md w-full relative space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#78716c] hover:text-[#171513] hover:bg-[#eae5de] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#f6eee9] border border-[#e6d4c9] rounded-2xl flex items-center justify-center mx-auto text-[#E87552]">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif-claude text-2xl font-bold text-[#171513]">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-[#78716c]">
                {authMode === 'login'
                  ? 'Sign in to sync your workout history to PostgreSQL & AWS Bedrock.'
                  : 'Register your FormFit profile for AI posture coaching.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#171513]">Full Name</label>
                    <input
                      type="text"
                      placeholder="Alex Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171513]">Email Address</label>
                <input
                  type="email"
                  placeholder="demo@formfit.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171513]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#171513]">Fitness Level</label>
                      <select
                        value={formData.fitnessLevel}
                        onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                        className="w-full bg-white border border-[#e6e2dc] rounded-xl px-2.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                      >
                        <option value="BEGINNER">BEGINNER</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#171513]">Primary Goal</label>
                      <select
                        value={formData.primaryGoal}
                        onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                        className="w-full bg-white border border-[#e6e2dc] rounded-xl px-2.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                      >
                        <option value="HYPERTROPHY">HYPERTROPHY</option>
                        <option value="STRENGTH">STRENGTH</option>
                        <option value="FORM_CORRECTION">FORM CORRECTION</option>
                        <option value="INJURY_PREVENTION">INJURY PREVENTION</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#171513]">Workout Frequency</label>
                    <select
                      value={formData.workoutFrequency}
                      onChange={(e) => setFormData({ ...formData, workoutFrequency: e.target.value })}
                      className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                    >
                      <option value="2x/week">2x / week</option>
                      <option value="3-4x/week">3–4x / week</option>
                      <option value="5+x/week">5+x / week</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs text-white transition-colors flex items-center justify-center gap-2"
                style={{ background: '#E87552' }}
              >
                {loading ? 'Authenticating...' : authMode === 'login' ? 'Sign In to FormFit' : 'Create FormFit Account'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#e6e2dc]">
              {authMode === 'login' ? (
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className="text-xs font-bold text-[#E87552] hover:underline"
                >
                  Don't have an account? Sign Up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="text-xs font-bold text-[#E87552] hover:underline"
                >
                  Already registered? Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
