import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class LateralRaise(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="lateral_raise",
            name="Dumbbell Lateral Raise",
            category="Shoulders",
            met_value=3.5
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 17:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        l_elbow = [landmarks[13][1], landmarks[13][2]]
        
        angle = calculate_angle(l_hip, l_shoulder, l_elbow)
        is_good_form = True
        self.form_warning = ""

        # Excessive Height / Impingement Guardrail (>105°)
        if angle > 105:
            self.form_warning = "WARNING: Raising arms above shoulder plane (>100°)! Keep in T-shape at shoulder height"
            is_good_form = False

        # Hold rest posture (<25 deg) for 2s
        if not self.active:
            if angle < 25:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! RAISE ARMS TO SHOULDER HEIGHT"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "REST ARMS AT SIDES (<25 deg) TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep Counting
        if 80 <= angle <= 100:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "PARALLEL HEIGHT! LOWER SLOWLY"
        elif angle < 25:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT LATERAL RAISE REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "RAISE ARMS OUTWARD TO PARALLEL"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
