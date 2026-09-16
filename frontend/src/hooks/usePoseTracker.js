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

          // 3. Draw 60 FPS Biomechanical Skeleton HUD directly onto mirrored canvas
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
            const defaultLineColor = isWarning ? '#ef4444' : '#10b981'; // Red on warning, emerald when good

            // 1. Draw connecting skeleton lines with anatomical region styling
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            POSE_CONNECTIONS.forEach(([p1, p2]) => {
              if (p1 < totalLandmarks && p2 < totalLandmarks) {
                const pt1 = getPointCoords(p1);
                const pt2 = getPointCoords(p2);

                if (pt1 && pt2) {
                  // Color code by anatomical region
                  if (p1 <= 10 || p2 <= 10) {
                    ctx.strokeStyle = '#f59e0b'; // Head/Face/Ears - Gold
                    ctx.lineWidth = 1.5;
                  } else if (p1 >= 27 || p2 >= 27) {
                    ctx.strokeStyle = '#E87552'; // Feet/Heels/Toes - Coral
                    ctx.lineWidth = 2;
                  } else {
                    ctx.strokeStyle = defaultLineColor; // Torso & Limbs
                    ctx.lineWidth = 2.5;
                  }

                  ctx.beginPath();
                  ctx.moveTo(pt1.x, pt1.y);
                  ctx.lineTo(pt2.x, pt2.y);
                  ctx.stroke();
                }
              }
            });

            // 2. Draw spinal posture reference line (Right Shoulder 12 -> Right Hip 24)
            const rShoulder = getPointCoords(12);
            const rHip = getPointCoords(24);
            if (rShoulder && rHip) {
              ctx.save();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = isWarning ? '#ef4444' : '#E87552';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(rShoulder.x, rShoulder.y);
              ctx.lineTo(rHip.x, rHip.y);
              ctx.stroke();
              ctx.restore();
            }

            // 3. Draw 33 joint landmark circles
            for (let i = 0; i < totalLandmarks; i++) {
              const pt = getPointCoords(i);
              if (pt) {
                let nodeColor = '#38bdf8'; // Sky blue default
                let radius = 3.5;

                if (i === 11 || i === 12 || i === 23 || i === 24 || i === 25 || i === 26) {
                  nodeColor = '#34c759'; // Core major joints - Emerald
                  radius = 4.5;
                } else if (i >= 27) {
                  nodeColor = '#E87552'; // Feet/Heel balance nodes - Coral
                  radius = 3.5;
                } else if (i <= 10) {
                  nodeColor = '#f59e0b'; // Head/Sensors - Gold
                  radius = 2.5;
                }

                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.stroke();
              }
            }

            // Draw Live Angle Overlay Badge on Key Joint (Right Knee 26 or Right Elbow 14)
            const keyJointIndex = activeExerciseId?.includes('press') || activeExerciseId?.includes('curl') ? 14 : 26;
            const targetJointPt = getPointCoords(keyJointIndex);
            if (targetJointPt && exerciseResult.angle > 0) {
              const text = `${Math.round(exerciseResult.angle)}°`;
              ctx.font = 'bold 13px Inter, sans-serif';
              const textWidth = ctx.measureText(text).width;
              
              const badgeX = targetJointPt.x + 12;
              const badgeY = targetJointPt.y - 10;
              const paddingX = 8;
              const paddingY = 4;
              
              // Badge background
              ctx.fillStyle = isWarning ? 'rgba(239, 68, 68, 0.92)' : 'rgba(23, 21, 19, 0.88)';
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY - 14, textWidth + paddingX * 2, 22, 6);
              ctx.fill();
              
              // Badge border
              ctx.strokeStyle = isWarning ? '#fca5a5' : '#E87552';
              ctx.lineWidth = 1;
              ctx.stroke();
              
              // Angle text
              ctx.fillStyle = '#ffffff';
              ctx.fillText(text, badgeX + paddingX, badgeY + 2);
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
