import React from 'react';

export default function TutorialPage({ exercise, onStartWorkout, onBack }) {
  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-medium">Loading exercise guide...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header & Start Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
        <button
          onClick={onBack}
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          ← Back to catalog
        </button>

        <button
          onClick={onStartWorkout}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-sm transition-all"
        >
          Start tracking session →
        </button>
      </div>

      {/* Exercise Title */}
      <div className="space-y-1">
        <h2 className="font-serif-claude text-3xl font-semibold text-zinc-900">{exercise.name}</h2>
      </div>

      {/* Reference Image */}
      {exercise.demo_gif && (
        <div className="rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200 max-w-xl mx-auto flex items-center justify-center p-4">
          <img
            src={exercise.demo_gif}
            alt={exercise.name}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Target Muscles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Target Muscles</h3>
        <p className="text-sm text-zinc-700 font-medium">
          {Array.isArray(exercise.target_muscles) ? exercise.target_muscles.join(', ') : exercise.target_muscles}
        </p>
      </div>

      {/* How to Perform */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">How to Perform</h3>
        <ol className="space-y-2.5 text-sm text-zinc-800 list-decimal list-inside leading-relaxed bg-zinc-50 p-5 rounded-xl border border-zinc-200/80">
          {exercise.how_to_perform && exercise.how_to_perform.map((step, idx) => (
            <li key={idx} className="pl-1">
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Common Mistakes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Common Mistakes</h3>
        <ul className="space-y-2 text-sm text-zinc-800 list-disc list-inside leading-relaxed bg-amber-50/50 p-5 rounded-xl border border-amber-200/60">
          {exercise.common_mistakes && exercise.common_mistakes.map((mistake, idx) => (
            <li key={idx} className="pl-1">
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
