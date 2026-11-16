import React, { useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';
import { ConnectionStatus } from '../services/websocket';
import AngleGauge from '../components/AngleGauge';
import PostureAlert from '../components/PostureAlert';
import StopConfirmModal from '../components/StopConfirmModal';
import { Activity, Camera, RefreshCw, CheckCircle2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export default function TrackerPage({ exercise, onFinishWorkout, onSwitchExercise }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    videoRef,
    canvasRef,
    cameraActive,
    connectionStatus,
    telemetry,
    resetCounter,
    requestSummary
  } = usePoseTracker(exercise?.id);

  const handleFinishSetConfirm = () => {
    setShowConfirmModal(false);
    requestSummary((summaryData) => {
      onFinishWorkout(summaryData);
    });
  };

  const isWarning = Boolean(telemetry.form_warning);
  const stage = (telemetry.stage || '').toUpperCase();
  const feedback = telemetry.feedback || 'GET IN POSITION';

  // Helper to derive directional icon & badge style for Camera HUD overlay
  const getDirectionBadge = () => {
    if (feedback.includes('GREAT') || feedback.includes('PERFECT')) {
      return {
        icon: <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />,
        color: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
        label: feedback
      };
    }
    if (stage === 'DOWN' || feedback.includes('PRESS') || feedback.includes('UP')) {
      return {
        icon: <ArrowUp className="w-5 h-5 text-emerald-400 animate-bounce" />,
        color: 'bg-zinc-900/90 text-white border-emerald-500/50',
        label: feedback
      };
    }
    if (stage === 'UP' || feedback.includes('LOWER') || feedback.includes('DOWN')) {
      return {
        icon: <ArrowDown className="w-5 h-5 text-amber-400 animate-bounce" />,
        color: 'bg-zinc-900/90 text-white border-amber-500/50',
        label: feedback
      };
    }
    return {
      icon: <Activity className="w-5 h-5 text-sky-400" />,
      color: 'bg-zinc-900/90 text-zinc-100 border-zinc-700/50',
      label: feedback
    };
  };

  const directionBadge = getDirectionBadge();

  return (
    <div className="space-y-5 pb-16 pt-2">
      {/* Hidden background video element for getUserMedia camera stream */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Top Header & Action Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-900 text-white shadow-sm">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                {exercise ? exercise.name : 'Exercise Pose Tracker'}
              </h2>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {exercise?.category || 'General'}
              </span>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2 mt-0.5">
              {connectionStatus === ConnectionStatus.CONNECTED ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-Time AI Engine Connected
                </span>
              ) : connectionStatus === ConnectionStatus.CONNECTING ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Connecting ML Engine...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Reconnecting...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={onSwitchExercise}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 border border-zinc-200 px-3.5 py-2 rounded-xl bg-white shadow-sm transition-all hover:bg-zinc-50"
          >
            Switch Exercise
          </button>

          <button
            onClick={resetCounter}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 border border-zinc-200 px-3.5 py-2 rounded-xl bg-white shadow-sm transition-all hover:bg-zinc-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Finish Set →
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (2-Column Grid: Camera Container on Left, Telemetry Stats on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE: Camera Container with Embedded In-View Direction Cues & Posture Warning */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-[4/3] w-full border border-zinc-800 shadow-2xl flex items-center justify-center group">
            
            {/* Real-Time Mirrored HTML5 Canvas displaying Camera Feed + Skeleton Mesh */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />

            {/* 1. TOP HUD BAR (Live Tracking & Angle Display over Camera) */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
              <div className="bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-2 text-white shadow-lg">
                <span className={`w-2.5 h-2.5 rounded-full ${telemetry.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {telemetry.active ? 'LIVE POSE TRACKING' : 'GET IN POSITION'}
                </span>
              </div>

              <div className="bg-zinc-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-700/60 text-emerald-400 font-mono text-xs font-bold shadow-lg">
                ANGLE: {telemetry.angle}°
              </div>
            </div>

            {/* 2. IN-CAMERA DIRECTION & CUE BANNER (Floating at Top-Center of Camera View) */}
            <div className="absolute top-16 left-4 right-4 z-20 pointer-events-none flex justify-center">
              <div className={`backdrop-blur-md px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-3 transition-all duration-300 pointer-events-auto max-w-md w-full justify-center ${directionBadge.color}`}>
                {directionBadge.icon}
                <span className="text-xs font-extrabold uppercase tracking-wide text-center">
                  {directionBadge.label}
                </span>
              </div>
            </div>

            {/* Loading Overlay if Camera initialization is in progress */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-white p-6 text-center space-y-3 z-30">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
                  <Camera className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold">Accessing Camera Stream...</p>
                  <p className="text-xs text-zinc-400 mt-1">Please allow webcam access when prompted by browser.</p>
                </div>
              </div>
            )}

            {/* 3. POSTURE WARNING POPUP (Anchored over bottom of Camera View) */}
            <PostureAlert warning={telemetry.form_warning} />
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-500 px-1">
            <span>Look directly at the camera HUD for real-time directional cues (Up, Down, Hold).</span>
            <span className="font-mono text-[11px] text-zinc-700 font-semibold bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
              FPS: 60 | WS Latency: &lt;15ms
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Telemetry, Reps, Accuracy, Stage & Angle Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          {/* Big Repetitions Counter Card */}
          <div className="claude-card rounded-2xl p-6 text-center border border-zinc-200/90 bg-white shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">
              REPETITIONS COUNTED
            </span>
            
            <div className="text-7xl font-mono font-extrabold text-zinc-900 tracking-tight my-1">
              {telemetry.reps}
            </div>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AUTO LOGGED REPS
            </span>
          </div>

          {/* Grid: Movement Stage & Form Accuracy Score */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Current Movement Stage Badge */}
            <div className="claude-card rounded-2xl p-4 border border-zinc-200/90 bg-white shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                STAGE
              </span>
              <div className="text-xl font-mono font-bold text-emerald-600 truncate">
                {telemetry.stage}
              </div>
            </div>

            {/* Form Accuracy % Score */}
            <div className="claude-card rounded-2xl p-4 border border-zinc-200/90 bg-white shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                FORM ACCURACY
              </span>
              <div className="text-xl font-mono font-bold text-zinc-900">
                {telemetry.form_score}%
              </div>
            </div>
          </div>

          {/* Form Guidance Status Box */}
          <div className={`claude-card rounded-2xl p-4 border transition-colors ${
            isWarning
              ? 'border-rose-300 bg-rose-50/60 text-rose-900'
              : 'border-amber-200/80 bg-amber-50/50 text-amber-900'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
              Form Guidance Status
            </span>
            <p className="text-xs font-bold mt-1 min-h-[36px] flex items-center">
              {telemetry.form_warning || telemetry.feedback || 'Stand in starting position'}
            </p>
          </div>

          {/* Joint Angle Telemetry Gauge */}
          <div className="claude-card rounded-2xl p-5 border border-zinc-200/90 bg-white shadow-sm">
            <AngleGauge angle={telemetry.angle} />
          </div>
        </div>

      </div>

      {/* Stop & Save Confirmation Modal */}
      <StopConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinishSetConfirm}
      />
    </div>
  );
}
