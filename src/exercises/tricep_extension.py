import time
import numpy as np
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class TricepExtension(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="tricep_extension",
            name="Dumbbell Overhead Tricep Extension",
            category="Triceps",
            met_value=3.6
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 24:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        l_elbow = [landmarks[13][1], landmarks[13][2]]
        l_wrist = [landmarks[15][1], landmarks[15][2]]
        l_hip = [landmarks[23][1], landmarks[23][2]]
        
        angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        is_good_form = True
        self.form_warning = ""

        # Form / Safety Checks (INDEPENDENT of rep state)
        # 1. Elbow flare / upper arm horizontal drift > 35° from vertical
        dx_arm = abs(l_elbow[0] - l_shoulder[0])
        dy_arm = abs(l_elbow[1] - l_shoulder[1]) + 1e-6
        arm_flare = np.degrees(np.arctan2(dx_arm, dy_arm))
        if arm_flare > 35:
            self.form_warning = "WARNING: Elbows flaring outward! Keep upper arms stationary near head"
            is_good_form = False

        # 2. Forward torso lean > 25° from vertical
        dx_torso = abs(l_shoulder[0] - l_hip[0])
        dy_torso = abs(l_shoulder[1] - l_hip[1]) + 1e-6
        torso_lean = np.degrees(np.arctan2(dx_torso, dy_torso))
        if torso_lean > 25:
            self.form_warning = "WARNING: Torso lean forward > 25°! Keep core upright"
            is_good_form = False

        # Hold flexed position (<=75°) for 2s to activate
        if not self.active:
            if angle <= 75:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! EXTEND DUMBBELL OVERHEAD (>=155°)"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "HOLD WEIGHT BEHIND HEAD (<=75 deg) TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep-State Machine (Extension Lockout >= 155°, Flexion Bottom <= 65°)
        if angle >= 155:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "PEAK TRICEP LOCKOUT! LOWER SLOWLY BEHIND HEAD"
        elif angle <= 65:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT TRICEP EXTENSION REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "EXTEND ARMS OVERHEAD"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
