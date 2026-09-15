import { BaseExercise } from "./baseExercise.js";

export class Squat extends BaseExercise {
  constructor() {
    super(
      "squat",
      "Squat",
      "Bodyweight or weighted squat tracking depth and standing lockout.",
      "Quadriceps, Glutes & Core"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 29) return super.process(landmarks);

    const rHip = landmarks[24];
    const rKnee = landmarks[26];
    const rAnkle = landmarks[28];
    const lKnee = landmarks[25];

    this.angle = Math.round(this.calculateAngle(rHip, rKnee, rAnkle));
    this.form_warning = "";

    // Form warning: Knee valgus check
    if (Math.abs(rKnee[0] - lKnee[0]) < Math.abs(rHip[0] - landmarks[23][0]) * 0.7) {
      this.form_warning = "⚠️ Knees caving in! Push knees outward";
    }

    if (this.angle <= 125) {
      if (this.stage === "STANDING" || this.stage === "INACTIVE") {
        this.stage = "SQUATTING";
        this.feedback = "⬇️ Good depth! Push through heels to stand";
      }
    } else if (this.angle >= 155) {
      if (this.stage === "SQUATTING") {
        this.stage = "STANDING";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Squat down again";
        this.addScore(this.form_warning ? 80.0 : 96.0);
      } else if (this.stage === "INACTIVE") {
        this.stage = "STANDING";
        this.feedback = "⬇️ Lower hips to begin squat";
      }
    }

    return super.process(landmarks);
  }
}
