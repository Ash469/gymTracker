import React from 'react';
import { ArrowLeft, Play, AlertCircle, CheckCircle2, Dumbbell } from 'lucide-react';

export default function TutorialPage({ exercise, onStartWorkout, onBack }) {
  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-semibold tracking-wide">Loading movement guide...</p>
      </div>
    );
  }

  const targetMusclesList = Array.isArray(exercise.target_muscles) 
    ? exercise.target_muscles 
    : (exercise.target_muscles ? exercise.target_muscles.split(', ') : []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Header & Start Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-2 smooth-press px-3 py-1.5 rounded-lg hover:bg-zinc-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalog
        </button>

        <button
          onClick={onStartWorkout}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all smooth-press flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          Start tracking session →
        </button>
      </div>

      {/* Exercise Title & Category Badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 bg-zinc-100 border border-zinc-200 px-3 py-0.5 rounded-full">
            {exercise.category}
          </span>
        </div>
        <h1 className="font-serif-claude text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          {exercise.name}
        </h1>
      </div>

      {/* Reference Image */}
      {exercise.demo_gif && (
        <div className="claude-card rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200 max-w-xl mx-auto flex items-center justify-center p-6 shadow-sm">
          <img
            src={exercise.demo_gif}
            alt={exercise.name}
            className="max-w-full max-h-80 object-contain rounded-xl"
          />
        </div>
      )}

      {/* Target Muscles */}
      <div className="claude-card rounded-2xl p-5 border border-zinc-200/90 space-y-3">
        <div className="flex items-center gap-2 text-zinc-900">
          <Dumbbell className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Target Muscle Groups</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetMusclesList.map((muscle, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl"
            >
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* How to Perform */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-900">
          <CheckCircle2 className="w-4 h-4 text-zinc-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider">How to Perform</h3>
        </div>
        
        <div className="space-y-3">
          {exercise.how_to_perform && exercise.how_to_perform.map((step, idx) => (
            <div
              key={idx}
              className="claude-card rounded-2xl p-4 border border-zinc-200/90 flex items-start gap-3.5 bg-white"
            >
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-medium">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      {exercise.common_mistakes && exercise.common_mistakes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Common Mistakes to Avoid</h3>
          </div>
          
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-2.5">
            {exercise.common_mistakes.map((mistake, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 font-medium">
                <span className="text-amber-700 font-bold shrink-0">•</span>
                <span>{mistake}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

