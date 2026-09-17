import { BaseExercise } from "./baseExercise.js";

export class BicepCurl extends BaseExercise {
  constructor() {
    super(
      "bicep_curl",
      "Bicep Curl",
      "Dumbbell bicep curl tracking peak contraction and arm extension.",
      "Biceps & Forearms"
    );
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 17) return super.process(landmarks);

    const rShoulder = landmarks[12];
    const rElbow = landmarks[14];
    const rWrist = landmarks[16];

    this.angle = Math.round(this.calculateAngle(rShoulder, rElbow, rWrist));
    this.form_warning = "";

    // Form warning: check if elbow drifts far forward from shoulder
    const elbowDrift = Math.abs(rElbow[0] - rShoulder[0]);
    if (elbowDrift > 80) {
      this.recordWarning('ELBOW_FLARE', '⚠️ Keep elbow pinned to your side!', {
        jointName: 'Elbow',
        measuredAngle: this.angle,
        expectedRange: '35-160',
        severity: 'MEDIUM',
        injuryRisk: 'LOW',
      });
    }

    if (this.angle <= 70) {
      if (this.stage === "DOWN" || this.stage === "INACTIVE" || this.stage === "CURLED") {
        if (this.stage === "DOWN") {
          this.reps += 1;
          this.feedback = "✨ GREAT REP! Lower arm back down";
          this.addScore(elbowDrift > 80 ? 82.0 : 98.0);
        }
        this.stage = "UP";
      }
    } else if (this.angle >= 135) {
      this.stage = "DOWN";
      this.feedback = "⬆️ Curl weight up towards shoulder";
    }

    return super.process(landmarks);
  }
}
