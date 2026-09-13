import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List, Optional

class BaseExercise(ABC):
    """
    Core Python Pose Engine Class for exercise tracking.
    Contains ONLY biomechanical state machines, landmark calculations, rep counters, and form telemetry.
    All UI text, tutorials, descriptions, and media assets are managed exclusively in React frontend.
    """
    def __init__(
        self,
        exercise_id: str,
        name: str,
        category: str,
        required_hold_duration: float = 2.0,
        met_value: float = 3.5
    ):
        self.id = exercise_id
        self.name = name
        self.category = category
        self.required_hold_duration = required_hold_duration
        self.met_value = met_value
        
        # Biomechanical State & Rep Tracking
        self.counter = 0
        self.stage = "INACTIVE"
        self.feedback = "GET INTO START POSITION TO BEGIN"
        self.active = False
        self.has_reached_target_state = False
        self.hold_start_time: Optional[float] = None
        self.start_workout_time: Optional[float] = None
        
        # Real-time Form Telemetry
        self.form_warning = ""
        self.form_score = 100.0
        self.total_frames = 0
        self.good_form_frames = 0
        self.rep_history: List[Dict[str, Any]] = []

    def reset(self):
        """Resets reps and state counters."""
        self.counter = 0
        self.stage = "INACTIVE"
        self.feedback = "GET INTO START POSITION TO BEGIN"
        self.active = False
        self.has_reached_target_state = False
        self.hold_start_time = None
        self.start_workout_time = time.time()
        self.form_warning = ""
        self.form_score = 100.0
        self.total_frames = 0
        self.good_form_frames = 0
        self.rep_history.clear()

    def update_form_score(self, is_good_form: bool):
        """Tracks posture form score percentage over time."""
        self.total_frames += 1
        if is_good_form:
            self.good_form_frames += 1
        if self.total_frames > 0:
            self.form_score = round((self.good_form_frames / self.total_frames) * 100.0, 1)

    def calculate_calories(self, duration_seconds: float) -> float:
        """Calculates calories burned based on exercise MET value and duration."""
        duration_minutes = max(0.1, duration_seconds / 60.0)
        calories = (self.met_value * 3.5 * 70.0 / 200.0) * duration_minutes
        calories += (self.counter * 0.15)
        return round(calories, 1)

    @abstractmethod
    def process(self, landmarks: List[List[int]]) -> Tuple[int, str, float, str, bool, str, float]:
        """
        Process pose landmarks for this exercise.
        Returns tuple: (counter, stage, angle, feedback, active, form_warning, form_score)
        """
        pass

    def get_details(self) -> Dict[str, Any]:
        """Returns core identification telemetry for Python engine."""
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "met_value": self.met_value
        }

    def get_summary(self, duration_seconds: float = 0.0) -> Dict[str, Any]:
        if self.start_workout_time and duration_seconds == 0.0:
            duration_seconds = time.time() - self.start_workout_time
            
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "reps": self.counter,
            "form_score": self.form_score,
            "duration_seconds": int(duration_seconds),
            "calories_burned": self.calculate_calories(duration_seconds),
            "rep_history": self.rep_history
        }
