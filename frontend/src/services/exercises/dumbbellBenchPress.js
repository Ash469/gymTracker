import { BaseExercise } from "./baseExercise.js";

export class DumbbellBenchPress extends BaseExercise {
  constructor() {
    super(
      "dumbbell_bench_press",
      "Dumbbell Bench Press",
      "Flat bench press tracking chest lockout and lower chest stretch.",
      "Pectorals & Triceps"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];

    this.angle = Math.round(this.calculateAngle(rShoulder, rElbow, rWrist));

    if (this.angle <= 85) {
      if (this.stage === "LOCKOUT" || this.stage === "INACTIVE") {
        this.stage = "BOTTOM";
        this.feedback = "⬆️ Press dumbbells straight up";
      }
    } else if (this.angle >= 140) {
      if (this.stage === "BOTTOM") {
        this.stage = "LOCKOUT";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Lower back to chest";
        this.addScore(95.0);
      }
    }

    return super.process(landmarks);
  }
}
