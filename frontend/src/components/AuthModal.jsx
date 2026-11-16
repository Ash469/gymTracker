import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('INTERMEDIATE');
  const [primaryGoal, setPrimaryGoal] = useState('improve form');

  // Synchronize mode when initialMode or isOpen changes
  React.useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFillDemo = async () => {
    setEmail('demo@formfit.com');
    setPassword('Demo1234!');
    setError('');
    setLoading(true);
    try {
      const { user } = await loginUser('demo@formfit.com', 'Demo1234!');
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user } = await loginUser(email, password);
        onSuccess(user);
        onClose();
      } else {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        const { user } = await registerUser({
          name,
          email,
          password,
          fitnessLevel,
          primaryGoal,
        });
        onSuccess(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
    >
      {/* Modal Card */}
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="p-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                {mode === 'login' ? 'Welcome Back' : 'Create FormFit Account'}
              </h3>
              <p className="text-xs text-zinc-500">
                {mode === 'login' ? 'Sign in to save your posture & workout stats' : 'Track your workout sets and get AI coaching'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Password {mode === 'register' && <span className="text-zinc-400 font-normal">(min 8 characters)</span>}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Fitness Level</label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Primary Goal</label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="improve form">Improve Form</option>
                  <option value="build muscle">Build Muscle</option>
                  <option value="lose weight">Lose Weight</option>
                  <option value="general fitness">General Fitness</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Quick Demo Helper */}
          {mode === 'login' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Auto-fill Demo Athlete account</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
