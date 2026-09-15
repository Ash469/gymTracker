import time
from src.utils import calculate_angle

class RepTracker:
    def __init__(self):
        self.counter = 0
        self.stage = "INACTIVE"
        self.feedback = "EXTEND ARM STRAIGHT (>155 deg) TO START"
        self.active = False
        self.has_reached_down = False
        self.hold_start_time = None
        self.required_hold_duration = 2.0  # seconds

    def process_exercise(self, landmarks):
        if len(landmarks) < 17:
            return self.counter, self.stage, 0, self.feedback, self.active

        # Extract Shoulder(11), Elbow(13), Wrist(15)
        shoulder = [landmarks[11][1], landmarks[11][2]]
        elbow = [landmarks[13][1], landmarks[13][2]]
        wrist = [landmarks[15][1], landmarks[15][2]]

        angle = calculate_angle(shoulder, elbow, wrist)

        # --- 1. ACTIVATION LOGIC: Hold starting position for 2 seconds ---
        if not self.active:
            if angle > 155:
                if self.hold_start_time is None:
                    self.hold_start_time = time.time()

                elapsed = time.time() - self.hold_start_time
                remaining = max(0.0, self.required_hold_duration - elapsed)

                if elapsed >= self.required_hold_duration:
                    self.active = True
                    self.stage = "UP"
                    self.feedback = "TRACKING ACTIVE! BEGIN REPS"
                    self.hold_start_time = None
                else:
                    self.feedback = f"HOLD STILL TO START: {remaining:.1f}s"
            else:
                self.hold_start_time = None
                self.feedback = "EXTEND ARM STRAIGHT (>155 deg) TO START"
            
            return self.counter, "INACTIVE", angle, self.feedback, self.active

        # --- 2. STRICT REP COUNTING & FORM LOGIC ---
        if 80 <= angle <= 105:
            self.stage = "DOWN"
            self.has_reached_down = True
            self.feedback = "PERFECT 90 DEG! NOW PUSH UP"
        elif angle < 80:
            self.stage = "DOWN"
            self.has_reached_down = True
            self.feedback = "DON'T GO DOWN MORE!"
        elif angle > 160:
            if self.stage == "DOWN" and self.has_reached_down:
                self.counter += 1
                self.has_reached_down = False
                self.feedback = "GOOD REP!"
            elif self.stage == "UP" and not self.has_reached_down:
                self.feedback = "START REP (GO DOWN)"
            self.stage = "UP"

        return self.counter, self.stage, angle, self.feedback, self.active
