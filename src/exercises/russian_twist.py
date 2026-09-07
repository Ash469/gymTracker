import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class DumbbellRussianTwist(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="russian_twist",
            name="Dumbbell Russian Twist",
            category="Core",
            met_value=3.8
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 17:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        r_shoulder = [landmarks[12][1], landmarks[12][2]]
        l_wrist = [landmarks[15][1], landmarks[15][2]]
        l_hip = [landmarks[23][1], landmarks[23][2]] if len(landmarks) > 23 else None
        
        angle = calculate_angle(l_shoulder, r_shoulder, l_wrist)
        is_good_form = True
        self.form_warning = ""

        # Spine Collapse / Arm Only Movement Guardrail
        if l_hip:
            torso_incline = calculate_angle(l_shoulder, l_hip, [l_hip[0], l_hip[1] + 100])
            if torso_incline < 25:
                self.form_warning = "WARNING: Spine collapse / rounding lower back! Maintain 45° incline"
                is_good_form = False

        # Activation logic
        if not self.active:
            if self.hold_start_time is None:
                self.hold_start_time = time.time()
            elapsed = time.time() - self.hold_start_time
            remaining = max(0.0, self.required_hold_duration - elapsed)

            if elapsed >= self.required_hold_duration:
                self.active = True
                self.stage = "RIGHT"
                self.feedback = "TRACKING ACTIVE! ROTATE TORSO SIDE TO SIDE"
                self.hold_start_time = None
                if not self.start_workout_time:
                    self.start_workout_time = time.time()
            else:
                self.feedback = f"HOLD POSTURE TO START: {remaining:.1f}s"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep counting based on left/right side transitions
        if angle < 60:
            if self.stage == "RIGHT":
                self.counter += 1
                self.stage = "LEFT"
                self.feedback = "TWIST TO RIGHT SIDE"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
        elif angle > 110:
            if self.stage == "LEFT":
                self.counter += 1
                self.stage = "RIGHT"
                self.feedback = "TWIST TO LEFT SIDE"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
