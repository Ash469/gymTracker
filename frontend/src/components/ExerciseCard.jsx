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
      className="rounded-2xl p-4 flex flex-col justify-between gap-4 cursor-pointer group border border-[#E6E0D8] bg-[#FAF7F2] hover:bg-white hover:border-[#D9D3CA] hover:shadow-md transition-all duration-200"
    >
      <div className="space-y-3">
        <div className="relative aspect-[16/10] w-full bg-white rounded-xl overflow-hidden border border-[#E6E0D8] flex items-center justify-center p-2">
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
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 border border-[#E6E0D8] px-2.5 py-0.5 rounded-full text-[#171513]">
              {exercise.category}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#171513] group-hover:text-[#E87552] transition-colors">
            {exercise.name}
          </h3>
          <p className="text-xs text-[#655f58] line-clamp-2 leading-relaxed font-normal">
            {exercise.how_to_perform?.[0] || exercise.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {exercise.target_muscles && exercise.target_muscles.map((m, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-[#FDF1EB] text-[#D95325] border border-[#F5DDD2] px-2.5 py-0.5 rounded-full font-bold"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#E6E0D8] flex justify-between items-center text-xs">
        <span className="text-[#655f58] font-mono text-[10px] flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-[#E87552]" />
          ~{estimatedKcal} kcal/min
        </span>
        <span className="font-bold text-[#171513] group-hover:translate-x-1 group-hover:text-[#E87552] transition-all duration-200 flex items-center gap-1 text-xs">
          Start guide <ArrowRight className="w-3.5 h-3.5 text-[#171513] group-hover:text-[#E87552]" />
        </span>
      </div>
    </div>
  );
}
