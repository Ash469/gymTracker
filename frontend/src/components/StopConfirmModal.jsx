import React from 'react';

export default function StopConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-zinc-200 space-y-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900">Finish Workout Session?</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Stop tracking current exercise and view your performance summary report.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            Continue tracking
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Finish set →
          </button>
        </div>
      </div>
    </div>
  );
}
