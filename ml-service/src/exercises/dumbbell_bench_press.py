import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class DumbbellBenchPress(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="dumbbell_bench_press",
            name="Dumbbell Bench Press",
            category="Chest",
            met_value=4.2
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

        # Form / Safety Checks
        flare_angle = calculate_angle(l_hip, l_shoulder, l_elbow)
        if flare_angle > 80:
            self.form_warning = "WARNING: Excessive elbow flare (>80°)! Tuck elbows to protect rotator cuff"
            is_good_form = False

        if not self.active:
            self.active = True
            self.stage = "DOWN"
            self.feedback = "TRACKING ACTIVE! PRESS DUMBBELLS UPWARD"
            if not self.start_workout_time:
                self.start_workout_time = time.time()

        if angle >= 145:
            if self.stage == "DOWN" or not self.has_reached_target_state:
                self.stage = "UP"
                self.has_reached_target_state = True
                self.feedback = "CHEST LOCKOUT REACHED! LOWER TO CHEST LEVEL"
        elif angle <= 95:
            if self.stage == "UP" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT BENCH PRESS REP!"
                self.rep_history.append({
                    "rep": self.counter,
                    "timestamp": round(time.time(), 2),
                    "quality": "Good" if is_good_form else "Warning"
                })
            self.stage = "DOWN"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
