import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class BicepCurl(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="bicep_curl",
            name="Dumbbell Bicep Curl",
            category="Biceps",
            met_value=3.8
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 17:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        l_elbow = [landmarks[13][1], landmarks[13][2]]
        l_wrist = [landmarks[15][1], landmarks[15][2]]
        l_hip = [landmarks[23][1], landmarks[23][2]] if len(landmarks) > 23 else None
        
        angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        is_good_form = True
        self.form_warning = ""

        # Torso Swinging / Momentum Guardrail
        if l_hip:
            arm_body_angle = calculate_angle(l_hip, l_shoulder, l_elbow)
            if arm_body_angle > 35:
                self.form_warning = "WARNING: Torso swinging / momentum usage! Keep elbows stationary"
                is_good_form = False

        # Hold starting position (>155 deg) for 2s to activate
        if not self.active:
            if angle > 155:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! CURL WEIGHT UPWARD"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "EXTEND ARM STRAIGHT (>155 deg) TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep Counting
        if 20 <= angle <= 60:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "PEAK BICEP CONTRACTION! LOWER UNDER CONTROL"
        elif angle > 155:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT BICEP CURL REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "CURL WEIGHT UPWARD (20°-60°)"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
