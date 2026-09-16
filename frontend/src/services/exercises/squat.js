import { BaseExercise } from "./baseExercise.js";

export class Squat extends BaseExercise {
  constructor() {
    super(
      "squat",
      "Squat",
      "Bodyweight or weighted squat tracking depth, knee alignment, and spine posture.",
      "Quadriceps, Glutes & Core"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 29) return super.process(landmarks);

    const rHip = landmarks[24];
    const rKnee = landmarks[26];
    const rAnkle = landmarks[28];

    const lHip = landmarks[23];
    const lKnee = landmarks[25];
    const lAnkle = landmarks[27];

    const rShoulder = landmarks[12];

    // 1. Calculate 3D Joint Angles for both knees
    const rKneeAngle = this.calculate3DAngle(rHip, rKnee, rAnkle);
    const lKneeAngle = this.calculate3DAngle(lHip, lKnee, lAnkle);

    this.angle = rKneeAngle;

    // 2. Calculate Spinal Posture Angle (Shoulder - Hip - Knee alignment)
    const spineAngle = this.calculateAngle(rShoulder, rHip, rKnee);
    
    // 3. Calculate Bi-Lateral Symmetry Index
    const symmetryScore = this.calculateSymmetryScore(rKneeAngle, lKneeAngle);

    this.form_warning = "";

    // Posture Checks:
    // Check A: Back posture flexion (Excessive forward lean / back rounding)
    if (spineAngle < 135 && this.angle < 130) {
      this.form_warning = "⚠️ Chest collapsing! Keep chest up & spine straight";
    }
    // Check B: Knee valgus / collapse inward
    else if (Math.abs(rKnee[0] - lKnee[0]) < Math.abs(rHip[0] - lHip[0]) * 0.75) {
      this.form_warning = "⚠️ Knees caving in! Push knees outward over toes";
    }
    // Check C: Bi-lateral weight imbalance
    else if (symmetryScore < 75) {
      this.form_warning = `⚠️ Asymmetric stance (${symmetryScore}% balance)! Distribute weight evenly`;
    }

    // Rep State Machine
    if (this.angle <= 115) {
      if (this.stage === "STANDING" || this.stage === "INACTIVE") {
        this.stage = "SQUATTING";
        this.feedback = "⬇️ Good depth! Drive through heels to stand";
      }
    } else if (this.angle >= 160) {
      if (this.stage === "SQUATTING") {
        this.stage = "STANDING";
        this.reps += 1;
        const repScore = this.form_warning ? 78.0 : (this.angle <= 95 ? 98.0 : 92.0);
        this.feedback = "✨ GREAT REP! Lower down for next rep";
        this.addScore(repScore);
      } else if (this.stage === "INACTIVE") {
        this.stage = "STANDING";
        this.feedback = "⬇️ Lower hips to begin squat";
      }
    }

    const baseResult = super.process(landmarks);
    return {
      ...baseResult,
      spine_angle: spineAngle,
      symmetry_score: symmetryScore,
      back_posture: spineAngle >= 140 ? "Straight" : "Warning",
    };
  }
}
