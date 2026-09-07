import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class ShoulderPress(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="shoulder_press",
            name="Dumbbell Shoulder Press",
            category="Shoulders",
            met_value=4.5
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

        # Lumbar Hyperextension Guardrail (Hip-Shoulder-Wrist vector)
        body_spine_angle = calculate_angle(l_hip, l_shoulder, l_wrist)
        if body_spine_angle < 155 and angle > 140:
            self.form_warning = "WARNING: Lower back lumbar hyperextension! Engage core & keep spine neutral"
            is_good_form = False

        # Hold start posture (~90 deg) for 2s to activate
        if not self.active:
            if 75 <= angle <= 110:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! PRESS OVERHEAD (170°-180°)"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "HOLD HANDS AT SHOULDER HEIGHT TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep Counting
        if angle >= 165:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "OVERHEAD LOCKOUT (170°-180°)! NOW LOWER TO SHOULDERS"
        elif angle < 70:
            self.feedback = "DON'T DROP HANDS TOO LOW!"
            self.form_warning = "WARNING: Dropping hands below chest!"
            is_good_form = False
        elif 80 <= angle <= 105:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT SHOULDER PRESS REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "PRESS WEIGHT UPWARD"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
