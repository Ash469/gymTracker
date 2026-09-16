import React from 'react';
import { ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-white border-t border-[#e6e2dc] pt-8 pb-6 mt-10 text-xs text-[#78716c]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#e6e2dc]">
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="FormFit Live Logo" className="h-8 w-auto object-contain max-w-[180px]" />
            </div>
            <p className="text-xs text-[#78716c] leading-relaxed font-normal">
              Real-time computer vision workout form tracker with posture guardrails, rep counts, and joint angle telemetry.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1c1917]">
              Navigation
            </h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#1c1917] transition-colors">
                  Exercise Catalog
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#1c1917] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#1c1917] transition-colors">
                  Built For Privacy
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1c1917]">
              Movements
            </h4>
            <ul className="space-y-1 text-[11px] font-medium text-[#78716c]">
              <li>• Dumbbell Bench Press</li>
              <li>• Bodyweight Squat</li>
              <li>• Standing Bicep Curl</li>
              <li>• Overhead Shoulder Press</li>
              <li>• Pull-up & Dumbbell Row</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1c1917]">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-[#faf8f5] border border-[#e6e2dc] text-[#1c1917] font-mono text-[9px] font-semibold px-2 py-0.5 rounded">
                MediaPipe Vision
              </span>
              <span className="bg-[#faf8f5] border border-[#e6e2dc] text-[#1c1917] font-mono text-[9px] font-semibold px-2 py-0.5 rounded">
                WebSockets
              </span>
              <span className="bg-[#faf8f5] border border-[#e6e2dc] text-[#1c1917] font-mono text-[9px] font-semibold px-2 py-0.5 rounded">
                React 18
              </span>
              <span className="bg-[#faf8f5] border border-[#e6e2dc] text-[#1c1917] font-mono text-[9px] font-semibold px-2 py-0.5 rounded">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#78716c] font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>FormFit AI Vision © 2026. 100% On-Device Local Processing.</span>
          </div>

          <div className="text-[#a8a29e]">
            <span>Precision athletic form correction</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

