import React, { useState } from 'react';
import ExerciseCard from '../components/ExerciseCard';

export default function SelectionPage({ exercises, onSelectExercise }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core'];

  const filteredExercises = exercises.filter(ex => {
    const matchesCat = selectedCat === 'All' || ex.category === selectedCat;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ex.how_to_perform && ex.how_to_perform.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (ex.target_muscles && ex.target_muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <div className="max-w-3xl space-y-1.5 pt-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
          Posture & Rep Vision Engine
        </span>
        <h2 className="font-serif-claude text-2xl sm:text-3xl font-semibold text-zinc-900 leading-tight">
          Precision form tracking for every repetition.
        </h2>
        <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
          Select an exercise below to view movement guidelines and launch real-time webcam tracking.
        </p>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-zinc-200/80">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCat === cat 
                  ? 'bg-zinc-900 text-white font-semibold shadow-sm' 
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map(ex => (
            <ExerciseCard key={ex.id} exercise={ex} onSelect={onSelectExercise} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center space-y-2 border border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-800">No exercises found</h3>
          <p className="text-xs text-zinc-500">Try searching for a different exercise or selecting "All".</p>
        </div>
      )}
    </div>
  );
}
