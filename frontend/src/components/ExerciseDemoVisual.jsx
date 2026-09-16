import React from 'react';

export default function ExerciseDemoVisual({ exercise, compact = false }) {
  if (!exercise?.demo_gif) return null;

  return (
    <div className={`claude-card rounded-2xl border border-zinc-200/90 flex flex-col bg-white shadow-2xs ${compact ? 'p-3' : 'p-5'}`}>
      <span className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
        Movement Reference
      </span>

      <div className="relative rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200/80 aspect-[16/10] w-full flex items-center justify-center p-2">
        <img
          src={exercise.demo_gif}
          alt={exercise.name || 'Exercise Demonstration'}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

