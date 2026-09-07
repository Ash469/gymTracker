import React from 'react';

export default function SummaryPage({ summary, onTrainAnother, onRetry }) {
  if (!summary) return null;

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="claude-card rounded-xl p-8 text-center space-y-2 border border-zinc-200">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded">
          Session Complete
        </span>
        <h2 className="font-serif-claude text-3xl font-normal text-zinc-900">{summary.name} Summary</h2>
        <p className="text-zinc-500 text-xs">
          Biomechanical execution report and calorie metrics.
        </p>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="claude-card rounded-xl p-4 text-center space-y-1 border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">REPETITIONS</span>
          <span className="text-3xl font-mono font-bold text-zinc-900">{summary.reps}</span>
        </div>

        <div className="claude-card rounded-xl p-4 text-center space-y-1 border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">DURATION</span>
          <span className="text-3xl font-mono font-bold text-zinc-900">{formatTime(summary.duration_seconds || 0)}</span>
        </div>

        <div className="claude-card rounded-xl p-4 text-center space-y-1 border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">CALORIES</span>
          <span className="text-3xl font-mono font-bold text-zinc-900">{summary.calories_burned || 0} <span className="text-xs text-zinc-400 font-sans">kcal</span></span>
        </div>

        <div className="claude-card rounded-xl p-4 text-center space-y-1 border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">FORM SCORE</span>
          <span className="text-3xl font-mono font-bold text-zinc-900">{summary.form_score}%</span>
        </div>
      </div>

      {/* Target Muscles & Rep Execution Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="claude-card rounded-xl p-5 space-y-3 border border-zinc-200">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Target Muscles
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {summary.target_muscles && summary.target_muscles.map((m, idx) => (
              <span key={idx} className="bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-1 rounded font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="claude-card rounded-xl p-5 space-y-3 border border-zinc-200">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Rep Execution Log
          </h3>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {summary.rep_history && summary.rep_history.length > 0 ? (
              summary.rep_history.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-50 p-2 rounded border border-zinc-200 font-mono">
                  <span>Rep #{r.rep}</span>
                  <span className="text-emerald-700 font-semibold">{r.quality} Form</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400">No reps logged in this set.</p>
            )}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-800 font-semibold text-xs hover:bg-zinc-50 transition-colors"
        >
          Re-try exercise
        </button>

        <button
          onClick={onTrainAnother}
          className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-sm"
        >
          Select another exercise →
        </button>
      </div>
    </div>
  );
}
