import bicep_curl from '../exercises/bicep_curl';
import shoulder_press from '../exercises/shoulder_press';
import tricep_extension from '../exercises/tricep_extension';
import dumbbell_bench_press from '../exercises/dumbbell_bench_press';
import single_arm_dumbbell_row from '../exercises/single_arm_dumbbell_row';
import squat from '../exercises/squat';
import russian_twist from '../exercises/russian_twist';
import lateral_raise from '../exercises/lateral_raise';

export const EXERCISES_DATA = {
  bicep_curl,
  shoulder_press,
  tricep_extension,
  dumbbell_bench_press,
  single_arm_dumbbell_row,
  squat,
  russian_twist,
  lateral_raise
};

export const EXERCISES_LIST = Object.values(EXERCISES_DATA);

const API_BASE = '/api';

export async function fetchExercises() {
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    
    // Merge UI metadata from EXERCISES_DATA into backend list
    const exercises = (data.exercises || [])
      .filter(ex => Boolean(EXERCISES_DATA[ex.id]))
      .map(ex => ({
        ...ex,
        ...(EXERCISES_DATA[ex.id] || {})
      }));

    const validActiveId = EXERCISES_DATA[data.active_exercise_id] ? data.active_exercise_id : "bicep_curl";
    return { exercises: exercises.length > 0 ? exercises : EXERCISES_LIST, active_exercise_id: validActiveId };
  } catch (err) {
    console.warn("Using React exercises dataset:", err);
    return {
      exercises: EXERCISES_LIST,
      active_exercise_id: "bicep_curl"
    };
  }
}

export async function fetchExerciseDetails(id) {
  const localDetails = EXERCISES_DATA[id] || EXERCISES_DATA["bicep_curl"];
  try {
    const res = await fetch(`${API_BASE}/exercise/${id}`);
    if (!res.ok) throw new Error('Failed to fetch exercise details');
    const data = await res.json();
    return {
      ...data,
      ...localDetails
    };
  } catch (err) {
    return localDetails;
  }
}

export async function selectExercise(id) {
  try {
    const res = await fetch(`${API_BASE}/select_exercise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: id }),
    });
    if (!res.ok) throw new Error('Failed to select exercise');
    return await res.json();
  } catch (err) {
    console.warn("Select exercise request fallback:", err);
    return { status: "success" };
  }
}

export async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return await res.json();
  } catch (err) {
    return {
      reps: 0,
      stage: "INACTIVE",
      angle: 0,
      feedback: "CONNECTING TO ENGINE...",
      active: false,
      form_warning: "",
      form_score: 100.0
    };
  }
}

export async function resetTracker() {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset tracker');
    return await res.json();
  } catch (err) {
    return { status: "reset", reps: 0 };
  }
}

export async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    return {
      id: "bicep_curl",
      name: "Bicep Curl",
      category: "Biceps",
      reps: 0,
      form_score: 100.0,
      duration_seconds: 0,
      calories_burned: 0,
      target_muscles: ["Biceps Brachii"],
      rep_history: []
    };
  }
}

const BACKEND_API = '/api/v1';
const TOKEN_KEY = 'formfit_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function loginUser(email, password) {
  const res = await fetch(`${BACKEND_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setStoredToken(data.token);
  return data; // { user, token }
}

export async function registerUser({ name, email, password, fitnessLevel, primaryGoal, workoutFrequency }) {
  const res = await fetch(`${BACKEND_API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, fitnessLevel, primaryGoal, workoutFrequency }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  setStoredToken(data.token);
  return data; // { user, token }
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BACKEND_API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    } else {
      setStoredToken(null);
      return null;
    }
  } catch (err) {
    console.warn('Error fetching current user:', err);
    return null;
  }
}

export async function logoutUser() {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${BACKEND_API}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (_) {}
  }
  setStoredToken(null);
}

export async function getAuthToken() {
  const stored = getStoredToken();
  if (stored) return stored;
  try {
    const res = await fetch(`${BACKEND_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@formfit.com', password: 'Demo1234!' })
    });
    if (res.ok) {
      const data = await res.json();
      setStoredToken(data.token);
      return data.token;
    }
  } catch (err) {
    console.warn('Auto auth error:', err);
  }
  return null;
}

export async function saveWorkoutSession(summaryData, exerciseId) {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    // 1. Fetch backend exercise list to match UUID
    const exRes = await fetch(`${BACKEND_API}/exercises`);
    let targetExerciseId = null;
    if (exRes.ok) {
      const exData = await exRes.json();
      const match = (exData.exercises || []).find(e => 
        e.id === exerciseId || 
        e.name.toLowerCase().replace(/[\s_-]+/g, '') === (exerciseId || '').toLowerCase().replace(/[\s_-]+/g, '')
      );
      if (match) targetExerciseId = match.id;
    }

    if (!targetExerciseId) return null;

    // 2. Create active workout
    const workoutRes = await fetch(`${BACKEND_API}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!workoutRes.ok) return null;
    const { workout } = await workoutRes.json();

    const avgScore = summaryData.form_score || 100;
    const scores = (summaryData.rep_history || [])
      .map(r => r.score || (r.quality === 'Good' ? 100 : 75))
      .filter(s => typeof s === 'number');

    const bestScore = scores.length > 0 ? Math.max(...scores) : avgScore;
    const worstScore = scores.length > 0 ? Math.min(...scores) : avgScore;
    const durationSeconds = summaryData.duration_seconds || 0;

    // 3. Add set to workout
    await fetch(`${BACKEND_API}/workouts/${workout.id}/sets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        exerciseId: targetExerciseId,
        reps: summaryData.reps || 0,
        averageScore: avgScore,
        bestScore,
        worstScore,
        duration: durationSeconds
      })
    });

    // 4. Mark workout complete
    const completeRes = await fetch(`${BACKEND_API}/workouts/${workout.id}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        duration: durationSeconds
      })
    });
    return await completeRes.json();
  } catch (err) {
    console.error('Failed to persist workout to database:', err);
    return null;
  }
}
