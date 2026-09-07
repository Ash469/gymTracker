import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class CalfRaise(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="calf_raise",
            name="Standing Calf Raise",
            category="Calves",
            met_value=3.5
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 32:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        # Left leg: knee (25), ankle (27), foot_index (31), hip (23)
        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_knee = [landmarks[25][1], landmarks[25][2]]
        l_ankle = [landmarks[27][1], landmarks[27][2]]
        l_foot = [landmarks[31][1], landmarks[31][2]]
        
        angle = calculate_angle(l_knee, l_ankle, l_foot)
        knee_bend_angle = calculate_angle(l_hip, l_knee, l_ankle)
        is_good_form = True
        self.form_warning = ""

        # Knee Bending Guardrail (knee flexion during calf extension)
        if knee_bend_angle < 150:
            self.form_warning = "WARNING: Knees bending! Keep legs straight throughout calf raise"
            is_good_form = False

        # Hold flat foot stance (85-110 deg) for 2s to activate
        if not self.active:
            if 85 <= angle <= 110:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! RAISE UP ONTO TOES (>130°)"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "STAND FLAT ON FEET TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep Counting
        if angle > 130:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "PEAK CALF EXTENSION (>130°)! LOWER HEELS SLOWLY"
        elif 80 <= angle <= 105:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT CALF RAISE REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "RAISE HEELS OFF FLOOR"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
