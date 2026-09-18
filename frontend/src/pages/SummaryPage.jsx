import React from 'react';
import { Award, Clock, Flame, ShieldCheck, RefreshCw, ArrowRight, Activity, Dumbbell, Sparkles } from 'lucide-react';

export default function SummaryPage({ summary, aiCoaching, onTrainAnother, onRetry }) {
  if (!summary) return null;

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="claude-card rounded-2xl p-8 text-center space-y-3 border border-zinc-200/90 bg-white shadow-2xs">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <Award className="w-3.5 h-3.5 text-amber-700" />
          Session Complete
        </div>
        <h1 className="font-serif-claude text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          {summary.name} Summary Report
        </h1>
        <p className="text-zinc-600 text-xs sm:text-sm max-w-md mx-auto">
          Biomechanical rep execution analysis, form accuracy metrics, and calorie burn.
        </p>
      </div>

      {/* 5 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="claude-card rounded-2xl p-4 text-center space-y-1 border border-zinc-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">REPS</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900">{summary.reps}</div>
        </div>

        <div className="claude-card rounded-2xl p-4 text-center space-y-1 border border-zinc-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <Dumbbell className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">LOAD</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900">
            {summary.weight || 0} <span className="text-xs text-zinc-400 font-sans font-medium">kg</span>
          </div>
        </div>

        <div className="claude-card rounded-2xl p-4 text-center space-y-1 border border-zinc-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">TIME</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900">{formatTime(summary.duration_seconds || 0)}</div>
        </div>

        <div className="claude-card rounded-2xl p-4 text-center space-y-1 border border-zinc-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">CALORIES</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900">
            {summary.calories_burned || 0} <span className="text-xs text-zinc-400 font-sans font-medium">kcal</span>
          </div>
        </div>

        <div className="claude-card rounded-2xl p-4 text-center space-y-1 border border-zinc-200/90 bg-white shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center gap-1 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">ACCURACY</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700">{summary.form_score}%</div>
        </div>
      </div>

      {/* Target Muscles & Rep Execution Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="claude-card rounded-2xl p-6 space-y-3.5 border border-zinc-200/90 bg-white shadow-2xs">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-zinc-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Target Muscle Groups
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.target_muscles && summary.target_muscles.map((m, idx) => (
              <span key={idx} className="bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs px-3 py-1 rounded-xl font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="claude-card rounded-2xl p-6 space-y-3.5 border border-zinc-200/90 bg-white shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Rep Execution Log
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
            {summary.rep_history && summary.rep_history.length > 0 ? (
              summary.rep_history.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 font-mono">
                  <span className="font-bold text-zinc-800">Rep #{r.rep}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px]">
                    {r.quality} Form
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-2">No individual reps logged in this session.</p>
            )}
          </div>
        </div>
      </div>

      {/* Amazon Bedrock AI Coaching Insights Box */}
      {aiCoaching && (
        <div className="claude-card rounded-2xl p-6 space-y-5 border border-[#e6d4c9] bg-[#fdfaf7] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#E87552]">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="font-serif-claude text-lg font-bold text-[#171513]">
                AWS Bedrock AI Coach Insights
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f6eee9] text-[#E87552] border border-[#e6d4c9]">
              Claude 3 AI Analysis
            </span>
          </div>

          <p className="text-xs text-[#57534e] leading-relaxed bg-white p-3.5 rounded-xl border border-[#e6e2dc]">
            {aiCoaching.summary || 'Workout telemetry recorded and analyzed by Amazon Bedrock.'}
          </p>

          {/* Strengths & Areas to Improve Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {aiCoaching.strengths && aiCoaching.strengths.length > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  ✓ Execution Strengths
                </span>
                <ul className="space-y-1 text-emerald-900 text-[11px]">
                  {aiCoaching.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiCoaching.areasToImprove && aiCoaching.areasToImprove.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  ⚡ Technique Refinements
                </span>
                <ul className="space-y-1 text-amber-900 text-[11px]">
                  {aiCoaching.areasToImprove.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          {aiCoaching.recommendations && aiCoaching.recommendations.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c827a]">
                Actionable Cues For Your Next Set:
              </h4>
              <ul className="space-y-2 text-xs text-[#171513]">
                {aiCoaching.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#e6e2dc] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#E87552] mt-1.5 shrink-0" />
                    <div>
                      {typeof rec === 'object' && rec.exercise && (
                        <span className="font-bold text-[#E87552] mr-1.5 font-mono text-[11px]">
                          [{rec.exercise}]
                        </span>
                      )}
                      <span className="text-[#171513] text-xs">
                        {typeof rec === 'string' ? rec : rec.cue || JSON.stringify(rec)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-800 font-bold text-xs hover:bg-zinc-50 transition-all smooth-press flex items-center justify-center gap-2 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          Re-try exercise
        </button>

        <button
          onClick={onTrainAnother}
          className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-all smooth-press flex items-center justify-center gap-2 shadow-sm"
        >
          Select another exercise <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </div>
  );
}

