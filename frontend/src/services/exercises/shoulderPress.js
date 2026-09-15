import { BaseExercise } from "./baseExercise.js";

export class ShoulderPress extends BaseExercise {
  constructor() {
    super(
      "shoulder_press",
      "Shoulder Press",
      "Overhead dumbbell/barbell shoulder press tracking lockout and elbow positioning.",
      "Shoulders & Triceps"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    // Landmarks: 11/12 (shoulders), 13/14 (elbows), 15/16 (wrists)
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lElbow = landmarks[13];
    const rElbow = landmarks[14];
    const lWrist = landmarks[15];
    const rWrist = landmarks[16];

    const lAngle = this.calculateAngle(lShoulder, lElbow, lWrist);
    const rAngle = this.calculateAngle(rShoulder, rElbow, rWrist);
    this.angle = Math.round((lAngle + rAngle) / 2.0);

    this.form_warning = "";

    // Check symmetry warning
    if (Math.abs(lAngle - rAngle) > 22.0) {
      this.form_warning = "⚠️ Uneven press! Push both arms evenly";
    }

    // State machine logic
    if (this.angle <= 105) {
      if (this.stage === "LOCKOUT" || this.stage === "ASCENDING" || this.stage === "INACTIVE") {
        this.stage = "BOTTOM";
        this.feedback = "⬇️ Good bottom position! Now press overhead";
      }
    } else if (this.angle >= 140) {
      if (this.stage === "BOTTOM" || this.stage === "DESCENDING") {
        this.stage = "LOCKOUT";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Lower back to shoulders";
        const repScore = Math.max(70.0, 100.0 - Math.abs(lAngle - rAngle) * 0.8);
        this.addScore(repScore);
      } else if (this.stage === "INACTIVE") {
        this.stage = "LOCKOUT";
        this.feedback = "⬇️ Lower hands to shoulders to start rep";
      }
    } else {
      if (this.stage === "LOCKOUT") {
        this.stage = "DESCENDING";
        this.feedback = "⬇️ Lowering smoothly...";
      } else if (this.stage === "BOTTOM") {
        this.stage = "ASCENDING";
        this.feedback = "⬆️ Pressing overhead!";
      }
    }

    return super.process(landmarks);
  }
}
