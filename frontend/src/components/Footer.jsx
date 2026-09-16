import React from 'react';
import { ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-white border-t border-[#E6E0D8] pt-10 pb-8 text-xs text-[#655f58]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E6E0D8]">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="FormFit Logo" className="h-8 w-auto object-contain max-w-[180px]" />
            </div>
            <p className="text-xs text-[#655f58] leading-relaxed font-normal">
              Real-time computer vision workout form tracker with posture guardrails, rep counts, and joint angle telemetry.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171513]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#E87552] transition-colors">
                  Exercise Catalog
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#E87552] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#E87552] transition-colors">
                  Built For Privacy
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171513]">
              Movements
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-[#655f58]">
              <li>• Dumbbell Bench Press</li>
              <li>• Bodyweight Squat</li>
              <li>• Standing Bicep Curl</li>
              <li>• Overhead Shoulder Press</li>
              <li>• Pull-up & Dumbbell Row</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171513]">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#FAF7F2] border border-[#E6E0D8] text-[#171513] text-[10px] font-bold px-2.5 py-1 rounded-full">
                MediaPipe Vision
              </span>
              <span className="bg-[#FAF7F2] border border-[#E6E0D8] text-[#171513] text-[10px] font-bold px-2.5 py-1 rounded-full">
                WebSockets
              </span>
              <span className="bg-[#FAF7F2] border border-[#E6E0D8] text-[#171513] text-[10px] font-bold px-2.5 py-1 rounded-full">
                React 18
              </span>
              <span className="bg-[#FAF7F2] border border-[#E6E0D8] text-[#171513] text-[10px] font-bold px-2.5 py-1 rounded-full">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#655f58] font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>FormFit AI Vision © 2026. 100% On-Device Local Processing.</span>
          </div>

          <div className="text-[#8c827a]">
            <span>Precision athletic form correction</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
