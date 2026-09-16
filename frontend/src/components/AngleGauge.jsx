import React from 'react';

export default function AngleGauge({ angle }) {
  const currentAngle = typeof angle === 'number' && !isNaN(angle) ? angle : 0;
  const fillPct = Math.min(100, Math.max(0, (currentAngle / 180) * 100));

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-zinc-700 uppercase font-mono text-[10px] tracking-wider">
          Joint Angle Gauge
        </span>
        <span className="font-mono font-bold text-zinc-900 text-sm bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded-md">
          {currentAngle}°
        </span>
      </div>
      
      <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/90 p-0.5">
        <div
          className="h-full bg-zinc-900 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-semibold">
        <span>0° (Flex)</span>
        <span>90° (Peak)</span>
        <span>180° (Ext)</span>
      </div>
    </div>
  );
}

