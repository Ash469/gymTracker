import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, MoreHorizontal, ChevronDown, Play, Pause, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import headerLogoImg from '../../assets/headerLogo.png';

/* ─── DEMO DATA ──────────────────────────────────────────────── */
const EXERCISES = {
  squat: {
    name: 'Squat',
    jointLabel: 'Knee Angle',
    frames: [
      { phase: 'READY',       angle: 168, score: 92, progress: 0,    feedback: ['Stand tall, feet shoulder-width apart', 'Brace your core'] },
      { phase: 'DESCENDING',  angle: 148, score: 88, progress: 0.2,  feedback: ['Controlled descent', 'Weight in your heels'] },
      { phase: 'DESCENDING',  angle: 122, score: 87, progress: 0.4,  feedback: ['Keep chest tall', 'Knees tracking over toes'] },
      { phase: 'BOTTOM',      angle:  96, score: 86, progress: 0.55, feedback: ['Good depth', 'Hips below parallel'] },
      { phase: 'ASCENDING',   angle: 118, score: 89, progress: 0.7,  feedback: ['Drive through your heels', 'Extend hips and knees together'] },
      { phase: 'ASCENDING',   angle: 148, score: 91, progress: 0.85, feedback: ['Strong finish', 'Lock out at the top'] },
      { phase: 'REP COMPLETE',angle: 168, score: 93, progress: 1,    feedback: ['Great repetition!', 'Consistent depth maintained'] },
    ],
  },
  pushup: {
    name: 'Push-Up',
    jointLabel: 'Elbow Angle',
    frames: [
      { phase: 'READY',       angle: 170, score: 91, progress: 0,    feedback: ['Arms shoulder-width', 'Rigid plank position'] },
      { phase: 'DESCENDING',  angle: 140, score: 88, progress: 0.25, feedback: ['Controlled lower', 'Elbows at 45°'] },
      { phase: 'BOTTOM',      angle:  88, score: 85, progress: 0.5,  feedback: ['Chest close to floor', 'Core engaged'] },
      { phase: 'ASCENDING',   angle: 130, score: 89, progress: 0.75, feedback: ['Push the ground away', 'Full elbow extension'] },
      { phase: 'REP COMPLETE',angle: 170, score: 92, progress: 1,    feedback: ['Strong rep!', 'Body alignment held'] },
    ],
  },
  bicep: {
    name: 'Bicep Curl',
    jointLabel: 'Elbow Angle',
    frames: [
      { phase: 'READY',       angle: 160, score: 94, progress: 0,    feedback: ['Arms extended', 'Elbows pinned to ribs'] },
      { phase: 'CURLING',     angle: 120, score: 90, progress: 0.3,  feedback: ['Controlled curl', 'Wrist neutral'] },
      { phase: 'PEAK',        angle:  48, score: 88, progress: 0.55, feedback: ['Full contraction', 'Hold briefly at top'] },
      { phase: 'LOWERING',    angle: 110, score: 90, progress: 0.8,  feedback: ['Slow eccentric', 'Control the weight down'] },
      { phase: 'REP COMPLETE',angle: 160, score: 93, progress: 1,    feedback: ['Clean rep!', 'Great muscle control'] },
    ],
  },
};

/* ─── SQUAT SKELETON ─────────────────────────────────────────── */
function SquatSkeleton({ progress, score }) {
  const headR = 12;
  const hipX = 105 + progress * 20;
  const hipY = 108 + progress * 42;
  const torsoAngle = -88 + progress * 28;
  const tLen = 56;
  const shX = hipX + Math.cos((torsoAngle * Math.PI) / 180) * tLen;
  const shY = hipY + Math.sin((torsoAngle * Math.PI) / 180) * tLen;
  const headX = shX - 3 - progress * 5;
  const headY = shY - 18;
  const kneeX = 82 - progress * 18;
  const kneeY = 155 + progress * 18;
  const ankleX = 118; const ankleY = 218;
  const footTipX = 88; const footTipY = 218;
  const elbX = shX - 28 - progress * 12; const elbY = shY + 2 - progress * 18;
  const wrX = elbX - 24 - progress * 10; const wrY = elbY - progress * 14;
  const kAngle = Math.round(162 - progress * 94);
  const isGood = score >= 88;

  const arcR = 18;
  const a1 = Math.atan2(hipY - kneeY, hipX - kneeX);
  const a2 = Math.atan2(ankleY - kneeY, ankleX - kneeX);
  const ax1 = kneeX + Math.cos(a1) * arcR; const ay1 = kneeY + Math.sin(a1) * arcR;
  const ax2 = kneeX + Math.cos(a2) * arcR; const ay2 = kneeY + Math.sin(a2) * arcR;

  const boneColor = isGood ? '#19C987' : '#E87552';
  const jointFill = '#0d0d0d';

  return (
    <svg viewBox="0 0 200 248" className="w-full h-full" role="img" aria-label="Animated squat skeleton showing real-time form analysis">
      {/* Dot grid bg */}
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>
      <rect width="200" height="248" fill="url(#dotgrid)" />

      {/* Floor */}
      <line x1="30" y1="220" x2="170" y2="220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Motion trail ellipses */}
      {progress > 0.1 && (
        <g opacity={0.06 + progress * 0.04}>
          <ellipse cx={kneeX} cy={kneeY} rx="22" ry="8" fill={boneColor} />
        </g>
      )}

      {/* Silhouette fills */}
      <g opacity="0.07" fill="white">
        <ellipse cx={(shX+hipX)/2} cy={(shY+hipY)/2} rx="13" ry={Math.hypot(hipX-shX,hipY-shY)/2+3}
          transform={`rotate(${Math.atan2(hipY-shY,hipX-shX)*180/Math.PI},${(shX+hipX)/2},${(shY+hipY)/2})`}/>
        <ellipse cx={(hipX+kneeX)/2} cy={(hipY+kneeY)/2} rx="11" ry={Math.hypot(kneeX-hipX,kneeY-hipY)/2+2}
          transform={`rotate(${Math.atan2(kneeY-hipY,kneeX-hipX)*180/Math.PI},${(hipX+kneeX)/2},${(hipY+kneeY)/2})`}/>
        <ellipse cx={(kneeX+ankleX)/2} cy={(kneeY+ankleY)/2} rx="9" ry={Math.hypot(ankleX-kneeX,ankleY-kneeY)/2+2}
          transform={`rotate(${Math.atan2(ankleY-kneeY,ankleX-kneeX)*180/Math.PI},${(kneeX+ankleX)/2},${(kneeY+ankleY)/2})`}/>
      </g>

      {/* Bones */}
      <g stroke={boneColor} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={headX} y1={headY+headR} x2={shX} y2={shY} strokeWidth="2"/>
        <line x1={shX} y1={shY} x2={hipX} y2={hipY} strokeWidth="3.5"/>
        <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3.5"/>
        <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3.5"/>
        <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.5"/>
        <line x1={shX} y1={shY} x2={elbX} y2={elbY} strokeWidth="3"/>
        <line x1={elbX} y1={elbY} x2={wrX} y2={wrY} strokeWidth="2.5"/>
      </g>

      {/* Spine dots */}
      {[0.2,0.45,0.7].map((t,i) => (
        <circle key={i} cx={shX+(hipX-shX)*t} cy={shY+(hipY-shY)*t} r="1.8" fill={boneColor} opacity="0.5"/>
      ))}

      {/* Regular joints */}
      {[{x:shX,y:shY,r:5},{x:hipX,y:hipY,r:5.5},{x:ankleX,y:ankleY,r:4},{x:wrX,y:wrY,r:3},{x:elbX,y:elbY,r:3.5}].map((j,i)=>(
        <circle key={i} cx={j.x} cy={j.y} r={j.r} fill={jointFill} stroke={boneColor} strokeWidth="2"/>
      ))}

      {/* Highlighted KNEE */}
      <circle cx={kneeX} cy={kneeY} r="16" fill="rgba(232,117,82,0.08)" stroke="#E87552" strokeWidth="1.5"/>
      <circle cx={kneeX} cy={kneeY} r="5.5" fill="#E87552" stroke="white" strokeWidth="1.5"/>

      {/* Angle arc */}
      <path d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 0 1 ${ax2} ${ay2}`} stroke="#E87552" strokeWidth="1.5" fill="none" opacity="0.85"/>
      <text x={kneeX-28} y={kneeY-12} fill="#E87552" fontSize="8.5" fontFamily="'Space Grotesk', monospace" fontWeight="700">{kAngle}°</text>

      {/* Head */}
      <circle cx={headX} cy={headY} r={headR} fill={jointFill} stroke={boneColor} strokeWidth="2"/>
      <circle cx={headX-4} cy={headY-2} r="1.5" fill="white" opacity="0.7"/>
      <ellipse cx={headX+10} cy={headY} rx="2.5" ry="3.5" fill={jointFill} stroke={boneColor} strokeWidth="1.5"/>
    </svg>
  );
}

/* ─── BICEP SKELETON ─────────────────────────────────────────── */
function BicepSkeleton({ progress, score }) {
  const cx = 105; const headR = 12;
  const headX = cx; const headY = 20;
  const shX = cx; const shY = 46;
  const hipX = cx; const hipY = 114;
  const kneeX = cx; const kneeY = 162;
  const ankleX = cx; const ankleY = 210;
  const footTipX = cx - 20; const footTipY = 210;
  const elbX = cx - 2; const elbY = shY + 40;
  const curlAngle = -14 + progress * (-76);
  const wrX = elbX + Math.cos((curlAngle*Math.PI)/180)*34;
  const wrY = elbY + Math.sin((curlAngle*Math.PI)/180)*34;
  const eAngle = Math.round(158 - progress*118);
  const isGood = score >= 88;
  const boneColor = isGood ? '#19C987' : '#E87552';

  return (
    <svg viewBox="0 0 200 240" className="w-full h-full" role="img" aria-label="Animated bicep curl skeleton">
      <defs>
        <pattern id="dotgrid2" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.08)"/>
        </pattern>
      </defs>
      <rect width="200" height="240" fill="url(#dotgrid2)"/>
      <line x1="50" y1="212" x2="160" y2="212" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3"/>

      {/* Rear arm (dimmed) */}
      <g stroke="rgba(255,255,255,0.18)" strokeLinecap="round" fill="none">
        <line x1={shX+10} y1={shY} x2={elbX+12} y2={elbY} strokeWidth="2"/>
        <line x1={elbX+12} y1={elbY} x2={elbX+14} y2={elbY+34} strokeWidth="2"/>
      </g>

      <g opacity="0.07" fill="white">
        <ellipse cx={cx} cy={(shY+hipY)/2} rx="13" ry={(hipY-shY)/2+2}/>
        <ellipse cx={cx} cy={(hipY+kneeY)/2} rx="10" ry={(kneeY-hipY)/2+1}/>
        <ellipse cx={cx} cy={(kneeY+ankleY)/2} rx="7.5" ry={(ankleY-kneeY)/2+1}/>
      </g>

      <g stroke={boneColor} strokeLinecap="round" fill="none">
        <line x1={headX} y1={headY+headR} x2={shX} y2={shY} strokeWidth="2"/>
        <line x1={shX} y1={shY} x2={hipX} y2={hipY} strokeWidth="3.5"/>
        <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3.5"/>
        <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3.5"/>
        <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.5"/>
        <line x1={shX-3} y1={shY} x2={elbX} y2={elbY} strokeWidth="3"/>
        <line x1={elbX} y1={elbY} x2={wrX} y2={wrY} strokeWidth="3"/>
      </g>

      {[0.25,0.5,0.75].map((t,i)=>(<circle key={i} cx={cx} cy={shY+(hipY-shY)*t} r="1.8" fill={boneColor} opacity="0.5"/>))}

      {[{x:shX,y:shY,r:5},{x:hipX,y:hipY,r:5.5},{x:kneeX,y:kneeY,r:4},{x:ankleX,y:ankleY,r:3.5},{x:wrX,y:wrY,r:3}].map((j,i)=>(
        <circle key={i} cx={j.x} cy={j.y} r={j.r} fill="#0d0d0d" stroke={boneColor} strokeWidth="2"/>
      ))}

      <circle cx={elbX} cy={elbY} r="15" fill="rgba(232,117,82,0.08)" stroke="#E87552" strokeWidth="1.5"/>
      <circle cx={elbX} cy={elbY} r="5.5" fill="#E87552" stroke="white" strokeWidth="1.5"/>
      <text x={elbX-32} y={elbY+3} fill="#E87552" fontSize="8.5" fontFamily="'Space Grotesk', monospace" fontWeight="700">{eAngle}°</text>

      <circle cx={headX} cy={headY} r={headR} fill="#0d0d0d" stroke={boneColor} strokeWidth="2"/>
      <circle cx={headX-4} cy={headY-2} r="1.5" fill="white" opacity="0.7"/>
    </svg>
  );
}

/* ─── PUSHUP SKELETON ────────────────────────────────────────── */
function PushupSkeleton({ progress, score }) {
  const wrX=46; const wrY=182;
  const ankleX=165; const ankleY=182;
  const footTipX=178; const footTipY=182;
  const kneeX=128; const kneeY=178;
  const hipX=107; const hipY=170+progress*7;
  const shX=68; const shY=138+progress*34;
  const elbX=56; const elbY=shY+20+progress*12;
  const headX=shX-17; const headY=shY-3;
  const eAngle=Math.round(162-progress*90);
  const isGood = score >= 88;
  const boneColor = isGood ? '#19C987' : '#E87552';

  return (
    <svg viewBox="0 0 220 208" className="w-full h-full" role="img" aria-label="Animated push-up skeleton">
      <defs>
        <pattern id="dotgrid3" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.08)"/>
        </pattern>
      </defs>
      <rect width="220" height="208" fill="url(#dotgrid3)"/>
      <line x1="20" y1="185" x2="198" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3"/>

      <g stroke={boneColor} strokeLinecap="round" fill="none">
        <line x1={shX} y1={shY} x2={hipX} y2={hipY} strokeWidth="3.5"/>
        <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} strokeWidth="3.5"/>
        <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} strokeWidth="3.5"/>
        <line x1={ankleX} y1={ankleY} x2={footTipX} y2={footTipY} strokeWidth="2.5"/>
        <line x1={headX} y1={headY+11} x2={shX} y2={shY} strokeWidth="2"/>
        <line x1={shX} y1={shY} x2={elbX} y2={elbY} strokeWidth="3"/>
        <line x1={elbX} y1={elbY} x2={wrX} y2={wrY} strokeWidth="3"/>
      </g>

      {[0.25,0.5,0.75].map((t,i)=>(
        <circle key={i} cx={shX+(hipX-shX)*t} cy={shY+(hipY-shY)*t} r="1.8" fill={boneColor} opacity="0.5"/>
      ))}

      {[{x:shX,y:shY,r:5},{x:hipX,y:hipY,r:5.5},{x:kneeX,y:kneeY,r:4},{x:ankleX,y:ankleY,r:3.5},{x:wrX,y:wrY,r:3.5}].map((j,i)=>(
        <circle key={i} cx={j.x} cy={j.y} r={j.r} fill="#0d0d0d" stroke={boneColor} strokeWidth="2"/>
      ))}

      <circle cx={elbX} cy={elbY} r="15" fill="rgba(232,117,82,0.08)" stroke="#E87552" strokeWidth="1.5"/>
      <circle cx={elbX} cy={elbY} r="5.5" fill="#E87552" stroke="white" strokeWidth="1.5"/>
      <text x={elbX-4} y={elbY-19} fill="#E87552" fontSize="8.5" fontFamily="'Space Grotesk', monospace" fontWeight="700">{eAngle}°</text>

      <circle cx={headX} cy={headY} r="11" fill="#0d0d0d" stroke={boneColor} strokeWidth="2"/>
      <circle cx={headX-3} cy={headY-2} r="1.5" fill="white" opacity="0.7"/>
    </svg>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function LiveFormLab({ onLaunchTracker }) {
  const [exerciseKey, setExerciseKey] = useState('squat');
  const [frameIdx, setFrameIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraView] = useState('Side');

  const exercise = EXERCISES[exerciseKey];
  const frames = exercise.frames;
  const frame = frames[frameIdx];

  // Reset when exercise changes
  useEffect(() => {
    setFrameIdx(0);
    setReps(0);
  }, [exerciseKey]);

  // Demo animation — advance frames
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setFrameIdx(prev => {
        const next = prev + 1;
        if (next >= frames.length) {
          setReps(r => r + 1);
          return 0;
        }
        return next;
      });
    }, 820);
    return () => clearInterval(id);
  }, [isPlaying, exerciseKey, frames.length]);

  const progress = frame.progress;
  const score = frame.score;
  const phaseColor = frame.phase === 'REP COMPLETE' ? '#19C987' : frame.phase === 'BOTTOM' || frame.phase === 'PEAK' ? '#E87552' : 'rgba(255,255,255,0.7)';

  return (
    <div className="w-full rounded-3xl bg-[#0d0d0d] border border-[#1e1e1e] shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden text-white select-none">

      {/* ── Header ── */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2.5">
          <img src={headerLogoImg} alt="FormFit" className="w-5 h-5 object-contain" style={{ filter: 'invert(1) opacity(0.9)' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            FORM LAB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#19C987] text-[10px] font-bold tracking-wider" style={{ fontFamily: "'Space Grotesk', monospace" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#19C987] animate-pulse inline-block" />
            DEMO ACTIVE
          </div>
          <MoreHorizontal className="w-4 h-4 text-white/25" />
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-3">
        {/* Exercise selector */}
        <div>
          <label className="text-[9px] font-bold text-white/35 uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'Space Grotesk', monospace" }}>EXERCISE</label>
          <div className="relative">
            <select
              value={exerciseKey}
              onChange={e => setExerciseKey(e.target.value)}
              aria-label="Select exercise"
              className="w-full bg-[#161616] border border-[#282828] rounded-xl px-3 py-2.5 text-xs font-semibold text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E87552] transition-colors pr-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <option value="squat">Squat</option>
              <option value="pushup">Push-Up</option>
              <option value="bicep">Bicep Curl</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/35 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Play/Pause */}
        <div>
          <label className="text-[9px] font-bold text-white/35 uppercase tracking-widest block mb-1.5" style={{ fontFamily: "'Space Grotesk', monospace" }}>DEMO CONTROL</label>
          <button
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? 'Pause demo animation' : 'Play demo animation'}
            className="w-full bg-[#161616] border border-[#282828] rounded-xl px-3 py-2.5 text-xs font-semibold text-white flex items-center justify-between hover:border-[#3a3a3a] transition-colors"
          >
            <span className="flex items-center gap-2">
              {isPlaying
                ? <Pause className="w-3.5 h-3.5 text-[#E87552]" />
                : <Play className="w-3.5 h-3.5 text-[#19C987]" />}
              {isPlaying ? 'Pause' : 'Play'}
            </span>
            <Camera className="w-3 h-3 text-white/25" />
          </button>
        </div>
      </div>

      {/* ── Camera Viewport ── */}
      <div className="mx-5 mb-4 relative rounded-2xl bg-[#080808] border border-[#1a1a1a] overflow-hidden" style={{ height: '252px' }}>
        {/* Corner reticles */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white/15 pointer-events-none" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white/15 pointer-events-none" />

        {/* Scan line */}
        {isPlaying && (
          <div
            className="absolute inset-x-0 h-px pointer-events-none transition-all duration-700"
            style={{ top: `${15 + progress * 68}%`, background: 'linear-gradient(90deg, transparent, rgba(232,117,82,0.55), transparent)' }}
          />
        )}

        {/* Skeleton figure */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {exerciseKey === 'squat'  && <SquatSkeleton  progress={progress} score={score} />}
          {exerciseKey === 'bicep'  && <BicepSkeleton  progress={progress} score={score} />}
          {exerciseKey === 'pushup' && <PushupSkeleton progress={progress} score={score} />}
        </div>

        {/* Movement phase badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg border backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-[9px] font-bold tracking-widest" style={{ color: phaseColor, fontFamily: "'Space Grotesk', monospace" }}>
            {frame.phase}
          </span>
        </div>

        {/* AI tracking badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(232,117,82,0.25)' }}>
          <Activity className="w-2.5 h-2.5 text-[#E87552]" />
          <span className="text-[9px] font-bold text-[#E87552]" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI TRACKING</span>
        </div>

        {/* Camera label */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Camera className="w-2.5 h-2.5 text-white/30" />
          <span className="text-[9px] text-white/30" style={{ fontFamily: "'Space Grotesk', monospace" }}>{cameraView.toUpperCase()} CAM</span>
        </div>
      </div>

      {/* ── Metrics Row ── */}
      <div className="grid grid-cols-3 border-t border-b border-[#1a1a1a]">
        {[
          { label: 'REPS',       value: String(reps).padStart(2,'0'),  color: 'white',     unit: null },
          { label: 'FORM SCORE', value: frame.score,                    color: score >= 88 ? '#19C987' : '#F2B84B', unit: '/100' },
          { label: exercise.jointLabel.replace(' Angle','').toUpperCase(),
            value: `${frame.angle}°`, color: '#E87552', unit: null },
        ].map((m, i) => (
          <div key={i} className={`px-4 py-3.5 ${i < 2 ? 'border-r border-[#1a1a1a]' : ''}`}>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Space Grotesk', monospace" }}>{m.label}</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[21px] font-bold tracking-tight tabular-nums" style={{ color: m.color, fontFamily: "'Space Grotesk', sans-serif" }}>{m.value}</span>
              {m.unit && <span className="text-[9px] text-white/25 ml-0.5" style={{ fontFamily: "'Space Grotesk', monospace" }}>{m.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Form Score Bar ── */}
      <div className="px-5 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', monospace" }}>Form Quality</span>
          <span className="text-[9px] font-bold" style={{ color: score >= 88 ? '#19C987' : '#F2B84B', fontFamily: "'Space Grotesk', monospace" }}>
            {score >= 88 ? '● Excellent' : '▲ Check form'}
          </span>
        </div>
        <div className="h-1.5 bg-[#161616] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${frame.score}%`, background: score >= 88 ? 'linear-gradient(90deg,#19C987,#4ade80)' : 'linear-gradient(90deg,#F2B84B,#fbbf24)' }} />
        </div>
      </div>

      {/* ── Feedback ── */}
      <div className="px-5 py-3 border-b border-[#1a1a1a] space-y-1.5" aria-live="polite" aria-label="Real-time form feedback">
        {frame.feedback.map((fb, i) => (
          <div key={i} className="flex items-start gap-2">
            {score >= 88
              ? <CheckCircle2 className="w-3 h-3 text-[#19C987] shrink-0 mt-0.5" />
              : <AlertTriangle className="w-3 h-3 text-[#F2B84B] shrink-0 mt-0.5" />}
            <span className="text-[11px] text-white/60 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{fb}</span>
          </div>
        ))}
      </div>

      {/* ── Buttons ── */}
      <div className="grid grid-cols-2 gap-3 p-5">
        <button
          onClick={onLaunchTracker}
          className="px-4 py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_18px_rgba(232,117,82,0.38)] hover:shadow-[0_4px_24px_rgba(232,117,82,0.5)]"
          style={{ background: 'linear-gradient(135deg,#E87552,#d4603c)', fontFamily: "'Inter', sans-serif" }}
        >
          <Camera className="w-4 h-4" />
          Start Camera
        </button>
        <button
          onClick={() => setIsPlaying(p => !p)}
          className="px-4 py-3 rounded-xl text-white font-bold text-xs border border-[#282828] flex items-center justify-center gap-1.5 hover:bg-[#1a1a1a] transition-all active:scale-95"
          style={{ background: '#111', fontFamily: "'Inter', sans-serif" }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E87552]" />
          {isPlaying ? 'Pause Demo' : 'Play Demo'}
        </button>
      </div>
    </div>
  );
}
