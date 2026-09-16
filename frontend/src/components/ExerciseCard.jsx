import React, { useState } from 'react';
import { ArrowRight, Flame } from 'lucide-react';

export default function ExerciseCard({ exercise, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const met = typeof exercise.met_value === 'number' && !isNaN(exercise.met_value) 
    ? exercise.met_value 
    : 3.8;
  
  const estimatedKcal = (met * 1.2).toFixed(1);

  return (
    <div
      onClick={() => onSelect(exercise.id)}
      className="claude-card claude-card-hover rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer group border border-[#e6e2dc] smooth-press bg-white"
    >
      <div className="space-y-3">
        <div className="relative aspect-[16/10] w-full bg-[#faf8f5] rounded-lg overflow-hidden border border-[#e6e2dc] flex items-center justify-center">
          {!imgError ? (
            <img
              src={exercise.demo_gif}
              alt={exercise.name}
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#78716c] font-medium">
              Exercise Preview
            </div>
          )}

          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-mono font-bold uppercase bg-white/95 border border-[#e6e2dc] px-2 py-0.5 rounded text-[#1c1917] shadow-2xs">
              {exercise.category}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#1c1917] group-hover:text-[#da7756] transition-colors">
            {exercise.name}
          </h3>
          <p className="text-xs text-[#78716c] line-clamp-2 leading-relaxed">
            {exercise.how_to_perform?.[0] || exercise.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {exercise.target_muscles && exercise.target_muscles.map((m, idx) => (
            <span
              key={idx}
              className="text-[9px] bg-[#f6eee9] text-[#c86343] border border-[#e6d4c9] px-2 py-0.5 rounded font-semibold"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#e6e2dc] flex justify-between items-center text-xs">
        <span className="text-[#78716c] font-mono text-[10px] flex items-center gap-1">
          <Flame className="w-3 h-3 text-[#da7756]" />
          ~{estimatedKcal} kcal/min
        </span>
        <span className="font-bold text-[#1c1917] group-hover:translate-x-1 group-hover:text-[#da7756] transition-all duration-200 flex items-center gap-1 text-xs">
          Start guide <ArrowRight className="w-3.5 h-3.5 text-[#78716c] group-hover:text-[#da7756]" />
        </span>
      </div>
    </div>
  );
}


