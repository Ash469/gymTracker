from typing import Dict, Type, List, Any
from src.exercises.base_exercise import BaseExercise
from src.exercises.bicep_curl import BicepCurl
from src.exercises.shoulder_press import ShoulderPress
from src.exercises.tricep_extension import TricepExtension
from src.exercises.lateral_raise import LateralRaise
from src.exercises.squat import Squat
from src.exercises.dumbbell_bench_press import DumbbellBenchPress
from src.exercises.single_arm_dumbbell_row import SingleArmDumbbellRow
from src.exercises.russian_twist import DumbbellRussianTwist
from src.exercises.calf_raise import CalfRaise

class ExerciseRegistry:
    def __init__(self):
        self._exercises: Dict[str, Type[BaseExercise]] = {
            "bicep_curl": BicepCurl,
            "shoulder_press": ShoulderPress,
            "tricep_extension": TricepExtension,
            "dumbbell_bench_press": DumbbellBenchPress,
            "single_arm_dumbbell_row": SingleArmDumbbellRow,
            "squat": Squat,
            "russian_twist": DumbbellRussianTwist,
            "lateral_raise": LateralRaise,
            "calf_raise": CalfRaise
        }
        self._instances: Dict[str, BaseExercise] = {}

    def get_exercise(self, exercise_id: str) -> BaseExercise:
        if exercise_id not in self._exercises:
            exercise_id = "bicep_curl"  # Default fallback
            
        if exercise_id not in self._instances:
            self._instances[exercise_id] = self._exercises[exercise_id]()
            
        return self._instances[exercise_id]

    def list_exercises(self) -> List[Dict[str, Any]]:
        result = []
        for ex_id, ex_class in self._exercises.items():
            temp = ex_class()
            result.append(temp.get_details())
        return result

# Global registry instance singleton
registry = ExerciseRegistry()

