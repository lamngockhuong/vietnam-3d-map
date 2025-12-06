'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * SkyDome - Creates a seamless spherical gradient background
 * Transitions from bright cyan at center/bottom to dark blue at edges
 * No hard horizon line - everything blends smoothly
 */
export function SkyDome() {
  const { geometry, material } = useMemo(() => {
    // Large sphere that encompasses the entire scene
    const geo = new THREE.SphereGeometry(50, 64, 64);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        // Gradient colors - from center (bright) to edge (dark)
        centerColor: { value: new THREE.Color(0x7dd3e8) }, // Soft bright cyan
        midColor: { value: new THREE.Color(0x4db6d4) }, // Medium cyan
        edgeColor: { value: new THREE.Color(0x1a5a7a) }, // Dark desaturated blue
        outerColor: { value: new THREE.Color(0x0d3a52) }, // Deep navy at far edges
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 centerColor;
        uniform vec3 midColor;
        uniform vec3 edgeColor;
        uniform vec3 outerColor;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          // Calculate distance from center (0,0,0) in world space
          // Use a combination of horizontal distance and vertical position
          vec3 center = vec3(0.0, 0.0, 0.0);

          // Horizontal distance from center
          float horizDist = length(vWorldPosition.xz);

          // Vertical factor - higher = darker (simulating looking up at sky)
          float vertFactor = (vWorldPosition.y + 20.0) / 40.0; // Normalize y position
          vertFactor = clamp(vertFactor, 0.0, 1.0);

          // Combined radial factor - center is 0, edges are 1
          float radialDist = length(vWorldPosition) / 50.0;

          // Blend horizontal and vertical for smooth spherical gradient
          float gradientFactor = mix(horizDist / 30.0, radialDist, 0.5);
          gradientFactor = clamp(gradientFactor, 0.0, 1.0);

          // Add vertical influence - top of dome is darker
          gradientFactor = mix(gradientFactor, vertFactor * 0.8 + gradientFactor * 0.2, 0.4);

          // Smooth step transitions for natural blending
          float zone1 = smoothstep(0.0, 0.3, gradientFactor);   // center to mid
          float zone2 = smoothstep(0.3, 0.6, gradientFactor);   // mid to edge
          float zone3 = smoothstep(0.6, 1.0, gradientFactor);   // edge to outer

          // Mix colors based on zones
          vec3 color = centerColor;
          color = mix(color, midColor, zone1);
          color = mix(color, edgeColor, zone2);
          color = mix(color, outerColor, zone3);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide, // Render inside of sphere
      depthWrite: false, // Don't write to depth buffer
    });

    return { geometry: geo, material: mat };
  }, []);

  return <mesh geometry={geometry} material={material} />;
}
