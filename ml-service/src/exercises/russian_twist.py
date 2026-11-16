import time
import numpy as np
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
        if len(landmarks) < 24:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        r_shoulder = [landmarks[12][1], landmarks[12][2]]
        l_wrist = [landmarks[15][1], landmarks[15][2]]
        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_knee = [landmarks[25][1], landmarks[25][2]]
        
        angle = calculate_angle(l_shoulder, r_shoulder, l_wrist)
        is_good_form = True
        self.form_warning = ""

        # Form / Safety Checks (INDEPENDENT of twist angle)
        # 1. Spine rounding / slouching check (shoulder-hip-knee angle < 90°)
        spine_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        if spine_angle < 90:
            self.form_warning = "WARNING: Spine rounding / slouching (<90°)! Keep chest open & back neutral"
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
                self.feedback = "TRACKING ACTIVE! ROTATE TORSO SIDE TO SIDE (30°-45°)"
                self.hold_start_time = None
                if not self.start_workout_time:
                    self.start_workout_time = time.time()
            else:
                self.feedback = f"HOLD POSTURE TO START: {remaining:.1f}s"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep counting based on left/right side transitions (30°-45° extreme rotation thresholds)
        if angle <= 50:
            if self.stage == "RIGHT":
                self.counter += 1
                self.stage = "LEFT"
                self.feedback = "TWIST TO RIGHT SIDE (30°-45°)"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
        elif angle >= 110:
            if self.stage == "LEFT":
                self.counter += 1
                self.stage = "RIGHT"
                self.feedback = "TWIST TO LEFT SIDE (30°-45°)"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
