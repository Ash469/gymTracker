import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/**
 * Full MediaPipe 33 Landmark Skeleton Topology
 * Includes Head/Neck, Torso, Arms, Hands/Fingers, Legs, and Feet/Heel triangles.
 */
export const POSE_CONNECTIONS = [
  // 1. Head & Neck Topology
  [0, 1], [1, 2], [2, 3], [3, 7],      // Left Eye to Ear
  [0, 4], [4, 5], [5, 6], [6, 8],      // Right Eye to Ear
  [9, 10],                             // Mouth line
  [7, 11], [8, 12],                    // Neck to Shoulders

  // 2. Upper Body & Arms
  [11, 12],                            // Shoulder girdle
  [11, 13], [13, 15],                  // Left Arm (Shoulder -> Elbow -> Wrist)
  [12, 14], [14, 16],                  // Right Arm (Shoulder -> Elbow -> Wrist)

  // 3. Hands & Wrist Orientation
  [15, 17], [15, 19], [15, 21], [17, 19], // Left Hand (Wrist -> Pinky, Index, Thumb)
  [16, 18], [16, 20], [16, 22], [18, 20], // Right Hand (Wrist -> Pinky, Index, Thumb)

  // 4. Torso & Core Axis
  [11, 23], [12, 24],                  // Lateral Spine / Lat lines
  [23, 24],                            // Pelvic girdle / Hips

  // 5. Lower Body & Legs
  [23, 25], [25, 27],                  // Left Leg (Hip -> Knee -> Ankle)
  [24, 26], [26, 28],                  // Right Leg (Hip -> Knee -> Ankle)

  // 6. Feet, Heels & Balance Base
  [27, 29], [29, 31], [27, 31],        // Left Foot Triangle (Ankle -> Heel -> Toe)
  [28, 30], [30, 32], [28, 32],        // Right Foot Triangle (Ankle -> Heel -> Toe)
];

/**
 * Key Anatomical Landmark Map for 33 Points
 */
export const LANDMARK_NAMES = {
  NOSE: 0,
  LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20,
  LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

class ClientPoseDetector {
  constructor() {
    this.landmarker = null;
    this.isInitializing = false;
    this.isReady = false;
    this.lastTimestamp = -1;
  }

  /**
   * Asynchronously initialize MediaPipe PoseLandmarker in WebAssembly (WASM).
   * Upgrades to High-Precision Full Model (33 points) with fallback to Lite.
   */
  async init() {
    if (this.isReady) return true;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return this.isReady;
    }

    this.isInitializing = true;
    try {
      console.log("⚡ Initializing High-Precision 33-Landmark MediaPipe WASM Model...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      this.isReady = true;
      this.isInitializing = false;
      console.log("✅ 33-Point MediaPipe WASM Full Model Loaded!");
      return true;
    } catch (err) {
      console.warn("⚠️ GPU/Full Model fallback to Lite WASM Model...", err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        this.isReady = true;
        this.isInitializing = false;
        console.log("✅ 33-Point MediaPipe WASM (Lite Mode) Ready!");
        return true;
      } catch (cpuErr) {
        console.error("❌ Failed to initialize MediaPipe WASM Landmarker:", cpuErr);
        this.isInitializing = false;
        return false;
      }
    }
  }

  /**
   * Process HTML5 Video frame and extract 33 pose landmarks.
   */
  detectFrame(videoElement, timestamp) {
    if (!this.isReady || !this.landmarker) return null;
    if (!videoElement || videoElement.readyState < 2) return null;

    if (timestamp <= this.lastTimestamp) {
      timestamp = this.lastTimestamp + 1;
    }
    this.lastTimestamp = timestamp;

    try {
      const results = this.landmarker.detectForVideo(videoElement, timestamp);
      if (!results || !results.landmarks || results.landmarks.length === 0) {
        return null;
      }

      const rawLandmarks = results.landmarks[0]; // 33 normalized points (x, y, z: 0.0 - 1.0)
      const vWidth = videoElement.videoWidth || 640;
      const vHeight = videoElement.videoHeight || 480;

      // Map to pixel coordinates [x, y, visibility]
      const pixelLandmarks = rawLandmarks.map((lm) => [
        Math.round(lm.x * vWidth),
        Math.round(lm.y * vHeight),
        lm.visibility !== undefined ? lm.visibility : 1.0,
      ]);

      // Normalized coordinates [x, y, z, visibility]
      const normalizedLandmarks = rawLandmarks.map((lm) => [
        lm.x,
        lm.y,
        lm.z || 0.0,
        lm.visibility !== undefined ? lm.visibility : 1.0,
      ]);

      return {
        landmarks: pixelLandmarks,
        normalizedLandmarks,
        frameWidth: vWidth,
        frameHeight: vHeight,
      };
    } catch (e) {
      console.error("Error during detectForVideo:", e);
      return null;
    }
  }
}

export const poseDetector = new ClientPoseDetector();
