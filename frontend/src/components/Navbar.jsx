import React from 'react';
import logoImg from '../../assets/logo.png';

export default function Navbar({ route, navigate }) {
  const isSelection = route.path === '/' || route.path === '/exercises';
  const isGuide = route.path.endsWith('/guide');
  const isTrack = route.path.endsWith('/track');
  const isSummary = route.path.endsWith('/summary');

  return (
    <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e6e2dc] py-3.5 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        {/* Brand Header */}
        <div 
          className="cursor-pointer group flex items-center gap-2.5 select-none smooth-press" 
          onClick={() => navigate('/')}
        >
          <img src={logoImg} alt="FormFit Live Logo" className="h-8 w-auto object-contain max-w-[180px]" />
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${
              isSelection 
                ? 'bg-[#1c1917] text-white shadow-2xs' 
                : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6eee9]'
            }`}
          >
            Exercises
          </button>

          {route.exerciseId && (
            <button
              onClick={() => navigate(`/exercise/${route.exerciseId}/guide`)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all smooth-press ${
                isGuide 
                  ? 'bg-[#1c1917] text-white shadow-2xs' 
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6eee9]'
              }`}
            >
              Guide
            </button>
          )}

          {isTrack && (
            <span className="text-[#059669] font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              Live Tracking
            </span>
          )}

          {isSummary && (
            <span className="text-[#ff5500] font-bold bg-[#f6eee9] border border-[#e6d4c9] px-3 py-1 rounded-xl text-xs">
              Summary Report
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
