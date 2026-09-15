import { useEffect, useRef, useState, useCallback } from 'react';
import { poseDetector, POSE_CONNECTIONS } from '../services/pose/poseDetector';
import { registry } from '../services/exercises/registry';

export function usePoseTracker(activeExerciseId) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);
  const [telemetry, setTelemetry] = useState({
    reps: 0,
    stage: 'INACTIVE',
    angle: 0,
    feedback: 'GET INTO START POSITION TO BEGIN',
    active: false,
    form_warning: '',
    form_score: 100.0,
    landmarks: [],
    normalized_landmarks: [],
    connections: POSE_CONNECTIONS
  });

  const animationFrameIdRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize MediaPipe WASM PoseLandmarker Engine
  useEffect(() => {
    let isMounted = true;
    async function loadDetector() {
      const ready = await poseDetector.init();
      if (isMounted) {
        setDetectorReady(ready);
      }
    }
    loadDetector();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Browser Webcam Stream
  useEffect(() => {
    let mounted = true;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        console.error('[FormFit Camera] Failed to open webcam:', err);
        setCameraActive(false);
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Main 60 FPS Render & In-Browser Pose Detection Loop
  const renderFrameLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= 2 && detectorReady) {
      const ctx = canvas.getContext('2d');
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      if (ctx) {
        // Synchronize display canvas resolution with video stream
        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
        }

        // 1. Draw mirrored selfie camera feed on display canvas
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 2. Perform in-browser WASM Pose Detection
        const detection = poseDetector.detectFrame(video, performance.now());

        if (detection && detection.landmarks && detection.landmarks.length > 0) {
          const currentExercise = registry.getExercise(activeExerciseId);
          const exerciseResult = currentExercise.process(detection.landmarks);

          setTelemetry((prev) => ({
            ...prev,
            ...exerciseResult,
            landmarks: detection.landmarks,
            normalized_landmarks: detection.normalizedLandmarks,
            frame_width: detection.frameWidth,
            frame_height: detection.frameHeight,
            connections: POSE_CONNECTIONS
          }));

          // 3. Draw 60 FPS Pose Skeleton Overlay directly onto mirrored canvas
          const normLandmarks = detection.normalizedLandmarks;

          const getPointCoords = (index) => {
            if (normLandmarks && normLandmarks[index]) {
              const [normX, normY] = normLandmarks[index];
              return {
                x: (1.0 - normX) * canvas.width, // Mirror X coordinate
                y: normY * canvas.height
              };
            }
            return null;
          };

          const totalLandmarks = normLandmarks.length;
          if (totalLandmarks > 0) {
            const isWarning = Boolean(exerciseResult.warning);
            const lineColor = isWarning ? '#ef4444' : '#10b981'; // Red on warning, emerald when good
            const nodeColor = '#38bdf8'; // Sky blue joint nodes

            // Draw connecting skeleton lines
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            POSE_CONNECTIONS.forEach(([p1, p2]) => {
              if (p1 < totalLandmarks && p2 < totalLandmarks) {
                const pt1 = getPointCoords(p1);
                const pt2 = getPointCoords(p2);

                if (pt1 && pt2) {
                  ctx.beginPath();
                  ctx.moveTo(pt1.x, pt1.y);
                  ctx.lineTo(pt2.x, pt2.y);
                  ctx.stroke();
                }
              }
            });

            // Draw joint circles
            for (let i = 0; i < totalLandmarks; i++) {
              const pt = getPointCoords(i);
              if (pt) {
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
              }
            }
          }
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrameLoop);
  }, [detectorReady, activeExerciseId]);

  // Start/Stop RAF Loop
  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(renderFrameLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrameLoop]);

  const resetCounter = useCallback(() => {
    const ex = registry.getExercise(activeExerciseId);
    ex.reset();
    setTelemetry((prev) => ({
      ...prev,
      reps: 0,
      stage: 'INACTIVE',
      form_warning: '',
      form_score: 100.0
    }));
  }, [activeExerciseId]);

  const requestSummary = useCallback((callback) => {
    const ex = registry.getExercise(activeExerciseId);
    if (callback) {
      callback(ex.getSummary());
    }
  }, [activeExerciseId]);

  return {
    videoRef,
    canvasRef,
    cameraActive,
    connectionStatus: detectorReady ? 'CONNECTED' : 'CONNECTING',
    telemetry,
    resetCounter,
    requestSummary
  };
}
