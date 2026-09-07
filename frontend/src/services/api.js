import bicep_curl from '../exercises/bicep_curl';
import shoulder_press from '../exercises/shoulder_press';
import tricep_extension from '../exercises/tricep_extension';
import dumbbell_bench_press from '../exercises/dumbbell_bench_press';
import single_arm_dumbbell_row from '../exercises/single_arm_dumbbell_row';
import squat from '../exercises/squat';
import russian_twist from '../exercises/russian_twist';
import lateral_raise from '../exercises/lateral_raise';
import calf_raise from '../exercises/calf_raise';

export const EXERCISES_DATA = {
  bicep_curl,
  shoulder_press,
  tricep_extension,
  dumbbell_bench_press,
  single_arm_dumbbell_row,
  squat,
  russian_twist,
  lateral_raise,
  calf_raise
};

export const EXERCISES_LIST = Object.values(EXERCISES_DATA);

const API_BASE = '/api';

export async function fetchExercises() {
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    
    // Merge UI metadata from EXERCISES_DATA into backend list
    const exercises = (data.exercises || []).map(ex => ({
      ...ex,
      ...(EXERCISES_DATA[ex.id] || {})
    }));

    return { exercises: exercises.length > 0 ? exercises : EXERCISES_LIST, active_exercise_id: data.active_exercise_id || "bicep_curl" };
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
