import time
from typing import List, Tuple
from src.utils import calculate_angle
from src.exercises.base_exercise import BaseExercise

class SingleArmDumbbellRow(BaseExercise):
    def __init__(self):
        super().__init__(
            exercise_id="single_arm_dumbbell_row",
            name="Single-Arm Dumbbell Row",
            category="Back",
            met_value=4.0
        )

    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        if len(landmarks) < 26:
            return self.counter, self.stage, 0.0, self.feedback, self.active, self.form_warning, self.form_score

        l_shoulder = [landmarks[11][1], landmarks[11][2]]
        l_elbow = [landmarks[13][1], landmarks[13][2]]
        l_wrist = [landmarks[15][1], landmarks[15][2]]
        r_shoulder = [landmarks[12][1], landmarks[12][2]]
        l_hip = [landmarks[23][1], landmarks[23][2]]
        l_knee = [landmarks[25][1], landmarks[25][2]]
        
        angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        is_good_form = True
        self.form_warning = ""

        # Form / Safety Checks (INDEPENDENT of rep state)
        # 1. Torso rotation / twisting (shoulder line vertical difference > 15° equivalent in pixels)
        shoulder_tilt = abs(l_shoulder[1] - r_shoulder[1])
        if shoulder_tilt > 50:
            self.form_warning = "WARNING: Excessive torso twisting! Keep back flat & pull with lats"
            is_good_form = False

        # 2. Spine rounding check (shoulder-hip-knee alignment < 150°)
        back_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        if back_angle < 150:
            self.form_warning = "WARNING: Back rounding detected (<150°)! Flatten your spine"
            is_good_form = False

        # Hold bottom arm extension (>=170 deg) for 2s to activate
        if not self.active:
            if angle >= 170:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()
                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! PULL DUMBBELL TOWARD HIP (<=45°)"
                    self.hold_start_time = None
                    if not self.start_workout_time:
                        self.start_workout_time = time.time()
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "EXTEND ARM DOWN (>=170 deg) TO START"

            return self.counter, "INACTIVE", angle, self.feedback, self.active, self.form_warning, self.form_score

        # Rep-State Machine
        if angle <= 45:
            self.stage = "DOWN"
            self.has_reached_target_state = True
            self.feedback = "PEAK ROW CONTRACTION (<=45°)! LOWER UNDER CONTROL"
        elif angle >= 170:
            if self.stage == "DOWN" and self.has_reached_target_state:
                self.counter += 1
                self.has_reached_target_state = False
                self.feedback = "GREAT DUMBBELL ROW REP!"
                self.rep_history.append({"rep": self.counter, "timestamp": round(time.time(), 2), "quality": "Good" if is_good_form else "Warning"})
            elif self.stage == "UP" and not self.has_reached_target_state:
                self.feedback = "PULL DUMBBELL TOWARD HIP"
            self.stage = "UP"

        self.update_form_score(is_good_form)
        return self.counter, self.stage, angle, self.feedback, self.active, self.form_warning, self.form_score
