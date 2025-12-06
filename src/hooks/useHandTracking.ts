'use client';

import type { Camera as CameraType } from '@mediapipe/camera_utils';
import type { Hands as HandsType, Results } from '@mediapipe/hands';
import { useCallback, useEffect, useRef, useState } from 'react';

export type GestureType =
  | 'none'
  | 'palm-rotate'
  | 'pinch-zoom'
  | 'fist-reset'
  | 'pointing'
  | 'two-hand-zoom'
  | 'two-hand-rotate'
  | 'two-hand-reset';

export interface HandGestureState {
  gesture: GestureType;
  rotationDeltaX: number;
  rotationDeltaY: number;
  zoomDelta: number;
  shouldReset: boolean;
  handsDetected: number;
  // Normalized hand position (0-1) for zoom-to-point
  handPosition: { x: number; y: number } | null;
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// Helper functions
function getPinchDistance(landmarks: HandLandmark[]): number {
  const thumb = landmarks[4];
  const index = landmarks[8];
  return Math.hypot(thumb.x - index.x, thumb.y - index.y);
}

function countExtendedFingers(landmarks: HandLandmark[]): number {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];

  return [
    index.y < landmarks[6].y,
    middle.y < landmarks[10].y,
    ring.y < landmarks[14].y,
    pinky.y < landmarks[18].y,
  ].filter(Boolean).length;
}

export function useHandTracking(enabled: boolean = true) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<HandsType | null>(null);
  const cameraRef = useRef<CameraType | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gestureState, setGestureState] = useState<HandGestureState>({
    gesture: 'none',
    rotationDeltaX: 0,
    rotationDeltaY: 0,
    zoomDelta: 0,
    shouldReset: false,
    handsDetected: 0,
    handPosition: null,
  });

  // Tracking state refs
  const lastPinchDistance = useRef(0);
  const lastTwoHandDistance = useRef(0);
  const lastHandPositions = useRef<Array<{ x: number; y: number } | null>>([null, null]);

  const onResults = useCallback((results: Results) => {
    // Draw hand landmarks on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks, idx) => {
          const color = idx === 0 ? '#4CAF50' : '#2196F3';
          // Draw connections
          const connections = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4], // thumb
            [0, 5],
            [5, 6],
            [6, 7],
            [7, 8], // index
            [0, 9],
            [9, 10],
            [10, 11],
            [11, 12], // middle
            [0, 13],
            [13, 14],
            [14, 15],
            [15, 16], // ring
            [0, 17],
            [17, 18],
            [18, 19],
            [19, 20], // pinky
            [5, 9],
            [9, 13],
            [13, 17], // palm
          ];

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.stroke();
          });

          // Draw landmarks
          ctx.fillStyle = idx === 0 ? '#FFEB3B' : '#FF9800';
          landmarks.forEach((lm) => {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
            ctx.fill();
          });
        });
      }
    }

    const numHands = results.multiHandLandmarks?.length ?? 0;

    if (numHands === 0) {
      lastPinchDistance.current = 0;
      lastTwoHandDistance.current = 0;
      lastHandPositions.current = [null, null];
      setGestureState({
        gesture: 'none',
        rotationDeltaX: 0,
        rotationDeltaY: 0,
        zoomDelta: 0,
        shouldReset: false,
        handsDetected: 0,
        handPosition: null,
      });
      return;
    }

    // TWO-HAND GESTURES
    if (numHands === 2 && results.multiHandLandmarks) {
      const hand1 = results.multiHandLandmarks[0] as HandLandmark[];
      const hand2 = results.multiHandLandmarks[1] as HandLandmark[];

      const palm1 = hand1[0];
      const palm2 = hand2[0];

      const twoHandDist = Math.hypot(palm1.x - palm2.x, palm1.y - palm2.y);
      const fingers1 = countExtendedFingers(hand1);
      const fingers2 = countExtendedFingers(hand2);

      const pinch1 = getPinchDistance(hand1);
      const pinch2 = getPinchDistance(hand2);
      const bothPinching = pinch1 < 0.08 && pinch2 < 0.08;

      // TWO-HAND PINCH ZOOM
      if (bothPinching) {
        let zoomDelta = 0;
        if (lastTwoHandDistance.current > 0) {
          const delta = twoHandDist - lastTwoHandDistance.current;
          zoomDelta = delta * 3;
        }
        lastTwoHandDistance.current = twoHandDist;

        // Use center point between two hands for zoom target
        const centerX = (palm1.x + palm2.x) / 2;
        const centerY = (palm1.y + palm2.y) / 2;

        setGestureState({
          gesture: 'two-hand-zoom',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
        });
      }
      // TWO-HAND ROTATION (both palms open)
      else if (fingers1 >= 4 && fingers2 >= 4) {
        const centerX = (palm1.x + palm2.x) / 2;
        const centerY = (palm1.y + palm2.y) / 2;

        let rotationDeltaY = (centerX - 0.5) * 0.03;
        const rotationDeltaX = (centerY - 0.5) * 0.02;

        // Calculate angle between hands for additional rotation
        const angle = Math.atan2(palm2.y - palm1.y, palm2.x - palm1.x);
        if (lastHandPositions.current[0] && lastHandPositions.current[1]) {
          const lastAngle = Math.atan2(
            lastHandPositions.current[1]!.y - lastHandPositions.current[0]!.y,
            lastHandPositions.current[1]!.x - lastHandPositions.current[0]!.x,
          );
          const angleDelta = angle - lastAngle;
          if (Math.abs(angleDelta) < 0.5) {
            rotationDeltaY += angleDelta * 0.5;
          }
        }

        lastHandPositions.current = [
          { x: palm1.x, y: palm1.y },
          { x: palm2.x, y: palm2.y },
        ];
        lastTwoHandDistance.current = twoHandDist;

        setGestureState({
          gesture: 'two-hand-rotate',
          rotationDeltaX,
          rotationDeltaY,
          zoomDelta: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
        });
      }
      // TWO FISTS - RESET
      else if (fingers1 === 0 && fingers2 === 0) {
        lastTwoHandDistance.current = 0;
        setGestureState({
          gesture: 'two-hand-reset',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          shouldReset: true,
          handsDetected: 2,
          handPosition: null,
        });
      } else {
        lastTwoHandDistance.current = twoHandDist;
        setGestureState({
          gesture: 'none',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: null,
        });
      }
    }
    // SINGLE-HAND GESTURES
    else if (numHands === 1 && results.multiHandLandmarks) {
      lastTwoHandDistance.current = 0;
      lastHandPositions.current = [null, null];

      const landmarks = results.multiHandLandmarks[0] as HandLandmark[];
      const palm = landmarks[0];
      const index = landmarks[8];
      const thumb = landmarks[4];

      const pinchDist = getPinchDistance(landmarks);
      const fingersExtended = countExtendedFingers(landmarks);

      // Calculate pinch center point (between thumb and index finger)
      const pinchCenterX = (thumb.x + index.x) / 2;
      const pinchCenterY = (thumb.y + index.y) / 2;

      // SINGLE-HAND PINCH ZOOM
      if (pinchDist < 0.08) {
        let zoomDelta = 0;
        if (lastPinchDistance.current > 0) {
          const delta = lastPinchDistance.current - pinchDist;
          zoomDelta = delta * 5;
        }
        lastPinchDistance.current = pinchDist;

        setGestureState({
          gesture: 'pinch-zoom',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: pinchCenterX, y: pinchCenterY },
        });
      }
      // OPEN PALM - ROTATION
      else if (fingersExtended >= 4) {
        lastPinchDistance.current = 0;
        setGestureState({
          gesture: 'palm-rotate',
          rotationDeltaX: (palm.y - 0.5) * 0.03,
          rotationDeltaY: (palm.x - 0.5) * 0.05,
          zoomDelta: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: palm.x, y: palm.y },
        });
      }
      // FIST - RESET
      else if (fingersExtended === 0) {
        lastPinchDistance.current = 0;
        setGestureState({
          gesture: 'fist-reset',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          shouldReset: true,
          handsDetected: 1,
          handPosition: null,
        });
      }
      // POINTING (1 finger) - Fine rotation
      else if (fingersExtended === 1) {
        lastPinchDistance.current = 0;
        setGestureState({
          gesture: 'pointing',
          rotationDeltaX: (index.y - 0.5) * 0.015,
          rotationDeltaY: (index.x - 0.5) * 0.02,
          zoomDelta: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: index.x, y: index.y },
        });
      } else {
        lastPinchDistance.current = 0;
        setGestureState({
          gesture: 'none',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: null,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    async function init() {
      try {
        // Dynamically import MediaPipe
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');

        if (!mounted || !videoRef.current) return;

        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        cameraRef.current = camera;
        await camera.start();

        if (mounted) {
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Hand tracking error:', err);
        if (mounted) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : 'Camera not available');
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enabled, onResults]);

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    gestureState,
  };
}
