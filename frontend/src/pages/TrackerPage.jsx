import React, { useState } from 'react';
import AngleGauge from '../components/AngleGauge';
import PostureAlert from '../components/PostureAlert';
import StopConfirmModal from '../components/StopConfirmModal';
import ExerciseDemoVisual from '../components/ExerciseDemoVisual';

export default function TrackerPage({ exercise, telemetry, onReset, onFinishWorkout, onSwitchExercise }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(true);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <h2 className="text-xl font-semibold text-zinc-900">{exercise ? exercise.name : 'Posture Tracker'}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDemoGuide(!showDemoGuide)}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg bg-white shadow-sm transition-colors"
          >
            {showDemoGuide ? 'Hide visual guide' : 'Show visual guide'}
          </button>

          <button
            onClick={onSwitchExercise}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg bg-white shadow-sm transition-colors"
          >
            Switch exercise
          </button>

          <button
            onClick={onReset}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg bg-white shadow-sm transition-colors"
          >
            Reset
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-1.5 rounded-lg shadow-sm transition-all"
          >
            Finish set →
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Feed */}
        <div className={`${showDemoGuide ? 'lg:col-span-7' : 'lg:col-span-8'} space-y-3`}>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] w-full border border-zinc-300 shadow-md">
            <img src="/video_feed" alt="Live Pose Stream" className="w-full h-full object-cover" />
            <PostureAlert warning={telemetry.form_warning} />
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Position yourself in clear camera view. Tracking automatically detects joint angles.
          </p>
        </div>

        {/* Middle: Optional Visual Movement Guide */}
        {showDemoGuide && (
          <div className="lg:col-span-5 space-y-4">
            <ExerciseDemoVisual exercise={exercise} compact={true} showKeyPostures={true} />
            
            {/* Feedback Box */}
            <div className="claude-card rounded-xl p-4 border border-zinc-200 bg-amber-50/40">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Form Guidance
              </span>
              <p className="text-xs font-semibold text-zinc-800 mt-1 min-h-[32px] flex items-center">
                {telemetry.form_warning || telemetry.feedback}
              </p>
            </div>
          </div>
        )}

        {/* Telemetry Sidebar */}
        <div className={`${showDemoGuide ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4' : 'lg:col-span-4 space-y-4'}`}>
          {/* Big Rep Counter */}
          <div className="claude-card rounded-xl p-5 text-center space-y-1 border border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">REPETITIONS</span>
            <div className="text-6xl font-mono font-bold text-zinc-900 my-1">
              {telemetry.reps}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium block">AUTO LOGGED</span>
          </div>

          {/* Stage Card */}
          <div className="claude-card rounded-xl p-5 space-y-1 border border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">STAGE</span>
            <div className="text-2xl font-mono font-bold text-emerald-700 truncate">{telemetry.stage}</div>
          </div>

          {/* Form Score Card */}
          <div className="claude-card rounded-xl p-5 space-y-1 border border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">FORM ACCURACY</span>
            <div className="text-2xl font-mono font-bold text-zinc-900">{telemetry.form_score}%</div>
          </div>

          {/* Angle Telemetry Bar */}
          <div className="claude-card rounded-xl p-4 border border-zinc-200">
            <AngleGauge angle={telemetry.angle} />
          </div>
        </div>
      </div>

      <StopConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          onFinishWorkout();
        }}
      />
    </div>
  );
}
