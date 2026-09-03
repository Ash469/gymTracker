import cv2
from src.pose_detector import PoseDetector
from src.tracker import RepTracker

def main():
    cap = cv2.VideoCapture(0)
    detector = PoseDetector()
    tracker = RepTracker()

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.resize(frame, (800, 600))
        frame = detector.find_pose(frame)
        landmarks = detector.get_position(frame)

        if landmarks:
            # Unpacking exactly 5 variables!
            reps, stage, angle, feedback, active = tracker.process_exercise(landmarks)

            # Top HUD Box
            cv2.rectangle(frame, (0, 0), (800, 85), (0, 0, 0), -1)

            if not active:
                # Activation Prompt
                cv2.putText(frame, "STATUS: INACTIVE", (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                cv2.putText(frame, f"ANGLE: {int(angle)}deg", (460, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)
                
                # Turn text white while holding, yellow otherwise
                color = (255, 255, 255) if "HOLD" in feedback else (0, 255, 255)
                cv2.putText(frame, feedback, (10, 72), cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2)
            else:
                # Active Rep Counting Dashboard
                cv2.putText(frame, f"REPS: {reps}", (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.putText(frame, f"STAGE: {stage}", (200, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, f"ANGLE: {int(angle)}deg", (460, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

                # Color logic for feedback messages
                if "DON'T" in feedback:
                    text_color = (0, 0, 255)  # Red warning
                elif "PERFECT" in feedback or "GOOD" in feedback:
                    text_color = (0, 255, 0)  # Green success
                else:
                    text_color = (0, 255, 255) # Yellow guidance

                cv2.putText(frame, feedback, (10, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, text_color, 2)

        cv2.imshow("Smart Gym Form Tracker", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()