import React from 'react';
import { MousePointerClick, Camera, Award, ArrowRight } from 'lucide-react';
import MotionReveal from './MotionReveal';

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: <MousePointerClick className="w-5 h-5 text-[#1c1917]" />,
      title: "Choose Exercise Movement",
      description: "Select an exercise movement from our catalog to review form parameters, joint angle targets, and common mistakes."
    },
    {
      num: "02",
      icon: <Camera className="w-5 h-5 text-[#059669]" />,
      title: "Position Camera & Body",
      description: "Launch the live tracker. Your device camera runs MediaPipe pose models 100% locally inside your browser."
    },
    {
      num: "03",
      icon: <Award className="w-5 h-5 text-[#da7756]" />,
      title: "Execute & Get Real-Time Coaching",
      description: "Perform your set while the AI vision HUD tracks reps, measures angles, alerts posture errors, and logs metrics."
    }
  ];

  return (
    <section id="how-it-works" className="py-10 border-b border-[#e6e2dc] bg-[#faf8f5] relative overflow-hidden">
      <MotionReveal>
        <div className="space-y-8 relative z-10">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#f6eee9] border border-[#e6d4c9] px-3 py-1 rounded-full text-[#c86343] text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
              3-Step Workflow
            </div>

            <h2 className="font-serif-claude text-2xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
              How FormFit AI Works
            </h2>

            <p className="text-[#78716c] text-xs sm:text-sm leading-relaxed">
              Start training with real-time posture correction in less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="claude-card claude-card-hover rounded-2xl p-6 border border-[#e6e2dc] bg-white space-y-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="w-9 h-9 rounded-xl bg-[#1c1917] text-white font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                      {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e6e2dc]">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#1c1917] tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#78716c] leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-[11px] font-mono font-bold text-[#da7756]">
                  <span>Step {step.num}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#da7756]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
