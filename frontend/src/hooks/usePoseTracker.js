import { useEffect, useRef, useState, useCallback } from 'react';
import { wsService, ConnectionStatus } from '../services/websocket';

export function usePoseTracker(activeExerciseId) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [telemetry, setTelemetry] = useState({
    reps: 0,
    stage: 'INACTIVE',
    angle: 0,
    feedback: 'GET INTO START POSITION TO BEGIN',
    active: false,
    form_warning: '',
    form_score: 100.0,
    landmarks: [],
    normalized_landmarks: []
  });

  const isSendingFrameRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize offscreen canvas for unmirrored frame extraction
  if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
    offscreenCanvasRef.current = document.createElement('canvas');
  }

  // Synchronize WebSocket Connection & Status
  useEffect(() => {
    wsService.connect();

    const unsubscribeStatus = wsService.onStatusChange((status) => {
      setConnectionStatus(status);
      if (status === ConnectionStatus.CONNECTED && activeExerciseId) {
        wsService.selectExercise(activeExerciseId);
      }
    });

    const unsubscribeTelemetry = wsService.onTelemetry((data) => {
      setTelemetry(data);
      isSendingFrameRef.current = false; // Reset frame lock on telemetry response
    });

    return () => {
      unsubscribeStatus();
      unsubscribeTelemetry();
    };
  }, [activeExerciseId]);

  // Handle Exercise Selection Change
  useEffect(() => {
    if (activeExerciseId && connectionStatus === ConnectionStatus.CONNECTED) {
      wsService.selectExercise(activeExerciseId);
    }
  }, [activeExerciseId, connectionStatus]);

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
          stream.getTracks().forEach(t => t.stop());
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
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Main Render & Pose Landmark Overlay Drawing Loop
  const renderFrameLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= 2) {
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

        // 2. Overlay Pose Skeleton Landmarks directly onto the mirrored display canvas
        const normLandmarks = telemetry.normalized_landmarks;
        const pixelLandmarks = telemetry.landmarks;
        const connections = telemetry.connections || [
          [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
          [11, 23], [12, 24], [23, 24],
          [23, 25], [25, 27], [27, 29], [27, 31],
          [24, 26], [26, 28], [28, 30], [28, 32]
        ];

        // Helper to convert normalized coordinate (0..1) to mirrored screen pixel coordinate
        const getPointCoords = (index) => {
          if (normLandmarks && normLandmarks[index]) {
            const [, normX, normY] = normLandmarks[index];
            return {
              x: (1.0 - normX) * canvas.width,
              y: normY * canvas.height
            };
          }
          if (pixelLandmarks && pixelLandmarks[index]) {
            const [, pxX, pxY] = pixelLandmarks[index];
            const fw = telemetry.frame_width || canvas.width;
            const fh = telemetry.frame_height || canvas.height;
            const normX = pxX / fw;
            const normY = pxY / fh;
            return {
              x: (1.0 - normX) * canvas.width,
              y: normY * canvas.height
            };
          }
          return null;
        };

        const totalLandmarks = (normLandmarks && normLandmarks.length) || (pixelLandmarks && pixelLandmarks.length) || 0;

        if (totalLandmarks > 0) {
          const isWarning = Boolean(telemetry.form_warning);
          const lineColor = isWarning ? '#ef4444' : '#10b981'; // Red on warning, emerald when good
          const nodeColor = '#38bdf8'; // Sky blue joint nodes

          // Draw connecting skeleton lines
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          connections.forEach(([p1, p2]) => {
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

        // 3. Extract unmirrored snapshot from offscreen canvas for ML Engine over WebSocket
        if (!isSendingFrameRef.current && connectionStatus === ConnectionStatus.CONNECTED) {
          isSendingFrameRef.current = true;

          const offCanvas = offscreenCanvasRef.current;
          if (offCanvas.width !== videoWidth || offCanvas.height !== videoHeight) {
            offCanvas.width = videoWidth;
            offCanvas.height = videoHeight;
          }

          const offCtx = offCanvas.getContext('2d');
          if (offCtx) {
            // Draw clean UNMIRRORED video frame for Python MediaPipe analysis
            offCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
            const imageBase64 = offCanvas.toDataURL('image/jpeg', 0.6);
            wsService.sendFrame(imageBase64);
          } else {
            isSendingFrameRef.current = false;
          }
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrameLoop);
  }, [telemetry, connectionStatus]);

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
    wsService.resetCounter();
    setTelemetry(prev => ({ ...prev, reps: 0, stage: 'INACTIVE', form_warning: '' }));
  }, []);

  const requestSummary = useCallback((callback) => {
    wsService.requestSummary(callback);
  }, []);

  return {
    videoRef,
    canvasRef,
    cameraActive,
    connectionStatus,
    telemetry,
    resetCounter,
    requestSummary
  };
}
