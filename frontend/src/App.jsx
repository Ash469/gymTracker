import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TutorialPage from './pages/TutorialPage';
import TrackerPage from './pages/TrackerPage';
import SummaryPage from './pages/SummaryPage';
import ProfilePage from './pages/ProfilePage';
import {
  fetchExercises,
  fetchExerciseDetails,
  selectExercise,
  fetchSummary,
  resetTracker,
  createWorkoutSession,
  saveWorkoutSet,
  completeWorkoutSession,
  requestAICoaching,
  fetchUserProfile
} from './services/api';

// Helper to parse current window location URL pathname into structured route object
function parseLocationPath(pathname) {
  const path = pathname || '/';
  const parts = path.split('/').filter(Boolean);

  // Pattern: /profile
  if (parts[0] === 'profile') {
    return { view: 'profile', exerciseId: null, path: '/profile' };
  }

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
  const [summary, setSummary] = useState(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [aiCoachingResult, setAiCoachingResult] = useState(null);
  const [user, setUser] = useState(null);

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

  // On initial mount, restore authenticated user session from stored JWT if valid
  useEffect(() => {
    const token = localStorage.getItem('formfit_token');
    if (token) {
      fetchUserProfile()
        .then(userData => setUser(userData))
        .catch(err => {
          console.warn('[Auth] Stored session expired or invalid:', err.message);
          localStorage.removeItem('formfit_token');
          setUser(null);
        });
    }
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

    fetchExerciseDetails(route.exerciseId)
      .then(data => setSelectedExercise(data))
      .catch(err => console.error(`Error loading exercise ${route.exerciseId}:`, err));

    if (route.view === 'track') {
      selectExercise(route.exerciseId).catch(err => console.error("Error initializing model:", err));
    }
  }, [route.view, route.exerciseId]);

  // Handlers
  const handleSelectExercise = (exerciseId) => {
    navigate(`/exercise/${exerciseId}/guide`);
  };

  const handleStartWorkout = async () => {
    if (route.exerciseId) {
      resetTracker(route.exerciseId);
      
      const token = localStorage.getItem('formfit_token');
      if (token) {
        try {
          const session = await createWorkoutSession();
          setActiveWorkoutId(session.id);
        } catch (err) {
          console.warn('[Workout] Could not create backend session:', err.message);
        }
      }
      
      navigate(`/exercise/${route.exerciseId}/track`);
    }
  };

  const handleFinishWorkout = async (summaryData) => {
    let finalSummary = summaryData;
    if (!finalSummary && route.exerciseId) {
      finalSummary = await fetchSummary(route.exerciseId);
    }
    setSummary(finalSummary);

    const token = localStorage.getItem('formfit_token');

    if (token && finalSummary) {
      try {
        let sessionId = activeWorkoutId;
        if (!sessionId) {
          const newSession = await createWorkoutSession();
          sessionId = newSession.id;
        }

        await saveWorkoutSet(sessionId, {
          exerciseId: route.exerciseId,
          reps: finalSummary.reps || 0,
          weight: finalSummary.weight || 0.0,
          caloriesBurned: finalSummary.calories_burned || 0,
          averageScore: finalSummary.form_score || 85.0,
          bestScore: finalSummary.best_score || finalSummary.form_score || 90.0,
          worstScore: finalSummary.lowest_score || Math.max((finalSummary.form_score || 85.0) - 15, 50),
          duration: finalSummary.duration_seconds || 30,
          errors: finalSummary.warnings || {},
          formFeedback: finalSummary.formFeedback || [],
        });

        await completeWorkoutSession(sessionId, {
          duration: finalSummary.duration_seconds || 30,
        });

        // Request AI coaching recommendation
        try {
          const coaching = await requestAICoaching(sessionId);
          setAiCoachingResult(coaching);
        } catch (err) {
          console.warn('[AI] Coaching request skipped:', err.message);
        }
      } catch (err) {
        console.error('[Workout] Error persisting workout set to PostgreSQL:', err);
      } finally {
        setActiveWorkoutId(null);
      }
    }

    if (route.exerciseId) {
      navigate(`/exercise/${route.exerciseId}/summary`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900">
      <Navbar 
        route={route} 
        navigate={navigate} 
        user={user}
        setUser={setUser}
        onGetStarted={() => {
          if (user) {
            navigate('/profile');
          } else if (route.view !== 'selection') {
            navigate('/');
          } else {
            setTimeout(() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }} 
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-12 flex-1">
        {route.view === 'selection' && (
          <Home
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
            onFinishWorkout={handleFinishWorkout}
            onSwitchExercise={() => navigate('/')}
          />
        )}

        {route.view === 'summary' && (
          <SummaryPage
            summary={summary}
            aiCoaching={aiCoachingResult}
            onTrainAnother={() => navigate('/')}
            onRetry={() => handleStartWorkout()}
          />
        )}

        {route.view === 'profile' && (
          <ProfilePage
            user={user}
            onLogout={() => {
              localStorage.removeItem('formfit_token');
              setUser(null);
              navigate('/');
            }}
            onSelectExercise={handleSelectExercise}
          />
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
