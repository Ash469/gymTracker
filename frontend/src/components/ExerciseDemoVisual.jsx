import React from 'react';

export default function ExerciseDemoVisual({ exercise, compact = false }) {
  if (!exercise?.demo_gif) return null;

  return (
    <div className={`claude-card rounded-xl border border-zinc-200 flex flex-col ${compact ? 'p-3' : 'p-5'}`}>
      <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
        Movement Reference
      </span>

      <div className="relative rounded-lg overflow-hidden bg-zinc-50 border border-zinc-200 aspect-[16/10] w-full flex items-center justify-center p-2">
        <img
          src={exercise.demo_gif}
          alt={exercise.name || 'Exercise Demonstration'}
          className="max-w-full max-h-full object-contain rounded-md"
        />
      </div>
    </div>
  );
}
