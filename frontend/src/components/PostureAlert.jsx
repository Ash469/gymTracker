import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PostureAlert({ warning }) {
  if (!warning) return null;

  return (
    <div className="absolute bottom-5 left-5 right-5 z-30 pointer-events-none transition-all duration-300 animate-bounce">
      <div className="bg-rose-600/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-rose-400/30 flex items-center gap-3.5 pointer-events-auto">
        <div className="p-2 bg-rose-700/80 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200">
              Posture Guardrail Warning
            </span>
          </div>
          <p className="text-xs font-bold leading-snug mt-0.5 text-white drop-shadow-sm">
            {warning}
          </p>
        </div>
      </div>
    </div>
  );
}
