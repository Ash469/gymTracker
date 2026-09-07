import React from 'react';

export default function Navbar({ route, navigate }) {
  const isSelection = route.path === '/' || route.path === '/exercises';
  const isGuide = route.path.endsWith('/guide');
  const isTrack = route.path.endsWith('/track');
  const isSummary = route.path.endsWith('/summary');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 mb-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        {/* Brand Logo & Title */}
        <div 
          className="cursor-pointer group flex items-center gap-2.5 select-none" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-amber-600 transition-colors">
            ⚡
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif-claude text-xl font-bold text-zinc-900 tracking-tight leading-none">
              FormTracker
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded font-semibold tracking-wider uppercase">
              AI Vision
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSelection 
                ? 'bg-zinc-900 text-white font-semibold shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Catalog
          </button>

          {route.exerciseId && (
            <button
              onClick={() => navigate(`/exercise/${route.exerciseId}/guide`)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isGuide 
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs' 
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              Guide
            </button>
          )}

          {isTrack && (
            <span className="text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Tracking
            </span>
          )}

          {isSummary && (
            <span className="text-amber-900 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs">
              Summary
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
