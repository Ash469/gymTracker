import { EXERCISES_DATA } from "../api";

/**
 * Base class for all Client-Side Exercise State Machines.
 */
export class BaseExercise {
  constructor(id, name, description, targetJoint) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.targetJoint = targetJoint;

    this.reps = 0;
    this.stage = "INACTIVE";
    this.feedback = "Position yourself in camera view";
    this.form_warning = "";
    this.form_score = 100.0;
    this.scores = [];
    this.repHistory = [];
    this.startTime = Date.now();
    this.is_active = true;
    this.angle = 0;
    this.warnings = {};
    this.formFeedback = [];
  }

  /**
   * Reset exercise state counter.
   */
  reset() {
    this.reps = 0;
    this.stage = "INACTIVE";
    this.feedback = "Position yourself in camera view";
    this.form_warning = "";
    this.form_score = 100.0;
    this.scores = [];
    this.repHistory = [];
    this.startTime = Date.now();
    this.is_active = true;
    this.angle = 0;
    this.warnings = {};
    this.formFeedback = [];
  }

  /**
   * Record a biomechanical form warning (Aggregated per rep to prevent DB spam).
   */
  recordWarning(errorType, message, options = {}) {
    this.form_warning = message;
    this.warnings[errorType] = (this.warnings[errorType] || 0) + 1;

    const repNum = options.repNumber || (this.reps > 0 ? this.reps : 1);

    const existingIndex = this.formFeedback.findIndex(
      (fb) => fb.repNumber === repNum && fb.errorType === errorType
    );

    if (existingIndex !== -1) {
      const existing = this.formFeedback[existingIndex];
      const newCount = (existing.occurrenceCount || 1) + 1;
      const currentAngle = options.measuredAngle !== undefined ? options.measuredAngle : (this.angle || 0);
      const avgAngle = Math.round(
        ((existing.measuredAngle || 0) * (newCount - 1) + currentAngle) / newCount
      );

      this.formFeedback[existingIndex] = {
        ...existing,
        occurrenceCount: newCount,
        measuredAngle: avgAngle,
        feedbackMessage: message,
      };
    } else {
      this.formFeedback.push({
        repNumber: repNum,
        jointName: options.jointName || this.targetJoint || 'Primary Joint',
        errorType: errorType,
        measuredAngle: options.measuredAngle !== undefined ? options.measuredAngle : (this.angle || 0),
        expectedRange: options.expectedRange || 'FULL_ROM',
        severity: options.severity || 'MEDIUM',
        injuryRisk: options.injuryRisk || 'LOW',
        occurrenceCount: 1,
        feedbackMessage: message,
      });
    }
  }

  /**
   * Calculate 2D angle between three points (A, B, C) where B is the vertex.
   * @param {Array<number>} a - [x, y]
   * @param {Array<number>} b - [x, y] vertex
   * @param {Array<number>} c - [x, y]
   * @returns {number} Angle in degrees (0 - 180)
   */
  calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  }

  /**
   * Calculate 3D spatial vector angle between three 3D points [x, y, z].
   * Independent of camera distance & perspective tilt.
   */
  calculate3DAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const v1 = [a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0)];
    const v2 = [c[0] - b[0], c[1] - b[1], (c[2] || 0) - (b[2] || 0)];

    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2);

    if (mag1 * mag2 === 0) return 0;
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
    return Math.round((Math.acos(cosAngle) * 180.0) / Math.PI);
  }

  /**
   * Calculate Spinal Posture Angle (Shoulder - Hip - Knee alignment)
   * Ideal upright posture is ~170° - 180°. Angles < 145° indicate spinal rounding / bending.
   */
  calculateSpineAngle(landmarks) {
    if (!landmarks || landmarks.length < 27) return 180;
    const shoulder = landmarks[11] || landmarks[12];
    const hip = landmarks[23] || landmarks[24];
    const knee = landmarks[25] || landmarks[26];
    if (!shoulder || !hip || !knee) return 180;
    return this.calculateAngle(shoulder, hip, knee);
  }

  /**
   * Calculate Bi-Lateral Symmetry Index (0 - 100%) between left and right joint angles
   */
  calculateSymmetryScore(leftAngle, rightAngle) {
    if (leftAngle === 0 || rightAngle === 0) return 100;
    const diff = Math.abs(leftAngle - rightAngle);
    const maxAngle = Math.max(leftAngle, rightAngle, 1);
    const symmetryRatio = Math.max(0, 100 - (diff / maxAngle) * 100);
    return Math.round(symmetryRatio);
  }

  /**
   * Calculate 2D Euclidean distance between two points A and B.
   */
  calculateDistance(a, b) {
    if (!a || !b) return 0;
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  /**
   * Record rep score and calculate running average & history.
   */
  addScore(score = 95.0) {
    this.logRep(score);
  }

  logRep(score = 95.0) {
    const clamped = Math.max(50.0, Math.min(100.0, score));
    this.scores.push(clamped);
    this.form_score = Number(
      (this.scores.reduce((sum, s) => sum + s, 0) / this.scores.length).toFixed(1)
    );
    this.repHistory.push({
      rep: this.reps,
      quality: clamped >= 85 ? "Good" : "Needs Work",
      score: Math.round(clamped),
    });
  }

  /**
   * Overridden by exercise subclasses.
   */
  process(landmarks) {
    return {
      reps: this.reps,
      stage: this.stage,
      angle: this.angle,
      feedback: this.feedback,
      active: this.is_active,
      warning: this.form_warning,
      form_score: this.form_score,
    };
  }

  getDetails() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      target_joint: this.targetJoint,
    };
  }

  getSummary() {
    const elapsedSecs = this.startTime ? Math.max(1, Math.round((Date.now() - this.startTime) / 1000)) : 0;
    const calories = Math.round(this.reps * 0.45);
    const exerciseMeta = EXERCISES_DATA[this.id] || {};

    const feedbackList = [...this.formFeedback];
    if (feedbackList.length === 0) {
      feedbackList.push({
        repNumber: Math.max(1, this.reps),
        jointName: this.targetJoint || 'Primary Joint',
        errorType: 'OPTIMAL_FORM',
        measuredAngle: this.angle || 90,
        expectedRange: 'FULL_ROM',
        severity: 'LOW',
        injuryRisk: 'LOW',
        occurrenceCount: Math.max(1, this.reps),
        feedbackMessage: 'Great execution! Maintain steady tempo and proper alignment.',
      });
    }

    return {
      id: this.id,
      exercise_id: this.id,
      name: exerciseMeta.name || this.name,
      exercise_name: exerciseMeta.name || this.name,
      reps: this.reps,
      form_score: Math.round(this.form_score),
      avg_score: Math.round(this.form_score),
      best_score: this.scores.length > 0 ? Math.max(...this.scores) : 100.0,
      lowest_score: this.scores.length > 0 ? Math.min(...this.scores) : 100.0,
      duration_seconds: elapsedSecs,
      calories_burned: calories,
      target_muscles: exerciseMeta.target_muscles || [this.targetJoint],
      rep_history: this.repHistory || [],
      warnings: this.warnings || {},
      formFeedback: feedbackList,
    };
  }
}
