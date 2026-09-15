import os
import urllib.request
import cv2
import mediapipe as mp

# Standard MediaPipe 33-landmark pose connections for rendering
POSE_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),  # Upper body & Arms
    (11, 23), (12, 24), (23, 24),                     # Torso
    (23, 25), (25, 27), (27, 29), (27, 31),           # Left leg
    (24, 26), (26, 28), (28, 30), (28, 32)            # Right leg
]

class PoseDetector:
    def __init__(self, mode=False, complexity=1, smooth=True, detection_con=0.5, track_con=0.5):
        self.use_tasks_api = not hasattr(mp, 'solutions')
        
        if self.use_tasks_api:
            # MediaPipe 1.0+ Tasks API
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            model_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(model_dir, "pose_landmarker_lite.task")

            if not os.path.exists(model_path):
                print("Downloading MediaPipe Pose model for MediaPipe 1.0+...")
                url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
                try:
                    urllib.request.urlretrieve(url, model_path)
                    print("Model downloaded successfully.")
                except Exception as e:
                    print(f"Failed to download pose model: {e}")

            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.PoseLandmarkerOptions(
                base_options=base_options,
                running_mode=vision.RunningMode.IMAGE,
                min_pose_detection_confidence=detection_con,
                min_pose_presence_confidence=track_con
            )
            self.landmarker = vision.PoseLandmarker.create_from_options(options)
            self.results = None
        else:
            # MediaPipe legacy Solutions API
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                static_image_mode=mode,
                model_complexity=complexity,
                smooth_landmarks=smooth,
                min_detection_confidence=detection_con,
                min_tracking_confidence=track_con
            )
            self.mp_draw = mp.solutions.drawing_utils
            self.results = None

    def find_pose(self, img, draw=True):
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        if self.use_tasks_api:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            self.results = self.landmarker.detect(mp_image)
            
            if draw and self.results and self.results.pose_landmarks:
                landmarks = self.get_position(img)
                # Draw skeleton connections
                for p1, p2 in POSE_CONNECTIONS:
                    if p1 < len(landmarks) and p2 < len(landmarks):
                        pt1 = (landmarks[p1][1], landmarks[p1][2])
                        pt2 = (landmarks[p2][1], landmarks[p2][2])
                        cv2.line(img, pt1, pt2, (245, 117, 66), 2)
                # Draw keypoint nodes
                for lm in landmarks:
                    cv2.circle(img, (lm[1], lm[2]), 4, (245, 66, 230), -1)
        else:
            self.results = self.pose.process(img_rgb)
            if self.results.pose_landmarks and draw:
                self.mp_draw.draw_landmarks(img, self.results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)

        return img

    def get_position(self, img):
        landmark_list = []
        h, w, _ = img.shape

        if self.use_tasks_api:
            if self.results and self.results.pose_landmarks and len(self.results.pose_landmarks) > 0:
                for id, lm in enumerate(self.results.pose_landmarks[0]):
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    landmark_list.append([id, cx, cy])
        else:
            if self.results and self.results.pose_landmarks:
                for id, lm in enumerate(self.results.pose_landmarks.landmark):
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    landmark_list.append([id, cx, cy])

        return landmark_list

    def get_normalized_position(self, img=None):
        norm_list = []
        if self.use_tasks_api:
            if self.results and self.results.pose_landmarks and len(self.results.pose_landmarks) > 0:
                for id, lm in enumerate(self.results.pose_landmarks[0]):
                    norm_list.append([id, round(float(lm.x), 4), round(float(lm.y), 4)])
        else:
            if self.results and self.results.pose_landmarks:
                for id, lm in enumerate(self.results.pose_landmarks.landmark):
                    norm_list.append([id, round(float(lm.x), 4), round(float(lm.y), 4)])

        return norm_list
