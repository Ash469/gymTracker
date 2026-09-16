import React from 'react';
import { Lock, Cpu, Activity, ShieldCheck, CheckCircle2, EyeOff } from 'lucide-react';
import MotionReveal from './MotionReveal';
import privacyDiagramImg from '../../assets/TvJ5z.jpg';

export default function PrivacySection() {
  const features = [
    {
      icon: <Lock className="w-5 h-5 text-[#E87552]" />,
      title: "100% On-Device Browser Processing",
      description: "Computer vision pose models run locally on your device hardware using MediaPipe Vision. No camera frames ever leave your browser."
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#059669]" />,
      title: "Zero Cloud Video Upload",
      description: "Complete privacy by design. No external video recording, cloud streaming, or third-party analytical tracking."
    },
    {
      icon: <Activity className="w-5 h-5 text-[#E87552]" />,
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
    <section id="privacy" className="py-16 border-b border-[#e6e0d8] bg-white relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        <MotionReveal>
          <div className="space-y-12">
            
            {/* Header & Flow Diagram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column Description */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF1EB] border border-[#F5DDD2] text-[#D95325] text-xs font-bold tracking-wide uppercase">
                  <span>✦</span>
                  <span>PRIVACY & SECURITY</span>
                </div>

                <h2 className="font-serif-claude text-3xl sm:text-4xl font-bold text-[#171513] tracking-tight leading-tight">
                  Built for privacy, speed, and precision.
                </h2>

                <p className="text-[#655f58] text-sm leading-relaxed font-normal">
                  FormFit AI pairs edge computer vision with biomechanical rules to ensure safe rep execution without compromising data privacy.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#171513]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>MediaPipe WASM compiled directly inside your browser sandbox</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#171513]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>Zero network requests made during active camera tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#171513]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>Zero server logs, storage, or telemetry saved remotely</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Privacy Architecture Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl p-5 sm:p-6 border border-[#E6E0D8] bg-[#FAF7F2] space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E6E0D8] pb-3">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-[#E87552]" />
                      <span className="font-mono text-xs font-bold text-[#171513]">ISOLATED BROWSER NODE</span>
                    </div>
                    <span className="bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                      100% SECURE
                    </span>
                  </div>

                  {/* Architecture Image */}
                  <div className="w-full flex items-center justify-center p-2">
                    <img 
                      src={privacyDiagramImg} 
                      alt="Privacy Architecture: Camera Stream -> Local Web Worker -> Canvas HUD" 
                      className="w-full h-auto object-contain rounded-xl border border-[#E6E0D8]" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 border border-[#E6E0D8] bg-[#FAF7F2] space-y-3 transition-all hover:border-[#D9D3CA] hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E0D8] flex items-center justify-center">
                    {feat.icon}
                  </div>

                  <h3 className="text-base font-bold text-[#171513] tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-[#655f58] leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
