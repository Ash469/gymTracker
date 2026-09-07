import React from 'react';

export default function PostureAlert({ warning }) {
  if (!warning) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-rose-600 text-white p-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-alert-shake z-20">
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-100">Posture Warning</h4>
        <p className="text-xs font-semibold leading-tight">{warning}</p>
      </div>
    </div>
  );
}
