import squatImg from '../../assets/squart.png';

export const squat = {
  id: "squat",
  name: "Squat (Barbell Back Squat)",
  category: "Legs",
  demo_gif: squatImg,
  target_muscles: ["Quadriceps", "Hamstrings", "Glutes", "Adductors", "Core"],
  how_to_perform: [
    "Stand in front of a squat rack. Place the barbell on your upper back (traps/rear shoulders), not your neck. Grip the bar firmly, step under it, and lift it off the rack.",
    "Step back and stand with your feet slightly wider than shoulder-width apart. Toes should be pointed slightly outward (about 15-30 degrees).",
    "Keep your chest up, shoulders back, and core braced.",
    "Inhale and begin the squat by pushing your hips back and bending your knees, as if sitting in a chair.",
    "Descend until your thighs are at least parallel to the floor (or deeper, if mobility allows). Keep your heels on the ground and knees tracking in line with your toes.",
    "Exhale and drive powerfully through your heels to return to the starting standing position, squeezing your glutes at the top."
  ],
  common_mistakes: [
    "Letting the knees collapse inward ('valgus collapse').",
    "Rounding the back or letting the chest drop forward.",
    "Not squatting low enough (shallow depth)."
  ]
};

export default squat;
