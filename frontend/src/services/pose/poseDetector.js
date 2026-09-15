import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// MediaPipe 33 Landmark Skeleton Connections for UI visualization
export const POSE_CONNECTIONS = [
  // Arms
  [11, 13], [13, 15], // Left Arm
  [12, 14], [14, 16], // Right Arm
  [11, 12],           // Shoulders
  
  // Torso
  [11, 23], [12, 24], // Spine sides
  [23, 24],           // Hips

  // Legs
  [23, 25], [25, 27], // Left Leg
  [24, 26], [26, 28], // Right Leg
];

class ClientPoseDetector {
  constructor() {
    this.landmarker = null;
    this.isInitializing = false;
    this.isReady = false;
    this.lastTimestamp = -1;
  }

  /**
   * Asynchronously initialize MediaPipe PoseLandmarker in WebAssembly (WASM).
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
      console.log("⚡ Initializing Client-Side MediaPipe WASM PoseLandmarker...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady = true;
      this.isInitializing = false;
      console.log("✅ Client-Side MediaPipe WASM PoseLandmarker Ready!");
      return true;
    } catch (err) {
      console.warn("⚠️ GPU delegate fallback to CPU for MediaPipe WASM...", err);
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
        console.log("✅ Client-Side MediaPipe WASM (CPU Mode) Ready!");
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
   * @param {HTMLVideoElement} videoElement
   * @param {number} timestamp - High-res timestamp (performance.now())
   * @returns {Object|null} Telemetry result with pixel & normalized landmarks
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
