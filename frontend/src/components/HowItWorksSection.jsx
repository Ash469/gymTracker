import React from 'react';
import { MousePointerClick, Camera, Award, ArrowRight } from 'lucide-react';
import MotionReveal from './MotionReveal';

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: <MousePointerClick className="w-5 h-5 text-[#171513]" />,
      title: "Choose Exercise Movement",
      description: "Select an exercise movement from our catalog to review form parameters, joint angle targets, and common posture mistakes."
    },
    {
      num: "02",
      icon: <Camera className="w-5 h-5 text-[#059669]" />,
      title: "Position Camera & Body",
      description: "Launch the live tracker. Your device camera runs MediaPipe pose models 100% locally inside your browser sandbox."
    },
    {
      num: "03",
      icon: <Award className="w-5 h-5 text-[#E87552]" />,
      title: "Execute & Get Real-Time Coaching",
      description: "Perform your set while the AI vision HUD tracks reps, measures angles, alerts posture errors, and logs performance metrics."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 border-b border-[#e6e0d8] bg-white relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        <MotionReveal>
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF1EB] border border-[#F5DDD2] text-[#D95325] text-xs font-bold tracking-wide uppercase">
                <span>✦</span>
                <span>3-STEP WORKFLOW</span>
              </div>

              <h2 className="font-serif-claude text-3xl sm:text-4xl font-bold text-[#171513] tracking-tight">
                How FormFit AI Works
              </h2>

              <p className="text-[#655f58] text-sm leading-relaxed">
                Start training with real-time posture correction in less than 30 seconds.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 border border-[#E6E0D8] bg-[#FAF7F2] space-y-5 flex flex-col justify-between transition-all hover:border-[#D9D3CA] hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="w-9 h-9 rounded-xl bg-[#171513] text-white font-mono text-sm font-bold flex items-center justify-center">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E0D8] flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#171513] tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-xs text-[#655f58] leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#E87552]">
                    <span>Step {step.num}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
