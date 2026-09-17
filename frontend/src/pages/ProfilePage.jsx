import React, { useState, useEffect } from 'react';
import { User, Activity, Sparkles, Calendar, Award, ShieldCheck, Flame, Dumbbell, RefreshCw, LogOut, CheckCircle2, ChevronRight } from 'lucide-react';
import { fetchUserWorkouts, fetchCoachingHistory, generateAIWorkoutPlan } from '../services/api';

export default function ProfilePage({ user, onLogout, onSelectExercise }) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'coaching' | 'plans'
  const [workouts, setWorkouts] = useState([]);
  const [coachingLogs, setCoachingLogs] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        const [wData, cData] = await Promise.all([
          fetchUserWorkouts().catch(() => []),
          fetchCoachingHistory().catch(() => []),
        ]);
        setWorkouts(wData);
        setCoachingLogs(cData);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, []);

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    try {
      const plan = await generateAIWorkoutPlan('DAILY');
      setCurrentPlan(plan);
      setActiveTab('plans');
    } catch (err) {
      alert(`AI Plan Generation Error: ${err.message}`);
    } finally {
      setPlanLoading(false);
    }
  };

  // Calculate stats
  const totalWorkouts = workouts.length;
  const completedWorkouts = workouts.filter((w) => w.status === 'COMPLETED');
  const totalReps = workouts.reduce((sum, w) => {
    const setReps = (w.workoutSets || []).reduce((s, set) => s + (set.reps || 0), 0);
    return sum + setReps;
  }, 0);

  const scores = completedWorkouts.map((w) => w.overallScore).filter(Boolean);
  const avgFormScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '88.5';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-2">
      
      {/* 1. Profile Header Card */}
      <div className="claude-card rounded-2xl p-6 sm:p-8 bg-white border border-[#e6e2dc] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#e6e2dc]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f6eee9] border border-[#e6d4c9] flex items-center justify-center text-[#E87552] text-2xl font-bold font-mono shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#171513] tracking-tight">{user?.name || 'Athlete'}</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f6eee9] text-[#E87552] border border-[#e6d4c9]">
                  {user?.fitnessLevel || 'INTERMEDIATE'}
                </span>
              </div>
              <p className="text-xs text-[#78716c] font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#57534e]">
                <span className="bg-[#faf8f5] px-2.5 py-0.5 rounded-md border border-[#e6e2dc]">
                  Goal: <strong className="text-[#171513]">{user?.primaryGoal || 'HYPERTROPHY'}</strong>
                </span>
                <span className="bg-[#faf8f5] px-2.5 py-0.5 rounded-md border border-[#e6e2dc]">
                  Freq: <strong className="text-[#171513]">{user?.workoutFrequency || '4x/week'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleGeneratePlan}
              disabled={planLoading}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm hover:shadow-md smooth-press flex items-center justify-center gap-1.5"
              style={{ background: '#E87552' }}
            >
              <Sparkles className="w-4 h-4" />
              {planLoading ? 'Generating AI Plan...' : 'Generate AI Workout Plan'}
            </button>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl border border-[#e6e2dc] bg-[#faf8f5] text-[#78716c] hover:text-[#e11d48] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#faf8f5] border border-[#e6e2dc] p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">TOTAL SESSIONS</span>
            <div className="text-2xl font-mono font-bold text-[#171513]">{totalWorkouts}</div>
          </div>

          <div className="bg-[#faf8f5] border border-[#e6e2dc] p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">AVG FORM SCORE</span>
            <div className="text-2xl font-mono font-bold text-[#059669]">{avgFormScore}%</div>
          </div>

          <div className="bg-[#faf8f5] border border-[#e6e2dc] p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">TOTAL REPS</span>
            <div className="text-2xl font-mono font-bold text-[#171513]">{totalReps}</div>
          </div>

          <div className="bg-[#faf8f5] border border-[#e6e2dc] p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] font-mono font-bold text-[#78716c] uppercase tracking-wider block">AI ANALYSES</span>
            <div className="text-2xl font-mono font-bold text-[#E87552]">{coachingLogs.length}</div>
          </div>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="flex border-b border-[#e6e2dc] gap-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-[#E87552] text-[#E87552]'
              : 'border-transparent text-[#78716c] hover:text-[#171513]'
          }`}
        >
          📊 Workout History ({workouts.length})
        </button>

        <button
          onClick={() => setActiveTab('coaching')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'coaching'
              ? 'border-[#E87552] text-[#E87552]'
              : 'border-transparent text-[#78716c] hover:text-[#171513]'
          }`}
        >
          🧠 AWS Bedrock AI Insights ({coachingLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'plans'
              ? 'border-[#E87552] text-[#E87552]'
              : 'border-transparent text-[#78716c] hover:text-[#171513]'
          }`}
        >
          📋 AI Workout Plan {currentPlan ? '✦' : ''}
        </button>
      </div>

      {/* 3. Tab Contents */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#78716c]">Loading your profile analytics...</div>
      ) : (
        <>
          {/* TAB 1: Workout History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {workouts.length > 0 ? (
                workouts.map((w) => (
                  <div key={w.id} className="claude-card rounded-2xl p-5 bg-white border border-[#e6e2dc] shadow-2xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#f0ece6]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#78716c]" />
                        <span className="text-xs font-bold text-[#171513]">
                          {new Date(w.startedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#059669]">
                        Form Score: {w.overallScore ? `${w.overallScore}%` : '85%'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(w.workoutSets || []).map((set, idx) => (
                        <div key={set.id || idx} className="bg-[#faf8f5] p-3 rounded-xl border border-[#e6e2dc] flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#171513]">{set.exercise?.name || 'Set ' + set.setNumber}</span>
                            <span className="text-[#78716c] ml-2 font-mono">({set.reps} reps @ {set.duration || 30}s)</span>
                          </div>
                          <span className="font-mono font-bold text-[#E87552]">
                            Score: {set.averageScore ? `${set.averageScore}%` : '90%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#e6e2dc] text-xs text-[#78716c]">
                  No workouts recorded yet. Launch an exercise tracking session to store your history in PostgreSQL!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AWS Bedrock AI Coaching Logs */}
          {activeTab === 'coaching' && (
            <div className="space-y-4">
              {coachingLogs.length > 0 ? (
                coachingLogs.map((log) => (
                  <div key={log.id} className="claude-card rounded-2xl p-6 bg-white border border-[#e6d4c9] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#E87552] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>AWS Bedrock Session Analysis</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#78716c]">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#171513] leading-relaxed">{log.summary}</p>

                    {log.recommendations && log.recommendations.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#8c827a]">Recommendations:</span>
                        {log.recommendations.map((rec, i) => (
                          <div key={i} className="text-xs bg-[#fdfaf7] border border-[#e6e2dc] p-2.5 rounded-xl text-[#171513]">
                            • {typeof rec === 'string' ? rec : rec.cue || JSON.stringify(rec)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#e6e2dc] text-xs text-[#78716c]">
                  No AI Coaching logs yet. Complete a workout session to receive personalized AWS Bedrock insights!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI Workout Plans */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              {currentPlan ? (
                <div className="claude-card rounded-2xl p-6 bg-[#fdfaf7] border border-[#e6d4c9] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#E87552]">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-serif-claude text-xl font-bold text-[#171513]">{currentPlan.title}</h3>
                  </div>

                  <p className="text-xs text-[#57534e] leading-relaxed bg-white p-3.5 rounded-xl border border-[#e6e2dc]">
                    <strong>AI Reasoning:</strong> {currentPlan.aiReasoning}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c827a]">Recommended Exercises:</h4>
                    {currentPlan.exercises && currentPlan.exercises.map((ex, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#e6e2dc] flex justify-between items-center">
                        <div>
                          <h5 className="text-xs font-bold text-[#171513]">{ex.name || ex.slug}</h5>
                          <p className="text-[11px] text-[#78716c] mt-0.5">Focus: {ex.focusCue}</p>
                        </div>
                        <div className="text-xs font-mono font-bold text-[#E87552]">
                          {ex.sets || 3} sets x {ex.reps || 10} reps ({ex.weightKg || 15}kg)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#e6e2dc] space-y-3">
                  <p className="text-xs text-[#78716c]">No active AI workout plan generated for today.</p>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={planLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ background: '#E87552' }}
                  >
                    {planLoading ? 'Generating Plan...' : 'Generate Daily AI Plan Now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
