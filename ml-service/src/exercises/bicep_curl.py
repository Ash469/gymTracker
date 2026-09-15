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

        # Form / Safety Checks
        if l_hip:
            arm_body_angle = calculate_angle(l_hip, l_shoulder, l_elbow)
            if arm_body_angle > 20:
                self.form_warning = "WARNING: Upper-arm drift / swinging (>20°)! Keep elbows stationary"
                is_good_form = False

            dx = abs(l_shoulder[0] - l_hip[0])
            dy = abs(l_shoulder[1] - l_hip[1]) + 1e-6
            import numpy as np
            torso_lean = np.degrees(np.arctan2(dx, dy))
            if torso_lean > 20:
                self.form_warning = "WARNING: Torso lean > 20°! Avoid using back momentum"
                is_good_form = False

        if not self.active:
            self.active = True
            self.stage = "DOWN"
            self.feedback = "TRACKING ACTIVE! CURL WEIGHT UPWARD"
            if not self.start_workout_time:
                self.start_workout_time = time.time()

        if angle <= 70:
            if self.stage == "DOWN" or not self.has_reached_target_state:
                self.stage = "UP"
                self.has_reached_target_state = True
                self.feedback = "PEAK BICEP CONTRACTION! LOWER UNDER CONTROL"
        elif angle >= 135:
            if self.stage == "UP" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT BICEP CURL REP!"
                self.rep_history.append({
                    "rep": self.counter,
                    "timestamp": round(time.time(), 2),
                    "quality": "Good" if is_good_form else "Warning"
                })
            self.stage = "DOWN"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
