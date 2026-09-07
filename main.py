import argparse
import sys
import cv2
from src.pose_detector import PoseDetector
from src.exercises.registry import registry

def main():
    parser = argparse.ArgumentParser(description="Exercise Buddy AI Form Tracker")
    parser.add_argument(
        "--source", 
        type=str, 
        default="0", 
        help="Path to video file or camera index (default: 0 for default webcam)"
    )
    parser.add_argument(
        "--exercise",
        type=str,
        default="bicep_curl",
        choices=["bicep_curl", "shoulder_press", "tricep_extension", "lateral_raise", "squat", "dumbbell_bench_press", "single_arm_dumbbell_row", "russian_twist", "calf_raise"],
        help="Exercise model to track (bicep_curl, shoulder_press, tricep_extension, lateral_raise, squat, dumbbell_bench_press, single_arm_dumbbell_row, russian_twist, calf_raise)"
    )
    args = parser.parse_args()

    source = int(args.source) if args.source.isdigit() else args.source

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"Error: Could not open video source '{args.source}'. Please check your webcam connection or file path.")
        sys.exit(1)

    detector = PoseDetector()
    exercise = registry.get_exercise(args.exercise)

    print(f"==================================================")
    print(f"  EXERCISE BUDDY AI FORM TRACKER")
    print(f"  Active Exercise Model : {exercise.name}")
    print(f"  Target Muscles        : {', '.join(getattr(exercise, 'target_muscles', []))}")
    print(f"  Video Source          : {source}")
    print(f"  Press 'q' to quit window")
    print(f"==================================================")

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.resize(frame, (800, 600))
        frame = detector.find_pose(frame)
        landmarks = detector.get_position(frame)

        if landmarks:
            reps, stage, angle, feedback, active, warning, score = exercise.process(landmarks)

            # Top HUD Box
            cv2.rectangle(frame, (0, 0), (800, 95), (15, 15, 20), -1)
            cv2.rectangle(frame, (0, 0), (800, 95), (45, 45, 60), 2)

            if not active:
                cv2.putText(frame, f"STATUS: INACTIVE ({exercise.name.upper()})", (15, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 100, 255), 2)
                cv2.putText(frame, f"ANGLE: {int(angle)}deg", (600, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                color = (255, 255, 255) if "HOLD" in feedback else (0, 215, 255)
                cv2.putText(frame, feedback, (15, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2)
            else:
                cv2.putText(frame, f"REPS: {reps}", (15, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
                cv2.putText(frame, f"STAGE: {stage}", (220, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 255, 120), 2)
                cv2.putText(frame, f"ANGLE: {int(angle)}deg", (600, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2)

                if warning:
                    text_color = (0, 0, 255)
                elif "PERFECT" in feedback or "GREAT" in feedback or "GOOD" in feedback:
                    text_color = (0, 255, 120)
                else:
                    text_color = (0, 215, 255)

                disp_text = warning if warning else feedback
                cv2.putText(frame, disp_text, (15, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2)

        cv2.imshow("Exercise Buddy AI - Desktop Tracker", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()