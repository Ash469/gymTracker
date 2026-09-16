import React from 'react';
import { Flag, CheckCircle2 } from 'lucide-react';

export default function StopConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-zinc-200/90 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <Flag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Finish Workout Session?</h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Stop tracking the current exercise and generate your biomechanical execution report.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/80 transition-all smooth-press"
          >
            Keep tracking
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all smooth-press flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Finish set →
          </button>
        </div>
      </div>
    </div>
  );
}

