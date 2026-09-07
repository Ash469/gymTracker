import React from 'react';

export default function AngleGauge({ angle }) {
  const fillPct = Math.min(100, Math.max(0, (angle / 180) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-zinc-600">Joint Angle</span>
        <span className="font-mono font-bold text-zinc-900">{angle}°</span>
      </div>
      
      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
        <div
          className="h-full bg-zinc-900 rounded-full transition-all duration-150"
          style={{ width: `${fillPct}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
        <span>0° (Flex)</span>
        <span>90° (Peak)</span>
        <span>180° (Ext)</span>
      </div>
    </div>
  );
}
