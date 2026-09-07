import React, { useState } from 'react';

export default function ExerciseCard({ exercise, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const met = typeof exercise.met_value === 'number' && !isNaN(exercise.met_value) 
    ? exercise.met_value 
    : 3.8;
  
  const estimatedKcal = (met * 1.2).toFixed(1);
  const demoImgSrc = exercise.demo_gif;

  return (
    <div
      onClick={() => onSelect(exercise.id)}
      className="claude-card claude-card-hover rounded-xl p-5 flex flex-col justify-between gap-4 cursor-pointer group border border-zinc-200"
    >
      <div className="space-y-3">
        {/* Top Image Preview Banner */}
        <div className="relative aspect-[16/10] w-full bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200/60 flex items-center justify-center">
          {!imgError ? (
            <img
              src={demoImgSrc}
              alt={exercise.name}
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-medium">
              Exercise Preview
            </div>
          )}

          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-semibold uppercase bg-white/90 border border-zinc-200 px-2 py-0.5 rounded text-zinc-700 backdrop-blur-sm tracking-wider">
              {exercise.category}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 pt-1">
          <h3 className="text-base font-semibold text-zinc-900 group-hover:text-amber-800 transition-colors">
            {exercise.name}
          </h3>
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {exercise.how_to_perform?.[0] || exercise.description}
          </p>
        </div>

        {/* Target Muscles */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {exercise.target_muscles && exercise.target_muscles.map((m, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded font-medium"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
        <span className="text-zinc-500 font-mono text-[11px]">
          ~{estimatedKcal} kcal/min
        </span>
        <span className="font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Start guide <span className="text-zinc-400">→</span>
        </span>
      </div>
    </div>
  );
}
