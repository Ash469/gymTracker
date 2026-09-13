import React from 'react';

export default function Navbar({ route, navigate, user, onOpenAuth, onLogout }) {
  const isSelection = route.path === '/' || route.path === '/exercises';
  const isGuide = route.path.endsWith('/guide');
  const isTrack = route.path.endsWith('/track');
  const isSummary = route.path.endsWith('/summary');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 mb-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        {/* Brand Logo & Title */}
        <div 
          className="cursor-pointer group flex items-center gap-2.5 select-none" 
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-emerald-500 transition-colors">
            <img 
              src="/formFit.svg" 
              alt="FormFit AI Logo" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <span className="hidden font-bold text-xs text-emerald-500">⚡</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif-claude text-xl font-bold text-zinc-900 tracking-tight leading-none">
              FormFit
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold tracking-wider uppercase">
              AI Vision
            </span>
          </div>
        </div>

        {/* Navigation & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block"></div>

          {/* User Profile / Auth Area */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-[11px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-zinc-900 leading-tight">
                    {user.name}
                  </div>
                  {user.fitnessLevel && (
                    <div className="text-[9px] font-medium text-emerald-700 uppercase tracking-wider leading-none">
                      {user.fitnessLevel.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
