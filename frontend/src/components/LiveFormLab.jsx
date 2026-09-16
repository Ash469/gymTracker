import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, MoreHorizontal, ChevronDown } from 'lucide-react';
import headerLogoImg from '../../assets/headerLogo.png';

export default function LiveFormLab({ onLaunchTracker }) {
  const [selectedExercise, setSelectedExercise] = useState('squat');
  const [cameraAngle, setCameraAngle] = useState('Front');
  const [jointAngle, setJointAngle] = useState(94);
  const [repsCount, setRepsCount] = useState(8);
  const [formScore, setFormScore] = useState(86);
  const [isDemoRunning, setIsDemoRunning] = useState(true);

  // Exercise definitions for the Live Form Lab interactive simulation
  const exercisesData = {
    squat: {
      name: 'Squat',
      jointLabel: 'Knee Angle',
      defaultAngle: 94,
      minAngle: 55,
      maxAngle: 150
    },
    bicep: {
      name: 'Bicep Curl',
      jointLabel: 'Elbow Angle',
      defaultAngle: 85,
      minAngle: 40,
      maxAngle: 160
    },
    pushup: {
      name: 'Push-Up',
      jointLabel: 'Elbow Flare Angle',
      defaultAngle: 106,
      minAngle: 70,
      maxAngle: 160
    }
  };

  const currentEx = exercisesData[selectedExercise] || exercisesData.squat;

  // Reset angle when changing exercise dropdown
  useEffect(() => {
    setJointAngle(currentEx.defaultAngle);
    setRepsCount(8);
  }, [selectedExercise]);

  // Auto-play demo motion in the canvas
  useEffect(() => {
    if (!isDemoRunning) return;
    let direction = 1;
    const interval = setInterval(() => {
      setJointAngle(prev => {
        const { minAngle, maxAngle } = currentEx;
        if (prev >= maxAngle) {
          direction = -1;
          setRepsCount(r => (r >= 15 ? 1 : r + 1));
        }
        if (prev <= minAngle) {
          direction = 1;
        }
        return prev + direction * 4;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [isDemoRunning, selectedExercise]);

  return (
    <div className="w-full max-w-md mx-auto lg:max-w-none rounded-3xl bg-[#0f0f0f] border border-[#262626] p-5 sm:p-6 shadow-2xl space-y-4 text-white">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2.5">
          <img src={headerLogoImg} alt="FormFit Logo" className="w-5 h-5 object-contain filter invert" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            LIVE FORM LAB
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
          <MoreHorizontal className="w-4 h-4 text-[#a8a29e] cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Exercise & Camera Angle Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono text-[#a8a29e] uppercase block mb-1">EXERCISE</label>
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-[#1c1917] border border-[#332d29] rounded-xl px-3.5 py-2 text-xs font-bold text-white appearance-none cursor-pointer focus:outline-none focus:border-[#ff5500] transition-colors"
            >
              <option value="squat">Squat</option>
              <option value="bicep">Bicep Curl</option>
              <option value="pushup">Push-Up</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a8a29e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-mono text-[#a8a29e] uppercase block mb-1">CAMERA ANGLE</label>
          <button
            onClick={() => setCameraAngle(prev => prev === 'Front' ? 'Side' : 'Front')}
            className="w-full bg-[#1c1917] border border-[#332d29] rounded-xl px-3.5 py-2 text-xs font-bold text-white flex items-center justify-between smooth-press hover:border-[#443e39] transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Camera className="w-3.5 h-3.5 text-[#ff5500] shrink-0" />
              {cameraAngle}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#a8a29e] shrink-0" />
          </button>
        </div>
      </div>

      {/* Center Camera Viewport with Reticle Brackets & Pose Figure */}
      <div className="relative h-60 w-full rounded-2xl bg-[#161413] border border-[#262626] flex items-center justify-center overflow-hidden">
        {/* Reticle Corner Brackets matching design spec */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-xs pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-xs pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-xs pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-xs pointer-events-none" />

        {/* Grid Lines & Measurement Axis Background */}
        <svg className="absolute inset-0 w-full h-full stroke-[#262626]" viewBox="0 0 300 200">
          <line x1="0" y1="50" x2="300" y2="50" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="300" y2="100" strokeWidth="0.5" />
          <line x1="0" y1="150" x2="300" y2="150" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="75" y1="0" x2="75" y2="200" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="150" y1="0" x2="150" y2="200" strokeWidth="0.5" />
          <line x1="225" y1="0" x2="225" y2="200" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* High-Fidelity Anatomical Human Body Vector Figure matching Selected Exercise */}
        {(() => {
          if (selectedExercise === 'pushup') {
            // PUSH-UP GEOMETRY (Horizontal Plank Pose)
            const progress = Math.max(0, Math.min(1, (160 - jointAngle) / 90)); // 0 = top plank, 1 = bottom push-up
            
            // Fixed anchors: hands on ground & feet on ground
            const wristX = 85;
            const wristY = 162;
            const footTipX = 225;
            const footTipY = 162;
            const ankleX = 215;
            const ankleY = 158;

            // Chest & shoulder lowers down during push-up
            const shoulderX = 85;
            const shoulderY = 114 + progress * 32;

            // Head extends past shoulders
            const headX = 62;
            const headY = shoulderY - 2;

            // Elbow bends outward/back as body lowers
            const elbowX = 66 - progress * 10;
            const elbowY = shoulderY + 22;

            // Plank body line from shoulder to hip to knee to ankle
            const hipX = shoulderX + 55;
            const hipY = shoulderY + 4;
            const kneeX = hipX + 40;
            const kneeY = hipY + 8;

            // Spine vertebrae points along horizontal plank
            const spineDots = [1, 2, 3, 4, 5, 6].map(i => {
              const t = i / 7;
              return {
                x: shoulderX + (hipX - shoulderX) * t,
                y: shoulderY + (hipY - shoulderY) * t
              };
            });

            return (
              <svg className="w-full h-full max-h-56 relative z-10 overflow-visible" viewBox="0 0 280 200">
                {/* Floor Line */}
                <line x1="40" y1="164" x2="245" y2="164" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Body Contour Silhouette */}
                <g fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2">
                  {/* Head Profile */}
                  <circle cx={headX} cy={headY} r="12" />
                  {/* Torso & Leg Plank Outline */}
                  <path d={`M ${shoulderX-6} ${shoulderY-10} L ${ankleX} ${ankleY-8} L ${ankleX} ${ankleY+8} L ${shoulderX-6} ${shoulderY+10} Z`} />
                  {/* Arms Contour */}
                  <path d={`M ${shoulderX-4} ${shoulderY} L ${elbowX} ${elbowY} L ${wristX} ${wristY} L ${shoulderX+6} ${shoulderY} Z`} />
                </g>

                {/* Skeleton Bones */}
                <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
                  <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} strokeWidth="3.2" />
                  <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3" />
                  <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3" />
                  <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.5" />
                  <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} strokeWidth="2.8" />
                  <line x1={elbowX} y1={elbowY} x2={wristX} y2={wristY} strokeWidth="2.8" />
                </g>

                {/* Head Circle */}
                <circle cx={headX} cy={headY} r="12" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                <circle cx={headX - 4} cy={headY - 2} r="1.5" fill="#ffffff" />

                {/* Spine Vertebrae */}
                <g fill="#ffffff">
                  {spineDots.map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="2.2" />
                  ))}
                </g>

                {/* Joint Pivot Nodes */}
                <g>
                  <circle cx={shoulderX} cy={shoulderY} r="5" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={hipX} cy={hipY} r="5" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={kneeX} cy={kneeY} r="4" fill="#ffffff" />
                  <circle cx={ankleX} cy={ankleY} r="4" fill="#ffffff" />
                  <circle cx={wristX} cy={wristY} r="4" fill="#ffffff" />
                </g>

                {/* Highlighted Orange Target Circle around Elbow Joint */}
                <g>
                  <circle cx={elbowX} cy={elbowY} r="14" fill="none" stroke="#ff5500" strokeWidth="2.5" className="animate-pulse" />
                  <circle cx={elbowX} cy={elbowY} r="5" fill="#ff5500" stroke="#ffffff" strokeWidth="1.8" />
                </g>
              </svg>
            );
          }

          if (selectedExercise === 'bicep') {
            // BICEP CURL GEOMETRY (Standing Upright Pose)
            const progress = Math.max(0, Math.min(1, (160 - jointAngle) / 120)); // 0 = extended down, 1 = fully curled up
            
            const headX = 140;
            const headY = 40;
            const shoulderX = 140;
            const shoulderY = 64;
            const hipX = 140;
            const hipY = 110;
            const kneeX = 140;
            const kneeY = 148;
            const ankleX = 140;
            const ankleY = 175;
            const footTipX = 122;
            const footTipY = 175;

            // Upper arm extends vertically from shoulder to elbow
            const elbowX = 140;
            const elbowY = 96;

            // Forearm rotates upward around elbow joint
            const curlRad = (180 - jointAngle) * (Math.PI / 180);
            const wristX = elbowX - 32 * Math.sin(curlRad);
            const wristY = elbowY + 32 * Math.cos(curlRad);

            const spineDots = [1, 2, 3, 4, 5, 6].map(i => {
              const t = i / 7;
              return {
                x: shoulderX,
                y: shoulderY + (hipY - shoulderY) * t
              };
            });

            return (
              <svg className="w-full h-full max-h-56 relative z-10 overflow-visible" viewBox="0 0 280 200">
                {/* Body Contour */}
                <g fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2">
                  <path d={`M ${headX-12} ${headY} C ${headX-12} ${headY-14}, ${headX+12} ${headY-14}, ${headX+12} ${headY} Z`} />
                  <path d={`M ${shoulderX-14} ${shoulderY} L ${hipX-12} ${hipY} L ${hipX+12} ${hipY} L ${shoulderX+14} ${shoulderY} Z`} />
                  <path d={`M ${hipX-10} ${hipY} L ${kneeX-8} ${kneeY} L ${ankleX-6} ${ankleY} L ${ankleX+6} ${ankleY} L ${kneeX+8} ${kneeY} L ${hipX+10} ${hipY} Z`} />
                </g>

                {/* Skeleton Bones */}
                <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
                  <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} strokeWidth="3.2" />
                  <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3" />
                  <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3" />
                  <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.5" />
                  <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} strokeWidth="2.8" />
                  <line x1={elbowX} y1={elbowY} x2={wristX} y2={wristY} strokeWidth="2.8" />
                </g>

                {/* Head */}
                <circle cx={headX} cy={headY} r="13" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                <circle cx={headX - 6} cy={headY - 2} r="1.5" fill="#ffffff" />

                {/* Spine Vertebrae */}
                <g fill="#ffffff">
                  {spineDots.map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="2.2" />
                  ))}
                </g>

                {/* Joint Pivot Nodes */}
                <g>
                  <circle cx={shoulderX} cy={shoulderY} r="5" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={hipX} cy={hipY} r="5" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={kneeX} cy={kneeY} r="4" fill="#ffffff" />
                  <circle cx={ankleX} cy={ankleY} r="4" fill="#ffffff" />
                  <circle cx={wristX} cy={wristY} r="4" fill="#ffffff" />
                </g>

                {/* Highlighted Orange Target Circle around Elbow Joint */}
                <g>
                  <circle cx={elbowX} cy={elbowY} r="14" fill="none" stroke="#ff5500" strokeWidth="2.5" className="animate-pulse" />
                  <circle cx={elbowX} cy={elbowY} r="5" fill="#ff5500" stroke="#ffffff" strokeWidth="1.8" />
                </g>
              </svg>
            );
          }

          // SQUAT GEOMETRY (Default Movement)
          const progress = Math.max(0, Math.min(1, (150 - jointAngle) / 95));
          const ankleX = 155;
          const ankleY = 168;
          const footTipX = 130;
          const footTipY = 168;
          const kneeX = 130 - progress * 12;
          const kneeY = 136 + progress * 2;
          const hipX = 176 + progress * 24;
          const hipY = 108 + progress * 30;
          const shoulderX = hipX - 26 - progress * 6;
          const shoulderY = hipY - 44;
          const headX = shoulderX - 10;
          const headY = shoulderY - 24;
          const elbowX = shoulderX - 34;
          const elbowY = shoulderY + 2;
          const wristX = elbowX - 32;
          const wristY = elbowY;

          const spineDots = [1, 2, 3, 4, 5, 6, 7].map(i => {
            const t = i / 8;
            const curveShift = Math.sin(t * Math.PI) * 3;
            return {
              x: shoulderX + (hipX - shoulderX) * t + curveShift,
              y: shoulderY + (hipY - shoulderY) * t
            };
          });

          return (
            <svg className="w-full h-full max-h-56 relative z-10 overflow-visible" viewBox="0 0 280 200">
              {/* Subtle Body Contour Silhouette */}
              <g fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2">
                <path d={`M ${headX-4} ${headY-14} C ${headX-16} ${headY-8}, ${headX-16} ${headY+8}, ${headX-8} ${headY+14} L ${headX-4} ${headY+14} L ${shoulderX-6} ${shoulderY-6} L ${shoulderX+6} ${shoulderY-6} Z`} />
                <path d={`M ${shoulderX-12} ${shoulderY-4} C ${shoulderX-18} ${shoulderY+15}, ${hipX-22} ${hipY-10}, ${hipX-14} ${hipY+6} L ${hipX+12} ${hipY+6} C ${hipX+16} ${hipY-20}, ${shoulderX+18} ${shoulderY+15}, ${shoulderX+10} ${shoulderY-4} Z`} />
                <path d={`M ${hipX-14} ${hipY+4} L ${kneeX-6} ${kneeY-4} C ${kneeX-8} ${kneeY+6}, ${kneeX+6} ${kneeY+10}, ${kneeX+10} ${kneeY+4} L ${hipX+12} ${hipY+4} Z`} />
                <path d={`M ${kneeX-6} ${kneeY+4} L ${ankleX-8} ${ankleY} L ${ankleX+8} ${ankleY} L ${kneeX+10} ${kneeY+4} Z`} />
                <path d={`M ${shoulderX-6} ${shoulderY-6} L ${wristX} ${wristY-4} L ${wristX} ${wristY+4} L ${shoulderX-6} ${shoulderY+6} Z`} />
              </g>

              {/* Skeleton Bones */}
              <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
                <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} strokeWidth="3" />
                <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3.2" />
                <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3.2" />
                <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.8" />
                <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} strokeWidth="2.8" />
                <line x1={elbowX} y1={elbowY} x2={wristX} y2={wristY} strokeWidth="2.5" />
              </g>

              {/* Head Circle */}
              <g>
                <circle cx={headX} cy={headY} r="13" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                <circle cx={headX + 2} cy={headY + 1} r="3" fill="#161413" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={headX - 6} cy={headY - 2} r="1.8" fill="#ffffff" />
              </g>

              {/* Spine Vertebrae Chain */}
              <g fill="#ffffff">
                {spineDots.map((pt, idx) => (
                  <circle key={idx} cx={pt.x} cy={pt.y} r="2.2" />
                ))}
              </g>

              {/* Joint Pivot Nodes */}
              <g>
                <circle cx={shoulderX} cy={shoulderY} r="5.5" fill="#161413" stroke="#ffffff" strokeWidth="2.2" />
                <circle cx={elbowX} cy={elbowY} r="4.8" fill="#161413" stroke="#ffffff" strokeWidth="2" />
                <circle cx={wristX} cy={wristY} r="3.8" fill="#ffffff" />
                <circle cx={hipX} cy={hipY} r="6" fill="#161413" stroke="#ffffff" strokeWidth="2.2" />
                <circle cx={ankleX} cy={ankleY} r="4.5" fill="#ffffff" />
              </g>

              {/* Highlighted Orange Target Knee Joint */}
              <g>
                <circle cx={kneeX} cy={kneeY} r="15" fill="none" stroke="#ff5500" strokeWidth="2.5" className="animate-pulse" />
                <circle cx={kneeX} cy={kneeY} r="5" fill="#ff5500" stroke="#ffffff" strokeWidth="1.8" />
              </g>
            </svg>
          );
        })()}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#262626] pt-3 text-left">
        <div>
          <div className="text-[9px] font-mono text-[#a8a29e] uppercase">REPS</div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {String(repsCount).padStart(2, '0')}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-mono text-[#a8a29e] uppercase">FORM SCORE</div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-mono font-bold text-white">{formScore}</span>
            <span className="text-[10px] font-mono text-[#a8a29e]">/100</span>
          </div>
        </div>

        <div>
          <div className="text-[9px] font-mono text-[#a8a29e] uppercase">ANGLE</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-white">{Math.round(jointAngle)}°</span>
            <span className="text-[9px] font-mono text-[#a8a29e] truncate">{currentEx.jointLabel}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={onLaunchTracker}
          className="px-4 py-3 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold text-xs smooth-press flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,85,0,0.3)] transition-all"
        >
          <Camera className="w-4 h-4 text-white" />
          Start Camera
        </button>

        <button
          onClick={() => setIsDemoRunning(!isDemoRunning)}
          className="px-4 py-3 rounded-xl bg-[#1c1917] hover:bg-[#252220] text-white font-bold text-xs border border-[#332d29] smooth-press flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff5500]" />
          {isDemoRunning ? 'Pause Demo' : 'Use Demo Movement'}
        </button>
      </div>
    </div>
  );
}
