import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { User, LogIn, Sparkles, X } from 'lucide-react';

export default function Navbar({ route, navigate, onGetStarted }) {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

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
    if (onGetStarted) {
      onGetStarted();
    } else {
      scrollToSection('catalog');
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

          {/* 2. Middle: Navigation Links (Home, Exercises, Features, About) */}
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

          {/* 3. Right: Sign In & Get Started Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSignInModal(true)}
              className="px-4 py-2 text-xs font-bold text-[#171513] hover:text-[#da7756] transition-colors font-sans flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>

            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md hover:bg-[#d4603c] smooth-press flex items-center gap-1.5"
              style={{ background: '#E87552' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#faf8f5] border border-[#e6e2dc] rounded-2xl p-6 sm:p-8 max-w-md w-full relative space-y-6 shadow-2xl">
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
              <h3 className="font-serif-claude text-2xl font-bold text-[#171513]">Welcome Back</h3>
              <p className="text-xs text-[#78716c]">Sign in to track your workout history & posture statistics.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowSignInModal(false); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171513]">Email Address</label>
                <input
                  type="email"
                  placeholder="runner@formfit.ai"
                  required
                  className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2.5 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171513]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#e6e2dc] rounded-xl px-3.5 py-2.5 text-xs text-[#171513] focus:outline-none focus:border-[#E87552]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-white transition-colors"
                style={{ background: '#E87552' }}
              >
                Sign In to FormFit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
