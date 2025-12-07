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
  | 'peace-toggle'
  | 'two-hand-zoom'
  | 'two-hand-pan'
  | 'two-hand-tilt'
  | 'two-hand-screenshot'
  | 'two-hand-reset';

export interface HandGestureState {
  gesture: GestureType;
  rotationDeltaX: number;
  rotationDeltaY: number;
  zoomDelta: number;
  // Pan delta for two-hand pan gesture (normalized -1 to 1)
  panDeltaX: number;
  panDeltaY: number;
  shouldReset: boolean;
  handsDetected: number;
  // Normalized hand position (0-1) for zoom-to-point
  handPosition: { x: number; y: number } | null;
  // Confidence level for gesture (0-1)
  confidence: number;
  // Action triggers (one-shot actions)
  shouldToggleSidebar: boolean;
  shouldScreenshot: boolean;
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// Configuration for gesture sensitivity and thresholds
const GESTURE_CONFIG = {
  // Pinch detection threshold (higher = easier to trigger)
  pinchThreshold: 0.12,
  // Minimum pinch distance change to register zoom
  pinchMinDelta: 0.005,
  // Rotation sensitivity multipliers (higher = more responsive)
  rotationSensitivityX: 0.06,
  rotationSensitivityY: 0.08,
  // Fine rotation sensitivity (pointing gesture)
  fineRotationSensitivityX: 0.03,
  fineRotationSensitivityY: 0.04,
  // Pan sensitivity for two-hand gesture
  panSensitivity: 0.015,
  // Tilt sensitivity for two-hand palms gesture
  tiltSensitivity: 0.08,
  // Zoom sensitivity
  singleHandZoomSensitivity: 8,
  twoHandZoomSensitivity: 5,
  // Smoothing factor (0-1, higher = more smoothing)
  smoothingFactor: 0.3,
  // Gesture switch cooldown frames
  gestureCooldown: 5,
  // Minimum finger extension threshold
  fingerExtensionThreshold: 0.85,
};

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

  // More lenient finger extension detection
  const threshold = GESTURE_CONFIG.fingerExtensionThreshold;
  return [
    index.y < landmarks[6].y * threshold,
    middle.y < landmarks[10].y * threshold,
    ring.y < landmarks[14].y * threshold,
    pinky.y < landmarks[18].y * threshold,
  ].filter(Boolean).length;
}

// Check if thumb is extended (not folded into palm)
function isThumbExtended(landmarks: HandLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const thumbBase = landmarks[2];
  const indexBase = landmarks[5];

  // Thumb is extended if thumb tip is far from index finger base
  const distToIndex = Math.hypot(thumbTip.x - indexBase.x, thumbTip.y - indexBase.y);
  return distToIndex > 0.1; // Threshold for thumb being "out"
}

// Smooth value using exponential moving average
function smoothValue(current: number, previous: number, factor: number): number {
  return previous + (current - previous) * (1 - factor);
}

// Calculate gesture confidence based on landmark stability
function calculateConfidence(landmarks: HandLandmark[], previousLandmarks: HandLandmark[] | null): number {
  if (!previousLandmarks) return 0.5;

  let totalMovement = 0;
  for (let i = 0; i < landmarks.length; i++) {
    totalMovement += Math.hypot(
      landmarks[i].x - previousLandmarks[i].x,
      landmarks[i].y - previousLandmarks[i].y
    );
  }

  // Lower movement = higher confidence
  const avgMovement = totalMovement / landmarks.length;
  return Math.max(0.3, Math.min(1, 1 - avgMovement * 10));
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
    panDeltaX: 0,
    panDeltaY: 0,
    shouldReset: false,
    handsDetected: 0,
    handPosition: null,
    confidence: 0,
    shouldToggleSidebar: false,
    shouldScreenshot: false,
  });

  // Tracking state refs
  const lastPinchDistance = useRef(0);
  const lastTwoHandDistance = useRef(0);
  const lastHandPositions = useRef<Array<{ x: number; y: number } | null>>([null, null]);
  const lastTwoHandCenter = useRef<{ x: number; y: number } | null>(null);

  // Smoothing refs for stability
  const smoothedRotationX = useRef(0);
  const smoothedRotationY = useRef(0);
  const smoothedZoom = useRef(0);
  const smoothedPanX = useRef(0);
  const smoothedPanY = useRef(0);
  const smoothedTilt = useRef(0);

  // Gesture stability refs
  const lastGesture = useRef<GestureType>('none');
  const gestureCooldownCounter = useRef(0);
  const previousLandmarks = useRef<HandLandmark[] | null>(null);

  const onResults = useCallback((results: Results) => {
    // Draw hand landmarks on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      // Use fixed dimensions matching the video stream (320x240)
      const canvasWidth = 320;
      const canvasHeight = 240;
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
            ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
            ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
            ctx.stroke();
          });

          // Draw landmarks
          ctx.fillStyle = idx === 0 ? '#FFEB3B' : '#FF9800';
          landmarks.forEach((lm) => {
            ctx.beginPath();
            ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, 3, 0, 2 * Math.PI);
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
      lastTwoHandCenter.current = null;
      previousLandmarks.current = null;
      smoothedRotationX.current = 0;
      smoothedRotationY.current = 0;
      smoothedZoom.current = 0;
      smoothedPanX.current = 0;
      smoothedPanY.current = 0;
      smoothedTilt.current = 0;
      lastGesture.current = 'none';
      gestureCooldownCounter.current = 0;
      setGestureState({
        gesture: 'none',
        rotationDeltaX: 0,
        rotationDeltaY: 0,
        zoomDelta: 0,
        panDeltaX: 0,
        panDeltaY: 0,
        shouldReset: false,
        handsDetected: 0,
        handPosition: null,
        confidence: 0,
        shouldToggleSidebar: false,
        shouldScreenshot: false,
      });
      return;
    }

    // Gesture cooldown to prevent rapid switching
    if (gestureCooldownCounter.current > 0) {
      gestureCooldownCounter.current--;
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
      const bothPinching = pinch1 < GESTURE_CONFIG.pinchThreshold && pinch2 < GESTURE_CONFIG.pinchThreshold;

      // Use center point between two hands
      const centerX = (palm1.x + palm2.x) / 2;
      const centerY = (palm1.y + palm2.y) / 2;

      // TWO-HAND PINCH ZOOM
      if (bothPinching) {
        let zoomDelta = 0;
        if (lastTwoHandDistance.current > 0) {
          const delta = twoHandDist - lastTwoHandDistance.current;
          if (Math.abs(delta) > GESTURE_CONFIG.pinchMinDelta) {
            zoomDelta = delta * GESTURE_CONFIG.twoHandZoomSensitivity;
            // Apply smoothing
            smoothedZoom.current = smoothValue(zoomDelta, smoothedZoom.current, GESTURE_CONFIG.smoothingFactor);
            zoomDelta = smoothedZoom.current;
          }
        }
        lastTwoHandDistance.current = twoHandDist;

        if (lastGesture.current !== 'two-hand-zoom' && gestureCooldownCounter.current === 0) {
          lastGesture.current = 'two-hand-zoom';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'two-hand-zoom',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
          confidence: 0.9,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // TWO-HAND PAN (both pointing) - move map by tracking center point movement
      else if (fingers1 === 1 && fingers2 === 1) {
        let panDeltaX = 0;
        let panDeltaY = 0;

        // Calculate pan based on center point movement
        if (lastTwoHandCenter.current) {
          const rawPanX = (centerX - lastTwoHandCenter.current.x) * GESTURE_CONFIG.panSensitivity;
          const rawPanY = (centerY - lastTwoHandCenter.current.y) * GESTURE_CONFIG.panSensitivity;

          // Apply smoothing
          smoothedPanX.current = smoothValue(rawPanX, smoothedPanX.current, GESTURE_CONFIG.smoothingFactor);
          smoothedPanY.current = smoothValue(rawPanY, smoothedPanY.current, GESTURE_CONFIG.smoothingFactor);

          panDeltaX = smoothedPanX.current;
          panDeltaY = smoothedPanY.current;
        }

        lastTwoHandCenter.current = { x: centerX, y: centerY };
        lastHandPositions.current = [
          { x: palm1.x, y: palm1.y },
          { x: palm2.x, y: palm2.y },
        ];
        lastTwoHandDistance.current = twoHandDist;

        if (lastGesture.current !== 'two-hand-pan' && gestureCooldownCounter.current === 0) {
          lastGesture.current = 'two-hand-pan';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'two-hand-pan',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX,
          panDeltaY,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
          confidence: 0.85,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // TWO-HAND SCREENSHOT (both peace signs / 2+2 fingers) - take screenshot
      // Require both hands to be clearly visible (distance between hands > threshold)
      else if (fingers1 === 2 && fingers2 === 2 && twoHandDist > 0.2) {
        // Only trigger once when first entering this gesture
        const isNewGesture = lastGesture.current !== 'two-hand-screenshot';
        const shouldTrigger = isNewGesture && gestureCooldownCounter.current === 0;

        if (isNewGesture && gestureCooldownCounter.current === 0) {
          lastGesture.current = 'two-hand-screenshot';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'two-hand-screenshot',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
          confidence: 0.9,
          shouldToggleSidebar: false,
          shouldScreenshot: shouldTrigger,
        });
      }
      // TWO-HAND TILT (both palms open) - tilt map up/down based on center Y position
      else if (fingers1 >= 3 && fingers2 >= 3) {
        // Calculate tilt based on vertical center position
        const rawTilt = (centerY - 0.5) * GESTURE_CONFIG.tiltSensitivity;

        // Apply smoothing
        smoothedTilt.current = smoothValue(rawTilt, smoothedTilt.current, GESTURE_CONFIG.smoothingFactor);

        lastHandPositions.current = [
          { x: palm1.x, y: palm1.y },
          { x: palm2.x, y: palm2.y },
        ];
        lastTwoHandDistance.current = twoHandDist;

        if (lastGesture.current !== 'two-hand-tilt' && gestureCooldownCounter.current === 0) {
          lastGesture.current = 'two-hand-tilt';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'two-hand-tilt',
          rotationDeltaX: smoothedTilt.current, // Use rotationDeltaX for tilt (polar angle)
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: { x: centerX, y: centerY },
          confidence: 0.85,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // TWO FISTS - RESET
      else if (fingers1 === 0 && fingers2 === 0) {
        lastTwoHandDistance.current = 0;
        lastTwoHandCenter.current = null;
        lastGesture.current = 'two-hand-reset';
        setGestureState({
          gesture: 'two-hand-reset',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: true,
          handsDetected: 2,
          handPosition: null,
          confidence: 0.95,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      } else {
        lastTwoHandDistance.current = twoHandDist;
        lastTwoHandCenter.current = null;
        setGestureState({
          gesture: 'none',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 2,
          handPosition: null,
          confidence: 0.5,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
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

      // Calculate confidence based on hand stability
      const confidence = calculateConfidence(landmarks, previousLandmarks.current);
      previousLandmarks.current = [...landmarks];

      // Calculate pinch center point (between thumb and index finger)
      const pinchCenterX = (thumb.x + index.x) / 2;
      const pinchCenterY = (thumb.y + index.y) / 2;

      // Helper to check if we should switch gestures
      const canSwitchGesture = (newGesture: GestureType) => {
        return lastGesture.current === newGesture || gestureCooldownCounter.current === 0;
      };

      // Check if thumb is extended (for distinguishing pinch from peace sign)
      const thumbExtended = isThumbExtended(landmarks);

      // SINGLE-HAND PINCH ZOOM (with improved threshold)
      // Only trigger if thumb is extended (not folded) to avoid conflict with peace sign
      if (pinchDist < GESTURE_CONFIG.pinchThreshold && thumbExtended && canSwitchGesture('pinch-zoom')) {
        let zoomDelta = 0;
        if (lastPinchDistance.current > 0) {
          const delta = lastPinchDistance.current - pinchDist;
          if (Math.abs(delta) > GESTURE_CONFIG.pinchMinDelta) {
            zoomDelta = delta * GESTURE_CONFIG.singleHandZoomSensitivity;
            // Apply smoothing
            smoothedZoom.current = smoothValue(zoomDelta, smoothedZoom.current, GESTURE_CONFIG.smoothingFactor);
            zoomDelta = smoothedZoom.current;
          }
        }
        lastPinchDistance.current = pinchDist;

        if (lastGesture.current !== 'pinch-zoom') {
          lastGesture.current = 'pinch-zoom';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'pinch-zoom',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: pinchCenterX, y: pinchCenterY },
          confidence,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // PEACE SIGN (2 fingers) - TOGGLE SIDEBAR
      else if (fingersExtended === 2 && canSwitchGesture('peace-toggle')) {
        lastPinchDistance.current = 0;

        // Only trigger once when first entering this gesture
        const isNewGesture = lastGesture.current !== 'peace-toggle';
        const shouldTrigger = isNewGesture;

        if (isNewGesture) {
          lastGesture.current = 'peace-toggle';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'peace-toggle',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: index.x, y: index.y },
          confidence,
          shouldToggleSidebar: shouldTrigger,
          shouldScreenshot: false,
        });
      }
      // OPEN PALM - ROTATION (with improved sensitivity)
      else if (fingersExtended >= 3 && canSwitchGesture('palm-rotate')) {
        lastPinchDistance.current = 0;

        // Raw rotation values with increased sensitivity
        const rawRotationX = (palm.y - 0.5) * GESTURE_CONFIG.rotationSensitivityX;
        const rawRotationY = (palm.x - 0.5) * GESTURE_CONFIG.rotationSensitivityY;

        // Apply smoothing to reduce jitter
        smoothedRotationX.current = smoothValue(rawRotationX, smoothedRotationX.current, GESTURE_CONFIG.smoothingFactor);
        smoothedRotationY.current = smoothValue(rawRotationY, smoothedRotationY.current, GESTURE_CONFIG.smoothingFactor);

        if (lastGesture.current !== 'palm-rotate') {
          lastGesture.current = 'palm-rotate';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'palm-rotate',
          rotationDeltaX: smoothedRotationX.current,
          rotationDeltaY: smoothedRotationY.current,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: palm.x, y: palm.y },
          confidence,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // FIST - RESET
      else if (fingersExtended === 0 && canSwitchGesture('fist-reset')) {
        lastPinchDistance.current = 0;
        lastGesture.current = 'fist-reset';
        smoothedRotationX.current = 0;
        smoothedRotationY.current = 0;
        setGestureState({
          gesture: 'fist-reset',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: true,
          handsDetected: 1,
          handPosition: null,
          confidence: 0.9,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      }
      // POINTING (1 finger) - Fine rotation with improved sensitivity
      else if (fingersExtended === 1 && canSwitchGesture('pointing')) {
        lastPinchDistance.current = 0;

        const rawRotationX = (index.y - 0.5) * GESTURE_CONFIG.fineRotationSensitivityX;
        const rawRotationY = (index.x - 0.5) * GESTURE_CONFIG.fineRotationSensitivityY;

        // Apply smoothing
        smoothedRotationX.current = smoothValue(rawRotationX, smoothedRotationX.current, GESTURE_CONFIG.smoothingFactor);
        smoothedRotationY.current = smoothValue(rawRotationY, smoothedRotationY.current, GESTURE_CONFIG.smoothingFactor);

        if (lastGesture.current !== 'pointing') {
          lastGesture.current = 'pointing';
          gestureCooldownCounter.current = GESTURE_CONFIG.gestureCooldown;
        }

        setGestureState({
          gesture: 'pointing',
          rotationDeltaX: smoothedRotationX.current,
          rotationDeltaY: smoothedRotationY.current,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: { x: index.x, y: index.y },
          confidence,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
        });
      } else {
        lastPinchDistance.current = 0;
        setGestureState({
          gesture: 'none',
          rotationDeltaX: 0,
          rotationDeltaY: 0,
          zoomDelta: 0,
          panDeltaX: 0,
          panDeltaY: 0,
          shouldReset: false,
          handsDetected: 1,
          handPosition: null,
          confidence: 0.5,
          shouldToggleSidebar: false,
          shouldScreenshot: false,
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
