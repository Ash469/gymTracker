import React, { useState, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PrivacySection from '../components/PrivacySection';
import ExerciseCard from '../components/ExerciseCard';
import MotionReveal from '../components/MotionReveal';
import { Search, Dumbbell, Sparkles } from 'lucide-react';

export default function SelectionPage({ exercises, onSelectExercise }) {
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
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <HeroSection
        onExploreCatalog={scrollToCatalog}
        onLaunchTracker={handleLaunchDefaultTracker}
      />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Catalog Section */}
      <section id="catalog" ref={catalogRef} className="space-y-6 pt-4">
        <MotionReveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1 max-w-lg">
              <div className="inline-flex items-center gap-1.5 bg-[#f6eee9] border border-[#e6d4c9] px-2.5 py-0.5 rounded-full text-[#c86343] text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                <Dumbbell className="w-3 h-3 text-[#da7756]" />
                Exercise Movement Catalog
              </div>
              
              <h2 className="font-serif-claude text-2xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
                Select an exercise movement
              </h2>

              <p className="text-[#78716c] text-xs sm:text-sm leading-relaxed font-normal">
                Review movement guidelines, target muscles, and launch real-time pose tracking.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search exercise or target muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#e6e2dc] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:border-[#da7756] transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pt-4 pb-2 scrollbar-none border-b border-[#e6e2dc]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all smooth-press whitespace-nowrap ${
                  selectedCat === cat 
                    ? 'bg-[#1c1917] text-white shadow-2xs' 
                    : 'bg-white text-[#78716c] hover:text-[#1c1917] hover:bg-[#faf8f5] border border-[#e6e2dc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {filteredExercises.map(ex => (
                <ExerciseCard key={ex.id} exercise={ex} onSelect={onSelectExercise} />
              ))}
            </div>
          ) : (
            <div className="claude-card rounded-2xl p-10 text-center space-y-2 border border-[#e6e2dc]">
              <Sparkles className="w-6 h-6 text-[#da7756] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#1c1917]">No matching exercises found</h3>
              <p className="text-xs text-[#78716c]">Try searching for a different exercise term or reset categories.</p>
            </div>
          )}
        </MotionReveal>
      </section>

      {/* Built For Privacy Section */}
      <PrivacySection />
    </div>
  );
}
