import React, { useState, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PrivacySection from '../components/PrivacySection';
import ExerciseCard from '../components/ExerciseCard';
import MotionReveal from '../components/MotionReveal';
import { Search, Dumbbell } from 'lucide-react';

export default function Home({ exercises, onSelectExercise }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const catalogRef = useRef(null);

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

      {/* AWS Bedrock AI Growth Coach & Workout Planner Banner */}
      <section className="py-10 bg-[#fdfaf7] border-b border-[#e6e0d8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <div className="claude-card bg-white border border-[#e6d4c9] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6eee9] text-[#E87552] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#e6d4c9]">
                <span>✦</span>
                <span>AWS Bedrock Mode A Coach</span>
              </div>
              <h3 className="font-serif-claude text-2xl font-bold text-[#171513]">
                AI Daily Workout & Form Correction Plan
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                AWS Bedrock scans your past workout history, form accuracy scores, and joint warning patterns to build a personalized workout plan for your goal.
              </p>
            </div>

            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('formfit_token');
                  if (!token) {
                    alert('Please Sign In first to generate your personalized AI workout plan.');
                    return;
                  }
                  const { generateAIWorkoutPlan } = await import('../services/api');
                  const plan = await generateAIWorkoutPlan('DAILY');
                  alert(`✦ AWS Bedrock Plan Generated:\n\nTitle: ${plan.title}\nReasoning: ${plan.aiReasoning}\n\nExercises Recommended:\n` + 
                    (plan.exercises ? plan.exercises.map(e => `• ${e.name || e.slug}: ${e.sets || 3} sets x ${e.reps || 10} reps (${e.focusCue || 'Maintain form'})`).join('\n') : 'All set!'));
                } catch (err) {
                  alert(`AI Plan: ${err.message}`);
                }
              }}
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:bg-[#d4603c] shrink-0 smooth-press flex items-center gap-2"
              style={{ background: '#E87552' }}
            >
              <span>Generate AI Plan</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

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
