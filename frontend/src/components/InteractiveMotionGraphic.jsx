import React, { useState, useEffect, useRef } from 'react';
import { Sliders, CheckCircle2, AlertTriangle, Sparkles, Play, RefreshCw, Zap, User, Gauge, Eye, ShieldAlert } from 'lucide-react';
import MotionReveal from './MotionReveal';

export default function InteractiveMotionGraphic({ onLaunchTracker }) {
  const [selectedPreset, setSelectedPreset] = useState('squat');
  const [jointAngle, setJointAngle] = useState(88);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5); // 0.25x, 0.5x, 1.0x
  const videoRef = useRef(null);

  // Exercise presets configuration with real human athlete videos & specific warnings
  const presets = {
    squat: {
      name: "Real Human Barbell Squat",
      targetMin: 85,
      targetMax: 105,
      jointName: "Knee Flexion Angle",
      muscle: "Quadriceps & Gluteus Maximus",
      description: "Real human motion tracking parallel hip depth and knee flexion in slow motion.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fitness-man-doing-squats-41584-large.mp4",
      getPostureStatus: (angle) => {
        if (angle < 78) {
          return {
            label: "EXCESSIVE DEPTH (LUMBAR STRESS)",
            warning: "WARNING: Knee flexion exceeded 78°! Spinal rounding & knee joint strain detected.",
            color: "text-[#ff5500]",
            bgColor: "bg-[#ff5500]/20 border-[#ff5500]/50 text-[#ff5500]",
            status: "warning"
          };
        }
        if (angle <= 105) {
          return {
            label: "OPTIMAL PARALLEL DEPTH (100% FORM)",
            warning: "PERFECT FORM: Parallel hip-to-knee alignment maintained.",
            color: "text-[#059669]",
            bgColor: "bg-emerald-950/90 border-emerald-500/50 text-emerald-300",
            status: "perfect"
          };
        }
        return {
          label: "SHALLOW SQUAT (PARALLEL NEEDED)",
          warning: "ATTENTION: Squat depth above parallel. Lower hips 15° further for full glute activation.",
          color: "text-[#b45309]",
          bgColor: "bg-amber-950/90 border-amber-500/50 text-amber-300",
          status: "shallow"
        };
      }
    },
    bicep: {
      name: "Real Human Bicep Curl",
      targetMin: 40,
      targetMax: 155,
      jointName: "Elbow Flexion Angle",
      muscle: "Biceps Brachii & Brachialis",
      description: "Measures full arm flexion from peak contraction to bottom extension.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-training-with-dumbbells-in-a-gym-41580-large.mp4",
      getPostureStatus: (angle) => {
        if (angle <= 50) {
          return {
            label: "PEAK BICEP CONTRACTION",
            warning: "PERFECT FORM: Full peak contraction achieved at top of curl.",
            color: "text-[#059669]",
            bgColor: "bg-emerald-950/90 border-emerald-500/50 text-emerald-300",
            status: "perfect"
          };
        }
        if (angle >= 150) {
          return {
            label: "FULL ELBOW EXTENSION",
            warning: "PERFECT FORM: Full lockout extension. Control descent velocity.",
            color: "text-[#059669]",
            bgColor: "bg-emerald-950/90 border-emerald-500/50 text-emerald-300",
            status: "perfect"
          };
        }
        return {
          label: "MID-RANGE FLEXION",
          warning: "MOTION ACTIVE: Keep elbow pinned near torso to isolate bicep peak.",
          color: "text-[#ff5500]",
          bgColor: "bg-[#2c2825]/95 border-[#44403c] text-white",
          status: "motion"
        };
      }
    },
    pushup: {
      name: "Real Human Push-Up",
      targetMin: 45,
      targetMax: 75,
      jointName: "Elbow Flare Angle",
      muscle: "Pectoralis Major & Triceps",
      description: "Monitors upper body flexion to prevent shoulder impingement.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-doing-push-ups-in-a-gym-41582-large.mp4",
      getPostureStatus: (angle) => {
        if (angle > 80) {
          return {
            label: "FLARED ELBOWS (SHOULDER RISK)",
            warning: "WARNING: Elbow flare > 80°! Tuck elbows to 45° to protect shoulders.",
            color: "text-[#ff5500]",
            bgColor: "bg-[#ff5500]/20 border-[#ff5500]/50 text-[#ff5500]",
            status: "warning"
          };
        }
        if (angle >= 45 && angle <= 75) {
          return {
            label: "OPTIMAL 45° ELBOW FLARE",
            warning: "PERFECT FORM: Safe 45° elbow angle relative to torso.",
            color: "text-[#059669]",
            bgColor: "bg-emerald-950/90 border-emerald-500/50 text-emerald-300",
            status: "perfect"
          };
        }
        return {
          label: "TUCKED ELBOW POSITION",
          warning: "ATTENTION: Elbows tucked closely. Focus on tricep extension.",
          color: "text-[#b45309]",
          bgColor: "bg-amber-950/90 border-amber-500/50 text-amber-300",
          status: "tucked"
        };
      }
    }
  };

  const current = presets[selectedPreset];

  // Auto-play slow-motion animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let direction = 1;
    const intervalMs = Math.round(50 / playbackSpeed);
    const interval = setInterval(() => {
      setJointAngle(prev => {
        if (prev >= 160) direction = -1;
        if (prev <= 42) direction = 1;
        return prev + direction * 3;
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Adjust HTML5 Video playback rate when speed state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, selectedPreset]);

  const postureInfo = current.getPostureStatus(jointAngle);

  return (
    <section className="py-10 border-b border-[#e6e2dc] bg-[#faf8f5]">
      <MotionReveal>
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#f6eee9] border border-[#e6d4c9] px-3.5 py-1 rounded-full text-[#c86343] text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
              <User className="w-3.5 h-3.5 text-[#ff5500]" />
              Real Human Body Motion Simulator
            </div>

            <h2 className="font-serif-claude text-3xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
              Test Real Human Body Motion
            </h2>

            <p className="text-[#78716c] text-xs sm:text-sm leading-relaxed">
              Watch real human exercise motion in slow motion with live posture warning overlay cards floating directly over the video container.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="claude-card rounded-2xl p-5 space-y-5 border border-[#e6e2dc] bg-white shadow-2xs">
                {/* Movement Preset Selector */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716c] block mb-2">
                    Select Human Movement
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#faf8f5] rounded-xl border border-[#e6e2dc]">
                    {Object.keys(presets).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedPreset(key);
                          setIsPlaying(false);
                          setJointAngle(key === 'squat' ? 88 : key === 'bicep' ? 60 : 55);
                        }}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all capitalize ${
                          selectedPreset === key
                            ? 'bg-[#1c1917] text-white shadow-2xs'
                            : 'text-[#78716c] hover:text-[#1c1917] hover:bg-white'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slow-Motion Controls */}
                <div className="space-y-2 pt-2 border-t border-[#e6e2dc]">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716c] flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#ff5500]" />
                    Slow-Motion Video Speed
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { speed: 0.25, label: "0.25x Super Slow" },
                      { speed: 0.5, label: "0.5x Slow-Mo" },
                      { speed: 1.0, label: "1.0x Realtime" }
                    ].map(item => (
                      <button
                        key={item.speed}
                        onClick={() => setPlaybackSpeed(item.speed)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                          playbackSpeed === item.speed
                            ? 'bg-[#ff5500] text-white border-[#ff5500]'
                            : 'bg-white text-[#78716c] border-[#e6e2dc] hover:bg-[#faf8f5]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angle Range Slider */}
                <div className="space-y-3 pt-2 border-t border-[#e6e2dc]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-[#1c1917] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#ff5500]" />
                      {current.jointName}
                    </span>
                    <span className="font-mono font-bold text-[#ff5500] text-sm">{Math.round(jointAngle)}°</span>
                  </div>

                  <input
                    type="range"
                    min="30"
                    max="170"
                    value={jointAngle}
                    onChange={(e) => {
                      setJointAngle(Number(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full h-2 bg-[#e6e2dc] rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-[#a8a29e]">
                    <span>30° (Maximum Flex)</span>
                    <span>90° (Mid Angle)</span>
                    <span>170° (Extension)</span>
                  </div>
                </div>

                {/* Play/Pause Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-xl border border-[#e6e2dc] text-xs font-semibold text-[#1c1917] hover:bg-[#faf8f5] flex items-center gap-2 smooth-press shadow-2xs"
                  >
                    {isPlaying ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Pause Motion
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-[#ff5500]" />
                        Play Slow-Mo Video
                      </>
                    )}
                  </button>

                  <span className="text-[10px] font-mono text-[#78716c]">
                    Target: {current.targetMin}° – {current.targetMax}°
                  </span>
                </div>
              </div>

              {/* Status Box */}
              <div className="claude-card rounded-2xl p-4 border border-[#e6e2dc] bg-white flex items-center gap-3.5 shadow-2xs">
                <div className={`p-3 rounded-xl ${postureInfo.status === 'perfect' ? 'bg-emerald-50 text-[#059669]' : 'bg-amber-50 text-[#ff5500]'}`}>
                  {postureInfo.status === 'perfect' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#ff5500]" />
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#78716c] block">
                    BIOMECHANICAL POSTURE FEEDBACK
                  </span>
                  <div className={`text-xs font-mono font-bold ${postureInfo.color}`}>
                    {postureInfo.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Real Human Video Container + Floating Posture Warning Overlay Cards */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl dark-mesh-bg border border-[#2c2825] p-5 shadow-2xl space-y-4 overflow-hidden">
                
                {/* 1. HUD Header Bar over Video Container */}
                <div className="flex justify-between items-center z-20 relative border-b border-[#2c2825] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white text-xs font-mono font-bold uppercase tracking-wider">
                      REAL HUMAN MOTION CONTAINER
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#2c2825] px-2.5 py-1 rounded-lg border border-[#44403c] text-white font-mono text-[10px] font-bold">
                      {playbackSpeed}x SLOW-MO
                    </div>
                    <div className="bg-[#2c2825] px-3 py-1 rounded-lg border border-[#44403c] text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{Math.round(jointAngle)}°</span>
                    </div>
                  </div>
                </div>

                {/* 2. Real Human Athlete Video Viewport Container */}
                <div className="relative h-72 w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black border border-[#44403c]">
                  
                  {/* REAL HUMAN ATHLETE VIDEO */}
                  <video
                    ref={videoRef}
                    src={current.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />

                  {/* 3. DYNAMIC POSTURE WARNING OVERLAY CARD FLOATING DIRECTLY ON VIDEO CONTAINER */}
                  <div className="absolute bottom-3 left-3 right-3 z-30 transition-all duration-300">
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3.5 ${postureInfo.bgColor}`}>
                      <div className="p-2 rounded-xl bg-black/60 mt-0.5 shadow-md">
                        {postureInfo.status === 'warning' ? (
                          <ShieldAlert className="w-5 h-5 text-[#ff5500] animate-bounce" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/80">
                            REALTIME POSTURE GUARDRAIL ALERT
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 text-white">
                            ANGLE: {Math.round(jointAngle)}°
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-mono font-bold leading-snug">
                          {postureInfo.warning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. FLOATING TOP-LEFT COACHING OVERLAY BADGE */}
                  <div className="absolute top-3 left-3 z-30 bg-[#2c2825]/90 backdrop-blur-md border border-[#44403c] px-3.5 py-1.5 rounded-xl text-white text-[10px] font-mono shadow-lg flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>REAL HUMAN {playbackSpeed}x SLOW-MO</span>
                  </div>
                </div>

                {/* Bottom Action Footer inside Dark Container */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[#2c2825] relative z-20">
                  <div className="text-white text-xs font-mono">
                    <span className="text-[#a8a29e]">Demonstration: </span>
                    <span className="font-bold text-white">{current.name}</span>
                  </div>

                  <button
                    onClick={onLaunchTracker}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold text-xs smooth-press flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,85,0,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Launch Live Camera Vision
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
