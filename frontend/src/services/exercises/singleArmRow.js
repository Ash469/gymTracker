import { BaseExercise } from "./baseExercise.js";

export class SingleArmDumbbellRow extends BaseExercise {
  constructor() {
    super(
      "single_arm_dumbbell_row",
      "Single-Arm Dumbbell Row",
      "One-arm row tracking elbow contraction into the hip.",
      "Latissimus Dorsi & Back"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];

    this.angle = Math.round(this.calculateAngle(rShoulder, rElbow, rWrist));

    if (this.angle <= 75) {
      if (this.stage === "EXTENDED" || this.stage === "INACTIVE") {
        this.stage = "PULLED";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Lower arm under control";
        this.addScore(95.0);
      }
    } else if (this.angle >= 135) {
      this.stage = "EXTENDED";
      this.feedback = "⬆️ Pull elbow back towards hip";
    }

    return super.process(landmarks);
  }
}
