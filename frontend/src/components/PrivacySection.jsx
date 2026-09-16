import React from 'react';
import { Lock, Cpu, Activity, ShieldCheck, CheckCircle, EyeOff } from 'lucide-react';
import MotionReveal from './MotionReveal';
import privacyDiagramImg from '../../assets/TvJ5z.jpg';

export default function PrivacySection() {
  const features = [
    {
      icon: <Lock className="w-5 h-5 text-[#da7756]" />,
      title: "100% On-Device Browser Processing",
      description: "Computer vision pose models run locally on your device hardware using MediaPipe Vision. No camera frames ever leave your browser."
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#059669]" />,
      title: "Zero Cloud Video Upload",
      description: "Complete privacy by design. No external video recording, cloud streaming, or third-party analytical tracking."
    },
    {
      icon: <Activity className="w-5 h-5 text-[#da7756]" />,
      title: "Biomechanical Joint Telemetry",
      description: "Real-time 3D joint angle telemetry measures movement flexion and extension to ensure optimal range of motion."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#059669]" />,
      title: "Real-Time Posture Guardrails",
      description: "Instant visual guardrail alerts highlight form errors like flared elbows, knee cave, or spinal flexion immediately."
    }
  ];

  return (
    <section id="privacy" className="py-10 border-b border-[#e6e2dc] bg-[#faf8f5] relative overflow-hidden">
      <MotionReveal>
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-[#f6eee9] border border-[#e6d4c9] text-[#c86343] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-[#da7756]" />
                Built For Privacy & Security
              </div>

              <h2 className="font-serif-claude text-2xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
                Built for privacy, speed, and precision.
              </h2>

              <p className="text-[#78716c] text-xs sm:text-sm leading-relaxed font-normal">
                FormFit AI pairs edge computer vision with biomechanical rules to ensure safe rep execution without compromising data privacy.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1917]">
                  <CheckCircle className="w-4 h-4 text-[#059669]" />
                  <span>MediaPipe WASM compiled directly inside your browser sandbox</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1917]">
                  <CheckCircle className="w-4 h-4 text-[#059669]" />
                  <span>Zero network requests made during active camera tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1917]">
                  <CheckCircle className="w-4 h-4 text-[#059669]" />
                  <span>Zero server logs, storage, or telemetry saved remotely</span>
                </div>
              </div>
            </div>

            {/* Right Column - Privacy Architecture Flow Diagram */}
            <div className="lg:col-span-6">
              <div className="claude-card rounded-3xl p-4 sm:p-6 border border-[#e6e2dc] bg-white shadow-md relative overflow-hidden space-y-4">
                <div className="flex justify-between items-center border-b border-[#e6e2dc] pb-3">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-[#da7756]" />
                    <span className="font-mono text-xs font-bold text-[#1c1917]">ISOLATED BROWSER NODE</span>
                  </div>
                  <span className="bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md">
                    100% SECURE
                  </span>
                </div>

                {/* Privacy Architecture Flow Diagram Image */}
                <div className="w-full flex items-center justify-center p-2">
                  <img 
                    src={privacyDiagramImg} 
                    alt="Privacy Architecture: Camera Stream -> Local Web Worker -> Canvas HUD" 
                    className="w-full h-auto object-contain rounded-2xl" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="claude-card claude-card-hover rounded-2xl p-5 border border-[#e6e2dc] bg-white space-y-2.5 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6e2dc] flex items-center justify-center shadow-2xs">
                  {feat.icon}
                </div>

                <h3 className="text-sm font-bold text-[#1c1917] tracking-tight">
                  {feat.title}
                </h3>

                <p className="text-xs text-[#78716c] leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
