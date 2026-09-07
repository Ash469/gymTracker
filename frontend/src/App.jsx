import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SelectionPage from './pages/SelectionPage';
import TutorialPage from './pages/TutorialPage';
import TrackerPage from './pages/TrackerPage';
import SummaryPage from './pages/SummaryPage';
import {
  fetchExercises,
  fetchExerciseDetails,
  selectExercise,
  fetchTelemetry,
  resetTracker,
  fetchSummary
} from './services/api';

// Helper to parse current window location URL pathname into structured route object
function parseLocationPath(pathname) {
  const path = pathname || '/';
  const parts = path.split('/').filter(Boolean);

  // Pattern: / -> Catalog
  if (parts.length === 0 || parts[0] === 'exercises') {
    return { view: 'selection', exerciseId: null, path: '/' };
  }

  // Pattern: /exercise/:id/guide
  if (parts[0] === 'exercise' && parts[1]) {
    const exerciseId = parts[1];
    const action = parts[2] || 'guide'; // default to guide if /exercise/:id
    return { view: action, exerciseId, path: `/exercise/${exerciseId}/${action}` };
  }

  return { view: 'selection', exerciseId: null, path: '/' };
}

export default function App() {
  const [route, setRoute] = useState(() => parseLocationPath(window.location.pathname));
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [telemetry, setTelemetry] = useState({
    reps: 0, stage: 'INACTIVE', angle: 0, feedback: '', active: false, form_warning: '', form_score: 100
  });
  const [summary, setSummary] = useState(null);

  // Navigation router function with HTML5 History API
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(parseLocationPath(path));
  };

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseLocationPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch exercise catalog on mount
  useEffect(() => {
    fetchExercises()
      .then(data => setExercises(data.exercises))
      .catch(err => console.error("Error fetching exercise catalog:", err));
  }, []);

  // Exercise Model Lazy Loading & Route Synchronization
  useEffect(() => {
    if (!route.exerciseId) return;

    // Load exercise details for the target URL parameter
    fetchExerciseDetails(route.exerciseId)
      .then(data => setSelectedExercise(data))
      .catch(err => console.error(`Error loading exercise ${route.exerciseId}:`, err));

    // When navigating to live tracker route /exercise/:id/track, initialize ONLY that exercise model on backend
    if (route.view === 'track') {
      selectExercise(route.exerciseId).catch(err => console.error("Error initializing model on backend:", err));
    }
  }, [route.view, route.exerciseId]);

  // Telemetry Polling (Active ONLY on /exercise/:id/track route)
  useEffect(() => {
    if (route.view !== 'track') return;

    const interval = setInterval(() => {
      fetchTelemetry()
        .then(data => setTelemetry(data))
        .catch(() => {});
    }, 200);

    return () => clearInterval(interval);
  }, [route.view]);

  // Handlers
  const handleSelectExercise = (exerciseId) => {
    navigate(`/exercise/${exerciseId}/guide`);
  };

  const handleStartWorkout = () => {
    if (route.exerciseId) {
      navigate(`/exercise/${route.exerciseId}/track`);
    }
  };

  const handleResetCounter = () => {
    resetTracker();
  };

  const handleFinishWorkout = () => {
    fetchSummary().then(data => {
      setSummary(data);
      if (route.exerciseId) {
        navigate(`/exercise/${route.exerciseId}/summary`);
      } else {
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Navbar route={route} navigate={navigate} />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-12 flex-1">
        {route.view === 'selection' && (
          <SelectionPage
            exercises={exercises}
            onSelectExercise={handleSelectExercise}
          />
        )}

        {(route.view === 'guide' || route.view === 'tutorial') && (
          <TutorialPage
            exercise={selectedExercise}
            onStartWorkout={handleStartWorkout}
            onBack={() => navigate('/')}
          />
        )}

        {route.view === 'track' && (
          <TrackerPage
            exercise={selectedExercise}
            telemetry={telemetry}
            onReset={handleResetCounter}
            onFinishWorkout={handleFinishWorkout}
            onSwitchExercise={() => navigate('/')}
          />
        )}

        {route.view === 'summary' && (
          <SummaryPage
            summary={summary}
            onTrainAnother={() => navigate('/')}
            onRetry={() => handleStartWorkout()}
          />
        )}
      </main>
    </div>
  );
}
