import React from 'react';
import { ArrowRight, Monitor } from 'lucide-react';
import MotionReveal from './MotionReveal';
import LiveFormLab from './LiveFormLab';

export default function HeroSection({ onExploreCatalog, onLaunchTracker }) {
  return (
    <section className="relative pt-6 pb-12 border-b border-[#e6e2dc] bg-[#faf8f5]">
      <MotionReveal variant="fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column (Hero Title & Actions) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#f9f4ef] border border-[#e6d4c9] text-[#c86343] px-3.5 py-1 rounded-full shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                AI FITNESS COACHING
              </span>
            </div>

            {/* Main Serif Headline */}
            <h1 className="font-serif-claude text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0d0d0d] tracking-tight leading-[1.12]">
              Every rep counted. <br />
              Every movement <br />
              understood.
            </h1>

            {/* Subtitle Body Copy */}
            <p className="text-[#78716c] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Real-time form analysis using your camera. Get instant feedback on posture, depth, alignment and movement quality.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Primary Orange Button */}
              <button
                onClick={onLaunchTracker}
                className="px-7 py-3.5 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold text-sm transition-all smooth-press flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,85,0,0.35)]"
              >
                Try Live Demo <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {/* Secondary Outline Button */}
              <button
                onClick={onExploreCatalog}
                className="px-7 py-3.5 rounded-xl bg-white hover:bg-[#faf8f5] text-[#1c1917] font-bold text-sm border border-[#1c1917] transition-all smooth-press flex items-center justify-center gap-2 shadow-2xs"
              >
                Explore Exercises
              </button>
            </div>

            {/* Micro-copy Footer */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#78716c] pt-2">
              <Monitor className="w-4 h-4 text-[#78716c]" />
              <span>No equipment required • Browser-based movement analysis</span>
            </div>
          </div>

          {/* Right Column (Live Form Lab Component) */}
          <div className="lg:col-span-6">
            <LiveFormLab onLaunchTracker={onLaunchTracker} />
          </div>

        </div>
      </MotionReveal>
    </section>
  );
}
