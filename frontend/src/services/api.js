import bicep_curl from '../exercises/bicep_curl';
import shoulder_press from '../exercises/shoulder_press';
import tricep_extension from '../exercises/tricep_extension';
import dumbbell_bench_press from '../exercises/dumbbell_bench_press';
import single_arm_dumbbell_row from '../exercises/single_arm_dumbbell_row';
import squat from '../exercises/squat';
import russian_twist from '../exercises/russian_twist';
import lateral_raise from '../exercises/lateral_raise';
import { registry } from './exercises/registry';

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

export async function fetchExercises() {
  return {
    exercises: EXERCISES_LIST,
    active_exercise_id: "shoulder_press"
  };
}

export async function fetchExerciseDetails(id) {
  return EXERCISES_DATA[id] || EXERCISES_DATA["shoulder_press"];
}

export async function selectExercise(id) {
  const ex = registry.getExercise(id);
  return { status: "success", exercise: ex.getDetails() };
}

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
