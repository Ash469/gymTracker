import os
import sys
import json
import base64
import asyncio
import logging
from http import HTTPStatus
import cv2
import numpy as np

try:
    import websockets
except ImportError:
    print("Installing websockets library...")
    os.system(f"{sys.executable} -m pip install websockets")
    import websockets

from src.pose_detector import PoseDetector, POSE_CONNECTIONS
from src.exercises.registry import registry

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("FormFit-ML-Server")

# Global ML State
active_exercise_id = "bicep_curl"
current_exercise = registry.get_exercise(active_exercise_id)
detector = None

def get_detector():
    global detector
    if detector is None:
        logger.info("Initializing MediaPipe PoseDetector...")
        detector = PoseDetector(detection_con=0.5, track_con=0.5)
    return detector

def decode_base64_image(base64_str: str) -> np.ndarray:
    """Decode base64 encoded image string to OpenCV BGR numpy array."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    img_bytes = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return frame

async def process_http_request(*args, **kwargs):
    """Universal HTTP request processor compatible with all websockets library versions."""
    global active_exercise_id, current_exercise

    req_obj = None
    path = ""
    headers = {}

    if len(args) == 2:
        if hasattr(args[1], 'headers'):
            req_obj = args[1]
            path = getattr(req_obj, 'path', '')
            headers = getattr(req_obj, 'headers', {})
        elif hasattr(args[0], 'headers'):
            req_obj = args[0]
            path = getattr(req_obj, 'path', '')
            headers = getattr(req_obj, 'headers', {})
        else:
            path = str(args[0])
            headers = args[1]
    elif len(args) == 1:
        req_obj = args[0]
        path = getattr(req_obj, 'path', '')
        headers = getattr(req_obj, 'headers', {})

    # Extract Upgrade header (case-insensitive)
    upgrade_header = ""
    if hasattr(headers, 'get'):
        upgrade_header = headers.get("Upgrade") or headers.get("upgrade") or ""
    elif isinstance(headers, dict):
        upgrade_header = headers.get("Upgrade", headers.get("upgrade", ""))

    if upgrade_header.lower() == "websocket":
        return None

    clean_path = str(path).split("?")[0].rstrip("/")

    if clean_path in ["", "/health"]:
        body = json.dumps({"status": "online", "service": "FormFit Python ML Engine"}).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path == "/api/exercises":
        body = json.dumps({
            "exercises": registry.list_exercises(),
            "active_exercise_id": active_exercise_id
        }).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path.startswith("/api/exercise/"):
        ex_id = clean_path.split("/")[-1]
        ex = registry.get_exercise(ex_id)
        body = json.dumps(ex.get_details()).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path == "/api/select_exercise":
        body = json.dumps({
            "status": "success",
            "active_exercise": current_exercise.get_details()
        }).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path == "/api/telemetry":
        body = json.dumps({
            "exercise_id": current_exercise.id,
            "exercise_name": current_exercise.name,
            "reps": getattr(current_exercise, 'reps', 0),
            "stage": getattr(current_exercise, 'stage', 'INACTIVE'),
            "angle": int(getattr(current_exercise, 'angle', 0)),
            "feedback": getattr(current_exercise, 'feedback', ''),
            "active": getattr(current_exercise, 'is_active', False),
            "form_warning": getattr(current_exercise, 'form_warning', ''),
            "form_score": getattr(current_exercise, 'form_score', 100.0)
        }).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path == "/api/reset":
        current_exercise.reset()
        body = json.dumps({"status": "reset", "reps": 0}).encode("utf-8")
        status = HTTPStatus.OK
    elif clean_path == "/api/summary":
        body = json.dumps(current_exercise.get_summary()).encode("utf-8")
        status = HTTPStatus.OK
    else:
        body = json.dumps({"error": "Not Found"}).encode("utf-8")
        status = HTTPStatus.NOT_FOUND

    cors_headers = [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(body))),
        ("Connection", "close"),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type")
    ]

    # Return response object if websockets v13 Request object has respond method
    if req_obj and hasattr(req_obj, 'respond'):
        return req_obj.respond(status, cors_headers, body)

    # Legacy tuple return for websockets v10-12
    return (status, cors_headers, body)

async def handle_websocket(websocket, path=None):
    global active_exercise_id, current_exercise
    client_ip = websocket.remote_address
    logger.info(f"New WebSocket connection from {client_ip}")

    # Send initial connection confirmation
    await websocket.send(json.dumps({
        "type": "connected",
        "active_exercise_id": active_exercise_id,
        "active_exercise_name": current_exercise.name
    }))

    det = get_detector()

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "frame":
                image_data = data.get("image")
                if not image_data:
                    continue

                frame = decode_base64_image(image_data)
                if frame is None:
                    continue

                h, w, _ = frame.shape
                frame = det.find_pose(frame, draw=False)
                landmarks = det.get_position(frame)
                norm_landmarks = det.get_normalized_position(frame)

                if landmarks:
                    reps, stage, angle, feedback, active, warning, score = current_exercise.process(landmarks)

                    response = {
                        "type": "telemetry",
                        "exercise_id": current_exercise.id,
                        "exercise_name": current_exercise.name,
                        "reps": reps,
                        "stage": stage,
                        "angle": int(angle),
                        "feedback": feedback,
                        "active": active,
                        "form_warning": warning,
                        "form_score": round(score, 1),
                        "landmarks": landmarks,
                        "normalized_landmarks": norm_landmarks,
                        "frame_width": w,
                        "frame_height": h,
                        "connections": POSE_CONNECTIONS
                    }
                else:
                    response = {
                        "type": "telemetry",
                        "exercise_id": current_exercise.id,
                        "exercise_name": current_exercise.name,
                        "reps": getattr(current_exercise, 'reps', 0),
                        "stage": "NO POSE DETECTED",
                        "angle": 0,
                        "feedback": "POSITION YOURSELF IN CLEAR CAMERA VIEW",
                        "active": False,
                        "form_warning": "NO BODY DETECTED",
                        "form_score": 100.0,
                        "landmarks": [],
                        "normalized_landmarks": [],
                        "frame_width": w,
                        "frame_height": h,
                        "connections": POSE_CONNECTIONS
                    }

                await websocket.send(json.dumps(response))

            elif msg_type == "select_exercise":
                new_id = data.get("exercise_id")
                if new_id:
                    active_exercise_id = new_id
                    current_exercise = registry.get_exercise(active_exercise_id)
                    current_exercise.reset()
                    logger.info(f"Switched active exercise to: {current_exercise.name}")

                await websocket.send(json.dumps({
                    "type": "exercise_selected",
                    "active_exercise": current_exercise.get_details()
                }))

            elif msg_type == "reset":
                current_exercise.reset()
                logger.info(f"Reset exercise state for {current_exercise.name}")
                await websocket.send(json.dumps({
                    "type": "reset_complete",
                    "reps": 0
                }))

            elif msg_type == "get_summary":
                summary = current_exercise.get_summary()
                await websocket.send(json.dumps({
                    "type": "summary",
                    "summary": summary
                }))

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"WebSocket client {client_ip} disconnected")
    except Exception as e:
        logger.error(f"Error handling WebSocket message: {e}")

async def start_server():
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting FormFit Python ML Engine (WS + REST API) on port {port}...")

    # Initialize detector during server launch
    get_detector()

    async with websockets.serve(
        handle_websocket,
        host,
        port,
        process_request=process_http_request,
        max_size=10 * 1024 * 1024
    ):
        logger.info(f"🚀 FormFit ML Engine online at ws://{host}:{port} and http://{host}:{port}/api")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        logger.info("Server shut down cleanly.")
