import React from 'react';
import { Activity, ShieldAlert, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-emerald-700" />,
      title: "Biomechanical Joint Telemetry",
      description: "Continuously tracks joint angles (elbow, knee, shoulder, hip) in 3D space to ensure proper range of motion and execution technique."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-amber-700" />,
      title: "Real-Time Posture Guardrails",
      description: "Detects improper form in real time — such as flared elbows on bench press or valgus knee collapse on squats — and alerts you instantly."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-700" />,
      title: "Automatic Repetition Logging",
      description: "State-machine tracking identifies concentric and eccentric movement phases to log clean, completed reps without manual counting."
    },
    {
      icon: <Lock className="w-6 h-6 text-sky-700" />,
      title: "100% On-Device Browser Privacy",
      description: "All computer vision pose models run locally on your device hardware using MediaPipe Vision. No video frames are ever recorded or uploaded."
    }
  ];

  return (
    <section id="about" className="py-16 border-b border-zinc-200/80">
      <div className="space-y-10">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            AI Computer Vision Architecture
          </div>
          
          <h2 className="font-serif-claude text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Built for precision, speed, and privacy.
          </h2>

          <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
            FormFit AI pairs computer vision pose estimation with biomechanical rules engine to ensure every repetition counts safely and accurately.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="claude-card claude-card-hover rounded-2xl p-6 border border-zinc-200/90 bg-white space-y-3.5 shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                {feat.icon}
              </div>

              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                {feat.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
