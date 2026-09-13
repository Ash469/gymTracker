import sys
import os
import cv2
import time
from typing import Generator
from flask import Flask, Response, jsonify, request

try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False

from src.pose_detector import PoseDetector
from src.exercises.registry import registry

# Headless Flask Backend Engine for React Frontend
app = Flask(__name__)

if has_cors:
    CORS(app)

# Global Application State
camera_source = 0
active_exercise_id = "bicep_curl"
current_exercise = registry.get_exercise(active_exercise_id)
detector = None

# Global Telemetry Object for Real-time Web UI
telemetry_data = {
    "exercise_id": "bicep_curl",
    "exercise_name": "Bicep Curl",
    "reps": 0,
    "stage": "INACTIVE",
    "angle": 0.0,
    "feedback": "GET INTO START POSITION TO BEGIN",
    "active": False,
    "form_warning": "",
    "form_score": 100.0
}

def get_detector():
    global detector
    if detector is None:
        detector = PoseDetector()
    return detector

def generate_frames() -> Generator[bytes, None, None]:
    global current_exercise, active_exercise_id, telemetry_data
    
    cap = cv2.VideoCapture(camera_source)
    det = get_detector()

    while True:
        try:
            if not cap.isOpened():
                import numpy as np
                placeholder = np.zeros((600, 800, 3), dtype=np.uint8)
                cv2.putText(placeholder, "CAMERA FEED UNAVAILABLE", (190, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 100, 255), 2)
                cv2.putText(placeholder, "Please allow Camera access in macOS System Settings", (110, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
                cv2.putText(placeholder, "Retrying camera connection...", (250, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 255, 100), 1)
                ret, buffer = cv2.imencode('.jpg', placeholder, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                if ret:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                time.sleep(1.0)
                cap.open(camera_source)
                continue

            success, frame = cap.read()
            if not success:
                time.sleep(0.05)
                continue

            frame = cv2.resize(frame, (800, 600))
            frame = det.find_pose(frame)
            landmarks = det.get_position(frame)

            if landmarks:
                reps, stage, angle, feedback, active, warning, score = current_exercise.process(landmarks)

                telemetry_data.update({
                    "exercise_id": current_exercise.id,
                    "exercise_name": current_exercise.name,
                    "reps": reps,
                    "stage": stage,
                    "angle": int(angle),
                    "feedback": feedback,
                    "active": active,
                    "form_warning": warning,
                    "form_score": score
                })

                # OpenCV Video Stream HUD Box
                cv2.rectangle(frame, (0, 0), (800, 95), (15, 15, 20), -1)
                cv2.rectangle(frame, (0, 0), (800, 95), (45, 45, 60), 2)

                if not active:
                    cv2.putText(frame, f"STATUS: INACTIVE ({current_exercise.name.upper()})", (15, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 100, 255), 2)
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

            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except GeneratorExit:
            break
        except Exception as err:
            print(f"Frame generation error: {err}")
            time.sleep(0.1)

    cap.release()

@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "app": "Exercise Buddy Python AI Pose Engine",
        "frontend_dev_url": "http://localhost:5173",
        "note": "Frontend UI is 100% handled by the React application in ./frontend",
        "endpoints": {
            "exercises": "/api/exercises",
            "exercise_details": "/api/exercise/<id>",
            "select_exercise": "/api/select_exercise",
            "telemetry": "/api/telemetry",
            "reset": "/api/reset",
            "summary": "/api/summary",
            "video_feed": "/video_feed"
        }
    })

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/exercises', methods=['GET'])
def list_exercises():
    return jsonify({
        "exercises": registry.list_exercises(),
        "active_exercise_id": active_exercise_id
    })

@app.route('/api/exercise/<exercise_id>', methods=['GET'])
def get_exercise_details(exercise_id):
    ex = registry.get_exercise(exercise_id)
    return jsonify(ex.get_details())

@app.route('/api/select_exercise', methods=['POST'])
def select_exercise():
    global active_exercise_id, current_exercise
    data = request.get_json() or {}
    new_id = data.get("exercise_id")
    
    if new_id:
        active_exercise_id = new_id
        current_exercise = registry.get_exercise(active_exercise_id)
        current_exercise.reset()
        
    return jsonify({
        "status": "success",
        "active_exercise": current_exercise.get_details()
    })

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    return jsonify(telemetry_data)

@app.route('/api/reset', methods=['POST'])
def reset_tracker():
    global current_exercise
    current_exercise.reset()
    return jsonify({"status": "reset", "reps": 0})

@app.route('/api/summary', methods=['GET'])
def get_summary():
    return jsonify(current_exercise.get_summary())



if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f"Starting Exercise Buddy Python AI Core Engine at http://127.0.0.1:{port}")
    print("Launch React Frontend UI by running 'npm run dev' inside ./frontend (http://localhost:5173)")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
