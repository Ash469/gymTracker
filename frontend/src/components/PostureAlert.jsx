import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PostureAlert({ warning }) {
  if (!warning) return null;

  return (
    <div className="absolute bottom-5 left-5 right-5 z-30 pointer-events-none transition-all duration-300">
      <div className="bg-rose-600 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-rose-500/40 flex items-center gap-3.5 pointer-events-auto animate-pulse">
        <div className="p-2.5 bg-rose-700 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-100">
              Posture Warning Alert
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold leading-snug mt-0.5 text-white">
            {warning}
          </p>
        </div>
      </div>
    </div>
  );
}

