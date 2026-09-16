import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import hero1Img from '../../assets/hero1.png';

export default function HeroSection({ onExploreCatalog, onLaunchTracker }) {
  return (
    <section
      className="relative border-b border-[#e6e2dc] overflow-hidden"
      style={{ background: '#FAF7F2', minHeight: '540px' }}
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center px-4 sm:px-8 py-10 lg:py-14">

        {/* ── Left Column: Copy & Actions (5 cols on lg) ── */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-7 z-10">

          {/* Eyebrow Badge */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF1EB] border border-[#F5DDD2] text-[#D95325] text-xs font-bold tracking-wide uppercase">
              <span>AI-POWERED MOVEMENT ANALYSIS</span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h1 className="font-serif-claude text-5xl sm:text-6xl lg:text-[4.1rem] font-bold tracking-tight leading-[1.06] text-[#171513]">
              Your form,
            </h1>
            <h1 className="font-serif-claude text-5xl sm:text-6xl lg:text-[4.1rem] font-bold tracking-tight leading-[1.06] text-[#E87552]">
              decoded.
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-[#655f58] text-base sm:text-[1.05rem] leading-relaxed max-w-[440px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            FormFit analyzes your movement, counts every rep, and helps you improve your technique — in real time.
          </p>

          {/* CTA Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onLaunchTracker}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all shadow-md hover:shadow-lg hover:bg-[#d8613e] smooth-press"
              style={{
                background: '#E87552',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Start Training <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={onExploreCatalog}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-[#171513] border border-[#d8d0c5] bg-white hover:bg-[#f6f2ec] transition-all smooth-press shadow-2xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Explore Exercises
            </button>
          </div>

          {/* 3 Bottom Feature Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#eae3d9]">
            {/* Feature 1 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#f4ebd6]/60 border border-[#e8ddc5] flex items-center justify-center text-[#171513]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="5" r="2.5" />
                  <path d="M12 7.5v6M9 10.5l3-3 3 3M8 20l4-6.5 4 6.5" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#48423c] leading-snug">
                Real-time<br />form feedback
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#f4ebd6]/60 border border-[#e8ddc5] flex items-center justify-center text-[#171513]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#48423c] leading-snug">
                Browser-based<br />analysis
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#f4ebd6]/60 border border-[#e8ddc5] flex items-center justify-center text-[#171513]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#48423c] leading-snug">
                Personalized<br />workout insights
              </p>
            </div>
          </div>

        </div>

        {/* ── Right Column: Biomechanics Illustration & Overlay Cards (7 cols on lg) ── */}
        <div className="lg:col-span-7 flex items-center justify-center relative min-h-[500px] select-none">
          
          {/* Background Concentric Circular Grid Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-[480px] h-[480px] rounded-full border border-dashed border-[#e2d5c8] absolute" />
            <div className="w-[360px] h-[360px] rounded-full border border-dashed border-[#e2d5c8] absolute" />
            <div className="w-[240px] h-[240px] rounded-full border border-dashed border-[#e2d5c8] absolute" />
          </div>

          <div className="relative w-full max-w-[620px] flex items-center justify-center py-6">

            {/* Main Mannequin Figure Image (Shifted Left) */}
            <img
              src={hero1Img}
              alt="FormFit AI Movement Analysis & Biomechanics"
              className="w-auto h-auto object-contain max-h-[480px] z-10 filter contrast-[1.02] relative -translate-x-12 sm:-translate-x-16"
              draggable={false}
            />

            {/* 4. ANALYZING.. Sidebar List (Far Top Right) */}
            <div className="absolute z-20 right-0 sm:right-4 top-10 space-y-2.5">
              <div className="text-[11px] font-bold text-[#8c827a] uppercase tracking-widest">
                ANALYZING..
              </div>
              <div className="space-y-1.5 text-xs text-[#655f58] font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8fb396]" />
                  <span>Pose Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8fb396]" />
                  <span>Joint Angles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a39e70]" />
                  <span>Rep Counting</span>
                </div>
                <div className="flex items-center gap-2 text-[#D95325] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#E87552]" />
                  <span>Form Feedback</span>
                </div>
              </div>
            </div>

            {/* 5. Orange Right Pointer Arrow */}
            <div className="absolute z-20 right-20 sm:right-24 top-1/2 -translate-y-1/2 text-[#F29472] opacity-80">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>

            {/* 6. Good Depth Feedback Card (Bottom Right) */}
            <div
              className="absolute z-20 right-0 sm:right-6 bottom-4 bg-white/98 border border-[#F6EBE5] p-4 rounded-3xl shadow-xl shadow-[#171513]/8 backdrop-blur-md max-w-[240px]"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#34c759] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#171513] leading-tight">
                    Good depth!
                  </h4>
                  <p className="text-[11px] text-[#78716c] leading-normal font-normal">
                    Keep your knees aligned and chest up.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

