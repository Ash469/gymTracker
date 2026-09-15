import time
import numpy as np
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
        if len(landmarks) < 24:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        l_elbow = [landmarks[13][1], landmarks[13][2]]
        
        angle = calculate_angle(l_hip, l_shoulder, l_elbow)
        is_good_form = True
        self.form_warning = ""

        # Form / Safety Checks
        if angle > 105:
            self.form_warning = "WARNING: Arms raised past shoulder plane (>105°)! Impingement risk"
            is_good_form = False

        dx_torso = abs(l_shoulder[0] - l_hip[0])
        dy_torso = abs(l_shoulder[1] - l_hip[1]) + 1e-6
        torso_swing = np.degrees(np.arctan2(dx_torso, dy_torso))
        if torso_swing > 15:
            self.form_warning = "WARNING: Torso swing > 15°! Use deltoids without momentum"
            is_good_form = False

        if not self.active:
            self.active = True
            self.stage = "DOWN"
            self.feedback = "TRACKING ACTIVE! RAISE ARMS TO SHOULDER HEIGHT"
            if not self.start_workout_time:
                self.start_workout_time = time.time()

        if angle >= 75:
            if self.stage == "DOWN" or not self.has_reached_target_state:
                self.stage = "UP"
                self.has_reached_target_state = True
                self.feedback = "SHOULDER HEIGHT REACHED! LOWER SLOWLY"
        elif angle <= 30:
            if self.stage == "UP" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT LATERAL RAISE REP!"
                self.rep_history.append({
                    "rep": self.counter,
                    "timestamp": round(time.time(), 2),
                    "quality": "Good" if is_good_form else "Warning"
                })
            self.stage = "DOWN"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
