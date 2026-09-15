import { BaseExercise } from "./baseExercise.js";

export class TricepExtension extends BaseExercise {
  constructor() {
    super(
      "tricep_extension",
      "Tricep Extension",
      "Overhead dumbbell tricep extension tracking elbow extension.",
      "Triceps"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];

    this.angle = Math.round(this.calculateAngle(rShoulder, rElbow, rWrist));

    if (this.angle <= 80) {
      if (this.stage === "EXTENDED" || this.stage === "INACTIVE") {
        this.stage = "FLEXED";
        this.feedback = "⬆️ Extend arms overhead";
      }
    } else if (this.angle >= 140) {
      if (this.stage === "FLEXED") {
        this.stage = "EXTENDED";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Lower weight behind head";
        this.addScore(95.0);
      }
    }

    return super.process(landmarks);
  }
}
