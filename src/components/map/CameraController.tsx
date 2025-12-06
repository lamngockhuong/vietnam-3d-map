'use client';

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { HandGestureState } from '@/hooks/useHandTracking';

// Default camera position
const DEFAULT_CAMERA = {
  position: [0, 3, 4] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  azimuthalAngle: 0,
  polarAngle: Math.PI / 3,
  distance: 5,
};

export interface CameraControllerRef {
  resetCamera: () => void;
}

interface CameraControllerProps {
  gestureState: HandGestureState | null;
}

export const CameraController = forwardRef<CameraControllerRef, CameraControllerProps>(
  function CameraController({ gestureState }, ref) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera, gl, raycaster } = useThree();

    // Target values for smooth interpolation
    const targetRef = useRef({
      azimuthalAngle: DEFAULT_CAMERA.azimuthalAngle,
      polarAngle: DEFAULT_CAMERA.polarAngle,
      distance: DEFAULT_CAMERA.distance,
    });

    // For zoom-to-cursor
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetCamera: () => {
          camera.position.set(...DEFAULT_CAMERA.position);
          camera.lookAt(0, 0, 0);
          targetRef.current = {
            azimuthalAngle: DEFAULT_CAMERA.azimuthalAngle,
            polarAngle: DEFAULT_CAMERA.polarAngle,
            distance: DEFAULT_CAMERA.distance,
          };
          if (controlsRef.current) {
            controlsRef.current.target.set(...DEFAULT_CAMERA.target);
            controlsRef.current.update();
          }
        },
      }),
      [camera],
    );

    // Zoom towards a specific point on the map
    const zoomToPoint = useCallback(
      (clientX: number, clientY: number, zoomIn: boolean, zoomAmount: number) => {
        if (!controlsRef.current) return;

        const controls = controlsRef.current;
        const rect = gl.domElement.getBoundingClientRect();

        // Calculate normalized device coordinates
        const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

        // Get point under cursor before zoom
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const pointBeforeZoom = new THREE.Vector3();
        const hasIntersection = raycaster.ray.intersectPlane(planeRef.current, pointBeforeZoom);

        if (!hasIntersection) return;

        // Calculate new distance
        const currentDistance = controls.getDistance();
        const zoomFactor = zoomIn ? 1 - zoomAmount : 1 + zoomAmount;
        const newDistance = Math.max(0.3, Math.min(10, currentDistance * zoomFactor));

        // Apply zoom
        const direction = new THREE.Vector3()
          .subVectors(camera.position, controls.target)
          .normalize();
        camera.position.copy(controls.target).addScaledVector(direction, newDistance);
        camera.updateMatrixWorld();

        // Get point under cursor after zoom
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const pointAfterZoom = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeRef.current, pointAfterZoom);

        // Calculate offset to keep cursor point fixed
        const offset = new THREE.Vector3().subVectors(pointBeforeZoom, pointAfterZoom);

        // Apply offset to both camera and target
        camera.position.add(offset);
        controls.target.add(offset);

        // Clamp target within bounds
        const clampedTarget = controls.target.clone();
        clampedTarget.x = Math.max(-3, Math.min(3, clampedTarget.x));
        clampedTarget.z = Math.max(-3, Math.min(3, clampedTarget.z));
        clampedTarget.y = 0;

        // If clamping occurred, adjust camera position proportionally
        const clampOffset = new THREE.Vector3().subVectors(clampedTarget, controls.target);
        camera.position.add(clampOffset);
        controls.target.copy(clampedTarget);

        controls.update();
      },
      [camera, gl.domElement, raycaster],
    );

    // Custom wheel/trackpad handler for zoom-to-cursor
    const handleWheel = useCallback(
      (event: WheelEvent) => {
        if (!controlsRef.current) return;

        event.preventDefault();

        // Detect if this is a trackpad pinch gesture (ctrlKey is set for pinch-to-zoom on macOS)
        const isPinchGesture = event.ctrlKey;

        // Detect trackpad pan (two-finger scroll without ctrlKey)
        const isTrackpadPan = !isPinchGesture && Math.abs(event.deltaX) > 0;

        if (isPinchGesture || (!isTrackpadPan && event.deltaY !== 0)) {
          // Handle zoom (pinch or regular scroll)
          const zoomSpeed = isPinchGesture ? 0.03 : 0.1;
          const zoomIn = event.deltaY < 0;
          const zoomAmount = Math.min(
            Math.abs(event.deltaY) * (isPinchGesture ? 0.01 : 0.001),
            zoomSpeed,
          );

          zoomToPoint(event.clientX, event.clientY, zoomIn, zoomAmount);
        } else if (isTrackpadPan) {
          // Handle trackpad two-finger pan
          const controls = controlsRef.current;
          if (!controls) return;

          const panSpeed = 0.002;

          // Get camera's right and forward vectors projected onto the ground plane
          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);

          // Right vector (perpendicular to camera direction on XZ plane)
          const right = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x).normalize();

          // Forward vector (camera direction projected onto XZ plane)
          const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();

          // Calculate pan offset based on trackpad delta
          const panOffset = new THREE.Vector3()
            .addScaledVector(right, event.deltaX * panSpeed)
            .addScaledVector(forward, event.deltaY * panSpeed);

          // Apply pan to target and camera
          const newTarget = controls.target.clone().add(panOffset);

          // Clamp target within bounds
          newTarget.x = Math.max(-3, Math.min(3, newTarget.x));
          newTarget.z = Math.max(-3, Math.min(3, newTarget.z));
          newTarget.y = 0;

          controls.target.copy(newTarget);
          camera.position.add(panOffset);

          controls.update();
        }
      },
      [camera, zoomToPoint],
    );

    // Touch gesture state for pinch-to-zoom
    const touchStateRef = useRef({
      lastDistance: 0,
      lastCenter: { x: 0, y: 0 },
      isTwoFingerGesture: false,
    });

    // Handle touch start
    const handleTouchStart = useCallback((event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        // Calculate initial distance between two fingers
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        touchStateRef.current.lastDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate center point between two fingers
        touchStateRef.current.lastCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };

        touchStateRef.current.isTwoFingerGesture = true;
      }
    }, []);

    // Handle touch move for pinch-to-zoom
    const handleTouchMove = useCallback(
      (event: TouchEvent) => {
        if (!controlsRef.current || event.touches.length !== 2) return;
        if (!touchStateRef.current.isTwoFingerGesture) return;

        event.preventDefault();

        const controls = controlsRef.current;
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        // Calculate current distance between two fingers
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate center point between two fingers
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        // Calculate pinch zoom
        const pinchDelta = touchStateRef.current.lastDistance - currentDistance;

        if (Math.abs(pinchDelta) > 2) {
          const zoomIn = pinchDelta < 0;
          const zoomAmount = Math.abs(pinchDelta) * 0.005;
          zoomToPoint(centerX, centerY, zoomIn, zoomAmount);
        }

        // Calculate two-finger pan
        const panDeltaX = centerX - touchStateRef.current.lastCenter.x;
        const panDeltaY = centerY - touchStateRef.current.lastCenter.y;

        if (Math.abs(panDeltaX) > 1 || Math.abs(panDeltaY) > 1) {
          const panSpeed = 0.003;

          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);

          const right = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x).normalize();
          const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();

          const panOffset = new THREE.Vector3()
            .addScaledVector(right, -panDeltaX * panSpeed)
            .addScaledVector(forward, -panDeltaY * panSpeed);

          const newTarget = controls.target.clone().add(panOffset);
          newTarget.x = Math.max(-3, Math.min(3, newTarget.x));
          newTarget.z = Math.max(-3, Math.min(3, newTarget.z));
          newTarget.y = 0;

          controls.target.copy(newTarget);
          camera.position.add(panOffset);

          controls.update();
        }

        // Update last values
        touchStateRef.current.lastDistance = currentDistance;
        touchStateRef.current.lastCenter = { x: centerX, y: centerY };
      },
      [camera, zoomToPoint],
    );

    // Handle touch end
    const handleTouchEnd = useCallback((event: TouchEvent) => {
      if (event.touches.length < 2) {
        touchStateRef.current.isTwoFingerGesture = false;
      }
    }, []);

    // Register event handlers
    useEffect(() => {
      const canvas = gl.domElement;

      // Wheel/trackpad events
      canvas.addEventListener('wheel', handleWheel, { passive: false });

      // Touch events for mobile pinch-to-zoom
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);

      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }, [gl.domElement, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Convert normalized hand position (0-1) to screen coordinates
    const handPositionToScreen = useCallback(
      (handPos: { x: number; y: number } | null) => {
        if (!handPos) return null;
        const rect = gl.domElement.getBoundingClientRect();
        // Hand tracking x is mirrored (0 = right side of camera view)
        // So we need to flip it: 1 - x
        return {
          x: rect.left + (1 - handPos.x) * rect.width,
          y: rect.top + handPos.y * rect.height,
        };
      },
      [gl.domElement],
    );

    // Apply gesture changes
    useEffect(() => {
      if (!gestureState || gestureState.gesture === 'none') return;

      if (gestureState.shouldReset) {
        // Reset to default view
        targetRef.current = {
          azimuthalAngle: 0,
          polarAngle: Math.PI / 3,
          distance: 5,
        };
        // Also reset the OrbitControls target
        if (controlsRef.current) {
          controlsRef.current.target.set(...DEFAULT_CAMERA.target);
          camera.position.set(...DEFAULT_CAMERA.position);
          controlsRef.current.update();
        }
      } else {
        // Apply rotation deltas
        if (gestureState.rotationDeltaY !== 0) {
          targetRef.current.azimuthalAngle += gestureState.rotationDeltaY;
        }

        if (gestureState.rotationDeltaX !== 0) {
          targetRef.current.polarAngle = Math.max(
            0.1,
            Math.min(Math.PI / 2.1, targetRef.current.polarAngle + gestureState.rotationDeltaX),
          );
        }

        // Apply zoom delta using zoomToPoint for hand gestures
        if (gestureState.zoomDelta !== 0 && gestureState.handPosition) {
          const screenPos = handPositionToScreen(gestureState.handPosition);
          if (screenPos) {
            const zoomIn = gestureState.zoomDelta > 0;
            const zoomAmount = Math.abs(gestureState.zoomDelta) * 0.3;
            zoomToPoint(screenPos.x, screenPos.y, zoomIn, zoomAmount);
          }
        } else if (gestureState.zoomDelta !== 0) {
          // Fallback to center zoom if no hand position
          targetRef.current.distance = Math.max(
            0.3,
            Math.min(10, targetRef.current.distance - gestureState.zoomDelta * 2),
          );
        }
      }
    }, [gestureState, handPositionToScreen, zoomToPoint, camera]);

    // Smooth interpolation in animation frame
    useFrame(() => {
      if (!controlsRef.current) return;

      const target = targetRef.current;

      // Smooth interpolation factor
      const lerp = 0.08;

      // Get current values from controls
      const controls = controlsRef.current;
      const currentAzimuth = controls.getAzimuthalAngle();
      const currentPolar = controls.getPolarAngle();
      const currentDistance = controls.getDistance();

      // Apply only if gesture is active
      if (gestureState && gestureState.gesture !== 'none') {
        // Interpolate towards target
        const newAzimuth = currentAzimuth + (target.azimuthalAngle - currentAzimuth) * lerp;
        const newPolar = currentPolar + (target.polarAngle - currentPolar) * lerp;
        const newDistance = currentDistance + (target.distance - currentDistance) * lerp;

        // Calculate new camera position based on spherical coordinates
        const x = newDistance * Math.sin(newPolar) * Math.sin(newAzimuth);
        const y = newDistance * Math.cos(newPolar);
        const z = newDistance * Math.sin(newPolar) * Math.cos(newAzimuth);

        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
        controls.update();
      }
    });

    return (
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        enableZoom={false} // Disable default zoom, we handle it with custom wheel handler
        enablePan={true}
        panSpeed={0.8}
        minDistance={0.3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.1}
      />
    );
  },
);
