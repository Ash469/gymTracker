import React, { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PrivacySection from '../components/PrivacySection';
import ExerciseCard from '../components/ExerciseCard';
import MotionReveal from '../components/MotionReveal';
import { Search, Dumbbell, Sparkles, Send, MessageSquare, ChevronRight } from 'lucide-react';
import { fetchLatestAIWorkoutPlan, askAICoach, generateAIWorkoutPlan } from '../services/api';

export default function Home({ exercises, onSelectExercise }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [planModal, setPlanModal] = useState(null); // stores active generated AI plan modal
  const [activePlan, setActivePlan] = useState(null); // active plan stored in DB
  const [planLoading, setPlanLoading] = useState(false);

  // AI Chat state
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const catalogRef = useRef(null);

  useEffect(() => {
    async function loadActivePlan() {
      const token = localStorage.getItem('formfit_token');
      if (token) {
        try {
          const plan = await fetchLatestAIWorkoutPlan();
          if (plan) setActivePlan(plan);
        } catch (_err) {
          // Ignore unauthenticated / network errors
        }
      }
    }
    loadActivePlan();
  }, []);

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core'];

  const filteredExercises = exercises.filter(ex => {
    const matchesCat = selectedCat === 'All' || ex.category === selectedCat;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ex.how_to_perform && ex.how_to_perform.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (ex.target_muscles && ex.target_muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchDefaultTracker = () => {
    if (exercises && exercises.length > 0) {
      onSelectExercise(exercises[0].id);
    }
  };

  const handleGeneratePlanClick = async () => {
    const token = localStorage.getItem('formfit_token');
    if (!token) {
      setPlanModal({
        error: true,
        title: 'Authentication Required',
        aiReasoning: 'Please Sign In or Register an athlete account to enable AWS Bedrock AI Workout Plan generation.',
      });
      return;
    }

    setPlanLoading(true);
    try {
      const plan = await generateAIWorkoutPlan('DAILY');
      setActivePlan(plan);
      setPlanModal(plan);
    } catch (err) {
      setPlanModal({
        error: true,
        title: 'Bedrock Generation Error',
        aiReasoning: err.message || 'Could not connect to AWS Bedrock service.',
      });
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSendChat = async (customText) => {
    const promptToSubmit = (customText || chatPrompt).trim();
    if (!promptToSubmit) return;

    const token = localStorage.getItem('formfit_token');
    if (!token) {
      alert('Please Sign In first to ask questions to your AWS Bedrock AI Coach.');
      return;
    }

    setChatLoading(true);
    try {
      const res = await askAICoach(promptToSubmit);
      setChatResponse({ question: promptToSubmit, ...res });
      setChatPrompt('');
    } catch (err) {
      alert(`AI Coach Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-0 pb-16 bg-white">
      {/* Hero Section */}
      <div id="hero">
        <HeroSection
          onExploreCatalog={scrollToCatalog}
          onLaunchTracker={handleLaunchDefaultTracker}
        />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* AWS Bedrock AI Growth Coach & Workout Planner Section */}
      <section className="py-12 bg-[#fdfaf7] border-b border-[#e6e0d8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          
          {/* Main Coach Header Card */}
          <div className="claude-card bg-white border border-[#e6d4c9] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6eee9] text-[#E87552] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#e6d4c9]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AWS Bedrock Mode A Growth Coach</span>
              </div>
              <h3 className="font-serif-claude text-2xl sm:text-3xl font-bold text-[#171513]">
                AI Daily Workout & Biomechanical Coach
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                AWS Bedrock analyzes your joint angle accuracy, past workouts, and posture error history to construct daily routines and answer custom biomechanical questions.
              </p>
            </div>

            <button
              onClick={handleGeneratePlanClick}
              disabled={planLoading}
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:bg-[#d4603c] shrink-0 smooth-press flex items-center gap-2"
              style={{ background: '#E87552' }}
            >
              <span>{planLoading ? 'Generating via Bedrock...' : 'Generate New AI Plan'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIVE WORKOUT PLAN CARD (Shown when user has generated a plan) */}
          {activePlan && (
            <div className="claude-card bg-white border border-[#e6d4c9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#f0ece6] pb-4">
                <div className="flex items-center gap-2 text-[#E87552]">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-serif-claude text-xl font-bold text-[#171513]">
                    Your Active Plan: {activePlan.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✦ Active on Home
                </span>
              </div>

              <p className="text-xs text-[#57534e] leading-relaxed bg-[#fdfaf7] p-3.5 rounded-xl border border-[#e6e2dc]">
                <strong className="text-[#E87552] block mb-1 font-mono text-[11px] uppercase">AI Personalization Strategy:</strong> 
                {activePlan.aiReasoning}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePlan.exercises && activePlan.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-[#faf8f5] p-4 rounded-2xl border border-[#e6e2dc] space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-[#E87552]" />
                        <h5 className="text-xs font-bold text-[#171513]">{ex.name || ex.slug}</h5>
                      </div>
                      <p className="text-[11px] text-[#78716c]">Focus: {ex.focusCue}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#e6e2dc]/60">
                      <span className="text-[10px] font-mono font-bold text-[#E87552]">
                        {ex.sets || 3}x{ex.reps || 10} reps ({ex.weightKg || 15}kg)
                      </span>
                      {onSelectExercise && (
                        <button
                          onClick={() => onSelectExercise(ex.slug || 'shoulder_press')}
                          className="px-3 py-1 rounded-lg bg-zinc-900 text-white font-bold text-[10px] hover:bg-zinc-800 transition-all flex items-center gap-1"
                        >
                          Start <ChevronRight className="w-3 h-3 text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTIVE AI COACH Q&A BOX */}
          <div className="claude-card bg-white border border-[#e6d4c9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#E87552]">
              <MessageSquare className="w-5 h-5" />
              <h4 className="font-serif-claude text-xl font-bold text-[#171513]">
                Ask AWS Bedrock AI Coach
              </h4>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#8c827a] uppercase mr-1">Quick Questions:</span>
              <button
                onClick={() => handleSendChat('What are my weak areas and posture errors?')}
                className="text-xs bg-[#fdfaf7] border border-[#e6e2dc] text-[#57534e] hover:border-[#E87552] hover:text-[#E87552] px-3 py-1.5 rounded-full transition-all smooth-press font-medium"
              >
                💡 What are my weak areas?
              </button>
              <button
                onClick={() => handleSendChat('What should be my workout plan for today?')}
                className="text-xs bg-[#fdfaf7] border border-[#e6e2dc] text-[#57534e] hover:border-[#E87552] hover:text-[#E87552] px-3 py-1.5 rounded-full transition-all smooth-press font-medium"
              >
                🏋️ What is today's workout recommendation?
              </button>
              <button
                onClick={() => handleSendChat('What are my strong areas and best execution points?')}
                className="text-xs bg-[#fdfaf7] border border-[#e6e2dc] text-[#57534e] hover:border-[#E87552] hover:text-[#E87552] px-3 py-1.5 rounded-full transition-all smooth-press font-medium"
              >
                🎯 What are my strong areas?
              </button>
            </div>

            {/* Q&A Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask AWS Bedrock Coach (e.g. How can I fix elbow flare during press?)"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                className="flex-1 bg-[#faf8f5] border border-[#e6e2dc] rounded-2xl px-4 py-3 text-xs text-[#171513] placeholder-[#8c827a] focus:outline-none focus:border-[#E87552] transition-all"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatPrompt.trim()}
                className="px-5 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{chatLoading ? 'Thinking...' : 'Ask AI'}</span>
              </button>
            </form>

            {/* Q&A AI Response Display */}
            {chatResponse && (
              <div className="bg-[#fdfaf7] border border-[#e6d4c9] rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-[#E87552]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Q: "{chatResponse.question}"</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#78716c]">AWS Bedrock AI Answer</span>
                </div>

                <p className="text-xs text-[#171513] leading-relaxed bg-white p-3.5 rounded-xl border border-[#e6e2dc]">
                  {chatResponse.summary}
                </p>

                {/* Strengths & Areas to Improve Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {chatResponse.strengths && chatResponse.strengths.length > 0 && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-800">✓ Strong Points</span>
                      <ul className="space-y-1 text-emerald-950 text-[11px]">
                        {chatResponse.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {chatResponse.areasToImprove && chatResponse.areasToImprove.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-800">⚡ Weak Areas / Focus</span>
                      <ul className="space-y-1 text-amber-950 text-[11px]">
                        {chatResponse.areasToImprove.map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {chatResponse.recommendations && chatResponse.recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#8c827a]">Actionable Focus Cue:</span>
                    {chatResponse.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs bg-white border border-[#e6e2dc] p-2.5 rounded-xl text-[#171513]">
                        • {typeof rec === 'string' ? rec : rec.cue || JSON.stringify(rec)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Interactive AI Plan Modal Dialog */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-[#e6d4c9] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setPlanModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 font-bold text-sm flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {planModal.error ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-[#171513]">{planModal.title}</h3>
                <p className="text-xs text-[#78716c] max-w-md mx-auto">{planModal.aiReasoning}</p>
                <button
                  onClick={() => setPlanModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-all"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6eee9] text-[#E87552] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#e6d4c9]">
                    <span>✦</span>
                    <span>AWS Bedrock Personalized Plan</span>
                  </div>
                  <h3 className="font-serif-claude text-2xl font-bold text-[#171513]">
                    {planModal.title}
                  </h3>
                </div>

                <div className="bg-[#fdfaf7] p-4 rounded-2xl border border-[#e6d4c9] space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E87552] block">
                    AI Personalization Strategy
                  </span>
                  <p className="text-xs text-[#57534e] leading-relaxed">
                    {planModal.aiReasoning}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c827a]">
                    Recommended Exercises ({planModal.exercises?.length || 0}):
                  </h4>

                  {planModal.exercises && planModal.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-[#e6e2dc] shadow-2xs flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-[#171513]">{ex.name || ex.slug}</h5>
                        <p className="text-[11px] text-[#78716c]">
                          Focus: <span className="text-[#57534e] font-medium">{ex.focusCue || 'Maintain proper posture'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#E87552] bg-[#f6eee9] px-2.5 py-1 rounded-lg border border-[#e6d4c9]">
                          {ex.sets || 3} sets × {ex.reps || 10} reps
                        </span>
                        {onSelectExercise && (
                          <button
                            onClick={() => {
                              setPlanModal(null);
                              onSelectExercise(ex.slug || 'shoulder_press');
                            }}
                            className="px-3 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-800 transition-all"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setPlanModal(null)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Catalog Section */}
      <section id="catalog" ref={catalogRef} className="py-16 border-b border-[#e6e0d8] bg-[#FAF7F2]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <MotionReveal>
            <div className="space-y-8">
              
              {/* Header & Search */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E6E0D8] pb-6">
                <div className="space-y-2 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF1EB] border border-[#F5DDD2] text-[#D95325] text-xs font-bold tracking-wide uppercase">
                    <span>✦</span>
                    <span>EXERCISE CATALOG</span>
                  </div>
                  
                  <h2 className="font-serif-claude text-3xl sm:text-4xl font-bold text-[#171513] tracking-tight">
                    Select an exercise movement
                  </h2>

                  <p className="text-[#655f58] text-sm leading-relaxed font-normal">
                    Review movement guidelines, target muscles, and launch real-time pose tracking.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#8c827a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search exercise or muscle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D8] rounded-full pl-10 pr-4 py-3 text-xs text-[#171513] placeholder-[#8c827a] focus:outline-none focus:border-[#E87552] transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all smooth-press whitespace-nowrap ${
                      selectedCat === cat 
                        ? 'bg-[#171513] text-white shadow-xs' 
                        : 'bg-white text-[#655f58] hover:text-[#171513] hover:bg-[#FAF7F2] border border-[#E6E0D8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Exercise Grid */}
              {filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {filteredExercises.map(ex => (
                    <ExerciseCard key={ex.id} exercise={ex} onSelect={onSelectExercise} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E6E0D8]">
                  <p className="text-[#655f58] text-sm font-medium">No exercise movements found matching your search query.</p>
                </div>
              )}

            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Privacy Section */}
      <PrivacySection />
    </div>
  );
}
