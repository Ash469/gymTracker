import time
import numpy as np
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class Squat(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="squat",
            name="Squat",
            category="Legs",
            met_value=5.0
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 29:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_knee = [landmarks[25][1], landmarks[25][2]]
        l_ankle = [landmarks[27][1], landmarks[27][2]]
        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        
        angle = calculate_angle(l_hip, l_knee, l_ankle)
        is_good_form = True
        self.form_warning = ""

        # Form / Safety Checks (INDEPENDENT of rep depth)
        # 1. Knee Valgus Collapse Guardrail
        r_knee = [landmarks[26][1], landmarks[26][2]]
        r_ankle = [landmarks[28][1], landmarks[28][2]]
        knee_dist = abs(l_knee[0] - r_knee[0])
        ankle_dist = abs(l_ankle[0] - r_ankle[0])

        if ankle_dist > 0 and (knee_dist / ankle_dist) < 0.75:
            self.form_warning = "WARNING: Knee collapse inward (Valgus)! Drive knees outward over toes"
            is_good_form = False

        # 2. Forward torso lean > 45° without hip hinge
        dx_torso = abs(l_shoulder[0] - l_hip[0])
        dy_torso = abs(l_shoulder[1] - l_hip[1]) + 1e-6
        torso_lean = np.degrees(np.arctan2(dx_torso, dy_torso))
        if torso_lean > 45:
            self.form_warning = "WARNING: Excessive torso lean > 45°! Keep chest up to protect lower back"
            is_good_form = False

        # Hold upright stance (>=165 deg) for 2s to activate
        if not self.active:
            if angle >= 165:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! SQUAT TO PARALLEL (70°-110°)"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "STAND UPRIGHT (>=165 deg) TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep-State Machine (Depth allowed from 110° down to 70° for ATG squats)
        if 70 <= angle <= 110:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "SQUAT DEPTH REACHED! DRIVE UP THROUGH HEELS"
        elif angle >= 165:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT SQUAT REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "SQUAT DOWN TO PARALLEL (70°-110°)"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
