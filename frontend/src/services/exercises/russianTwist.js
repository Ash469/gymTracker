import { BaseExercise } from "./baseExercise.js";

export class RussianTwist extends BaseExercise {
  constructor() {
    super(
      "russian_twist",
      "Russian Twist",
      "Core rotational exercise tracking torso twist angles.",
      "Abdominals & Obliques"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const rHip = landmarks[24];

    this.angle = Math.round(this.calculateAngle(lShoulder, rHip, rShoulder));

    if (this.angle > 45) {
      if (this.stage === "RIGHT" || this.stage === "INACTIVE") {
        this.stage = "LEFT";
        this.reps += 1;
        this.feedback = "✨ Rotate to opposite side";
        this.addScore(93.0);
      }
    } else if (this.angle < 20) {
      if (this.stage === "LEFT") {
        this.stage = "RIGHT";
        this.reps += 1;
        this.feedback = "✨ Rotate to opposite side";
        this.addScore(93.0);
      }
    }

    return super.process(landmarks);
  }
}
