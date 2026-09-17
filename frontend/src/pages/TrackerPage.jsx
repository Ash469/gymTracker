import React, { useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';
import { ConnectionStatus } from '../services/websocket';
import AngleGauge from '../components/AngleGauge';
import PostureAlert from '../components/PostureAlert';
import StopConfirmModal from '../components/StopConfirmModal';
import { Activity, Camera, RefreshCw, CheckCircle2, ArrowUp, ArrowDown, Sparkles, Zap } from 'lucide-react';

export default function TrackerPage({ exercise, onFinishWorkout, onSwitchExercise }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [weight, setWeight] = useState(10); // default 10 kg load

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
      const repsCount = summaryData?.reps ?? telemetry.reps ?? 0;
      const durationSecs = summaryData?.duration_seconds ?? 30;
      const calcCalories = Math.max(
        1,
        Math.round(repsCount * (0.25 + weight / 12) + durationSecs * 0.05)
      );

      onFinishWorkout({
        ...summaryData,
        weight: parseFloat(weight) || 0,
        calories_burned: calcCalories,
      });
    });
  };

  const isWarning = Boolean(telemetry.form_warning);
  const stage = (telemetry.stage || '').toUpperCase();
  const feedback = telemetry.feedback || 'GET IN POSITION';

  const getDirectionBadge = () => {
    if (feedback.includes('GREAT') || feedback.includes('PERFECT')) {
      return {
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />,
        color: 'bg-[#1c1917]/95 text-emerald-300 border-[#059669]',
        label: feedback
      };
    }
    if (stage === 'DOWN' || feedback.includes('PRESS') || feedback.includes('UP')) {
      return {
        icon: <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />,
        color: 'bg-[#1c1917]/95 text-white border-[#44403c]',
        label: feedback
      };
    }
    if (stage === 'UP' || feedback.includes('LOWER') || feedback.includes('DOWN')) {
      return {
        icon: <ArrowDown className="w-3.5 h-3.5 text-[#da7756] animate-bounce" />,
        color: 'bg-[#1c1917]/95 text-white border-[#44403c]',
        label: feedback
      };
    }
    return {
      icon: <Activity className="w-3.5 h-3.5 text-sky-400" />,
      color: 'bg-[#1c1917]/95 text-zinc-100 border-[#44403c]',
      label: feedback
    };
  };

  const directionBadge = getDirectionBadge();

  return (
    <div className="space-y-4 pb-12 pt-1">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      <div className="flex flex-row justify-between items-center gap-2 pb-3 border-b border-[#e6e2dc]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-[#1c1917] text-white shrink-0">
            <Zap className="w-4 h-4 text-[#da7756]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#1c1917] tracking-tight truncate">
                {exercise ? exercise.name : 'Pose Tracker'}
              </h1>
              <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f6eee9] text-[#c86343] border border-[#e6d4c9]">
                {exercise?.category || 'General'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              {connectionStatus === ConnectionStatus.CONNECTED ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  AI Vision Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#d97706]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-ping" />
                  Connecting ML...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetCounter}
            className="flex items-center gap-1 text-xs font-semibold text-[#1c1917] border border-[#e6e2dc] px-3 py-1.5 rounded-xl bg-white transition-all smooth-press hover:bg-[#faf8f5]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#78716c]" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1c1917] hover:bg-[#2c2825] px-3.5 py-1.5 rounded-xl transition-all smooth-press"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#da7756]" />
            Finish Set
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        <div className="lg:col-span-7 xl:col-span-8 space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-[#1c1917] border border-[#2c2825] shadow-lg flex items-center justify-center aspect-[4/3] w-full max-h-[72vh] group">
            
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain bg-[#1c1917]"
            />

            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20 pointer-events-none">
              <div className="bg-[#1c1917]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#44403c] flex items-center gap-1.5 text-white shadow-sm">
                <span className={`w-2 h-2 rounded-full ${telemetry.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {telemetry.active ? 'LIVE TRACKING' : 'GET IN POSITION'}
                </span>
              </div>

              <div className="bg-[#1c1917]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#44403c] text-emerald-400 font-mono text-xs font-bold shadow-sm">
                {telemetry.angle}° ANGLE
              </div>
            </div>

            <div className="absolute top-12 left-3 right-3 z-20 pointer-events-none flex justify-center">
              <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-md flex items-center gap-2 transition-all duration-300 pointer-events-auto max-w-sm w-full justify-center ${directionBadge.color}`}>
                {directionBadge.icon}
                <span className="text-[11px] font-bold uppercase tracking-wider text-center">
                  {directionBadge.label}
                </span>
              </div>
            </div>

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1917]/95 text-white p-4 text-center space-y-2 z-30">
                <div className="p-2.5 rounded-xl bg-[#2c2825] border border-[#44403c]">
                  <Camera className="w-6 h-6 text-[#da7756] animate-pulse" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">Accessing Camera Stream...</p>
                  <p className="text-[11px] text-[#a8a29e] mt-0.5">Please allow webcam access when prompted by browser.</p>
                </div>
              </div>
            )}

            <PostureAlert warning={telemetry.form_warning} />
          </div>

          <div className="hidden sm:flex justify-between items-center text-[11px] text-[#78716c] px-1">
            <span>Stand back so full body is visible inside camera frame.</span>
            <span className="font-mono text-[10px] text-[#1c1917] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-[#e6e2dc]">
              33 Keypoints | 60 FPS High Precision WASM
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          
          <div className="claude-card rounded-xl p-3 sm:p-4 border border-[#e6e2dc] bg-white shadow-2xs space-y-3">
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#faf8f5] border border-[#e6e2dc] p-2.5 rounded-xl text-center space-y-0.5">
                <span className="text-[8px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">
                  REPS
                </span>
                <div className="text-3xl font-mono font-bold text-[#1c1917]">
                  {telemetry.reps}
                </div>
              </div>

              <div className="bg-[#faf8f5] border border-[#e6e2dc] p-2.5 rounded-xl text-center space-y-0.5">
                <span className="text-[8px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">
                  STAGE
                </span>
                <div className="text-sm font-mono font-bold text-[#059669] truncate pt-1">
                  {telemetry.stage}
                </div>
              </div>

              <div className="bg-[#faf8f5] border border-[#e6e2dc] p-2.5 rounded-xl text-center space-y-0.5">
                <span className="text-[8px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">
                  FORM
                </span>
                <div className="text-base font-mono font-bold text-[#1c1917] pt-0.5">
                  {telemetry.form_score}%
                </div>
              </div>
            </div>

            {/* Load Weight Selector */}
            <div className="bg-[#faf8f5] border border-[#e6e2dc] p-2.5 rounded-xl text-center space-y-1 mt-1">
              <span className="text-[9px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">
                EXERCISE LOAD WEIGHT (KG)
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#e6e2dc] text-sm font-bold text-[#1c1917] hover:bg-[#f0ece6] transition-colors flex items-center justify-center shadow-2xs"
                >
                  -
                </button>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-[#e6e2dc]">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-14 text-center text-base font-mono font-bold text-[#1c1917] bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#78716c]">kg</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWeight((w) => w + 2.5)}
                  className="w-7 h-7 rounded-lg bg-white border border-[#e6e2dc] text-sm font-bold text-[#1c1917] hover:bg-[#f0ece6] transition-colors flex items-center justify-center shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className={`rounded-lg p-2.5 border text-xs font-semibold ${
              isWarning
                ? 'border-[#ffe4e6] bg-[#ffe4e6]/50 text-[#e11d48]'
                : 'border-[#f6eee9] bg-[#f6eee9]/60 text-[#c86343]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-75">Guidance</span>
                <span className="text-[10px] font-mono font-bold">{telemetry.angle}° Angle</span>
              </div>
              <p className="mt-0.5 text-xs font-bold truncate">
                {telemetry.form_warning || telemetry.feedback || 'Stand in starting position'}
              </p>
            </div>

            {/* Advanced Biomechanical Posture Analysis Panel */}
            <div className="bg-[#FAF7F2] border border-[#E6E0D8] p-3 rounded-xl space-y-2">
              <div className="text-[9px] font-bold text-[#8c827a] uppercase tracking-wider flex justify-between items-center">
                <span>Biomechanical Posture Analysis</span>
                <span className="text-[#059669] font-mono text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  3D Vision
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-[#E6E0D8]">
                  <span className="text-[9px] text-[#78716c] block font-medium">Back Posture</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${telemetry.back_posture === 'Warning' ? 'bg-red-500 animate-pulse' : 'bg-[#059669]'}`} />
                    <span className="font-bold text-[#171513] text-xs">
                      {telemetry.back_posture || 'Straight'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#E6E0D8]">
                  <span className="text-[9px] text-[#78716c] block font-medium">Symmetry Balance</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                    <span className="font-bold text-[#171513] text-xs">
                      {telemetry.symmetry_score ? `${telemetry.symmetry_score}%` : '98% Balanced'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <AngleGauge angle={telemetry.angle} />

            <div className="flex gap-2 pt-1 lg:hidden">
              <button
                onClick={onSwitchExercise}
                className="flex-1 py-2 rounded-lg border border-[#e6e2dc] text-xs font-bold text-[#78716c] hover:text-[#1c1917] bg-white transition-all smooth-press"
              >
                Switch Exercise
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-2 rounded-lg bg-[#1c1917] text-xs font-bold text-white transition-all smooth-press"
              >
                Finish Set →
              </button>
            </div>

          </div>

        </div>

      </div>

      <StopConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinishSetConfirm}
      />
    </div>
  );
}


