import bicep_curl from '../exercises/bicep_curl';
import shoulder_press from '../exercises/shoulder_press';
import tricep_extension from '../exercises/tricep_extension';
import dumbbell_bench_press from '../exercises/dumbbell_bench_press';
import single_arm_dumbbell_row from '../exercises/single_arm_dumbbell_row';
import squat from '../exercises/squat';
import russian_twist from '../exercises/russian_twist';
import lateral_raise from '../exercises/lateral_raise';
import { registry } from './exercises/registry';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

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

/**
 * Get authentication headers with stored JWT token.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('formfit_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponseData(res, fallbackMessage = 'Server error occurred.') {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const rawText = await res.text();
  return { error: rawText || `${fallbackMessage} (${res.status})` };
}

// ── Auth Endpoints ─────────────────────────────────────

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await parseResponseData(res, 'Login failed');
  if (!res.ok) throw new Error(data.error || 'Login failed.');
  if (data.token) {
    localStorage.setItem('formfit_token', data.token);
  }
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await parseResponseData(res, 'Registration failed');
  if (!res.ok) throw new Error(data.error || 'Registration failed.');
  if (data.token) {
    localStorage.setItem('formfit_token', data.token);
  }
  return data;
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await parseResponseData(res, 'Failed to fetch user profile');
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile.');
  return data.user;
}

// ── Exercise Endpoints ─────────────────────────────────

export async function fetchExercises() {
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    if (res.ok) {
      const data = await res.json();
      if (data.exercises && data.exercises.length > 0) {
        const merged = data.exercises.map(ex => {
          const slugKey = ex.slug || ex.name.toLowerCase().replace(/ /g, '_');
          const local = EXERCISES_DATA[slugKey] || EXERCISES_DATA["shoulder_press"];

          return {
            ...local,
            ...ex,
            id: slugKey, // Preserve exercise slug for routing & state machine registry
            dbId: ex.id, // Database UUID
            category: ex.muscleGroup || local.category,
            demo_gif: local?.demo_gif,
            target_muscles: local?.target_muscles || [ex.muscleGroup],
            how_to_perform: local?.how_to_perform || [ex.description],
          };
        });

        return {
          exercises: merged,
          active_exercise_id: merged[0]?.id || "shoulder_press"
        };
      }
    }
  } catch (err) {
    console.warn('[API] Could not fetch exercises from backend, using local fallback:', err.message);
  }

  return {
    exercises: EXERCISES_LIST,
    active_exercise_id: "shoulder_press"
  };
}

export async function fetchExerciseDetails(id) {
  const local = EXERCISES_DATA[id] || EXERCISES_DATA["shoulder_press"];

  try {
    const res = await fetch(`${API_BASE}/exercises/${id}`);
    if (res.ok) {
      const data = await res.json();
      return {
        ...local,
        ...data.exercise,
        id: id,
        demo_gif: local?.demo_gif,
        target_muscles: local?.target_muscles,
        how_to_perform: local?.how_to_perform,
      };
    }
  } catch (err) {
    // Fallback to local exercise objects
  }

  return local;
}

export async function selectExercise(id) {
  const ex = registry.getExercise(id);
  return { status: "success", exercise: ex.getDetails() };
}

// ── Workout Session Endpoints ──────────────────────────

export async function createWorkoutSession() {
  const res = await fetch(`${API_BASE}/workouts`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create workout session.');
  return data.workout;
}

export async function saveWorkoutSet(workoutId, setData) {
  const res = await fetch(`${API_BASE}/workouts/${workoutId}/sets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(setData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save set.');
  return data.set;
}

export async function completeWorkoutSession(workoutId, sessionData = {}) {
  const res = await fetch(`${API_BASE}/workouts/${workoutId}/complete`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(sessionData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete workout session.');
  return data.workout;
}

export async function fetchUserWorkouts() {
  const res = await fetch(`${API_BASE}/workouts`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch workouts.');
  return data.workouts;
}

// ── Progress & Coaching Endpoints ──────────────────────

export async function fetchUserProgress() {
  const res = await fetch(`${API_BASE}/progress`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch progress.');
  return data.progress;
}

export async function requestAICoaching(workoutId) {
  const res = await fetch(`${API_BASE}/coaching/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ workoutId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request AI coaching.');
  return data.coaching;
}

export async function fetchCoachingHistory() {
  const res = await fetch(`${API_BASE}/coaching`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch coaching history.');
  return data.coaching;
}

export async function generateAIWorkoutPlan(planType = 'DAILY') {
  const res = await fetch(`${API_BASE}/coaching/plan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ planType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate AI workout plan.');
  return data.plan;
}

// ── Telemetry & Local Stubs ────────────────────────────

export async function fetchTelemetry() {
  return {
    reps: 0,
    stage: "INACTIVE",
    angle: 0,
    feedback: "POSITION YOURSELF IN CAMERA VIEW",
    active: false,
    form_warning: "",
    form_score: 100.0
  };
}

export async function resetTracker(id = "shoulder_press") {
  const ex = registry.getExercise(id);
  ex.reset();
  return { status: "reset", reps: 0 };
}

export async function fetchSummary(id = "shoulder_press") {
  const ex = registry.getExercise(id);
  return ex.getSummary();
}
