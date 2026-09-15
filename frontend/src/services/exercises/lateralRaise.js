import { BaseExercise } from "./baseExercise.js";

export class LateralRaise extends BaseExercise {
  constructor() {
    super(
      "lateral_raise",
      "Lateral Raise",
      "Dumbbell side raise tracking shoulder height elevation.",
      "Side Deltoids"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const rHip = landmarks[24];
    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];

    this.angle = Math.round(this.calculateAngle(rHip, rShoulder, rElbow));

    if (this.angle >= 80) {
      if (this.stage === "DOWN" || this.stage === "INACTIVE") {
        this.stage = "UP";
        this.reps += 1;
        this.feedback = "✨ GREAT REP! Control the descent";
        this.addScore(94.0);
      }
    } else if (this.angle <= 30) {
      this.stage = "DOWN";
      this.feedback = "⬆️ Raise weights to shoulder level";
    }

    return super.process(landmarks);
  }
}
