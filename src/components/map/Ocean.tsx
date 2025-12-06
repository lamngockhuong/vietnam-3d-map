'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Vietnam map center position for depth gradient
const MAP_CENTER = { x: 0, z: 0 };

/**
 * Ocean - Creates animated water surface with specular highlights and ripples
 * Blends seamlessly with SkyDome at edges
 */
export function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const { geometry, material } = useMemo(() => {
    // Large ocean plane with higher resolution for ripples
    const geo = new THREE.PlaneGeometry(60, 60, 256, 256);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // Ocean colors - tropical depth gradient (slightly muted for realism)
        coastColor: { value: new THREE.Color(0x35c4b8) }, // Muted turquoise (shallow/coast)
        shallowColor: { value: new THREE.Color(0x3bb8b0) }, // Medium turquoise
        midColor: { value: new THREE.Color(0x1a9a92) }, // Light sea green
        deepColor: { value: new THREE.Color(0x156d7a) }, // Deeper teal
        abyssColor: { value: new THREE.Color(0x0a4d5e) }, // Deep ocean blue
        edgeColor: { value: new THREE.Color(0x0a3248) }, // Deep navy (matches sky outer)
        mapCenter: { value: new THREE.Vector2(MAP_CENTER.x, MAP_CENTER.z) },
        // Sunlight direction for specular
        sunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
        sunColor: { value: new THREE.Color(0xffffff) },
        // Camera position for specular/fresnel (custom name to avoid redefinition)
        viewPos: { value: new THREE.Vector3(0, 3, 4) },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vWorldPos;
        varying float vEdgeFade;
        varying vec3 vNormal;

        // Simplex noise functions for natural ripples
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Distance from center for wave scaling and edge fade
          float distFromCenter = length(pos.xy);

          // Wave amplitude decreases towards edges for smoother blend
          float waveScale = 1.0 - smoothstep(0.0, 25.0, distFromCenter);

          // Multi-layered ripples using noise
          float ripple1 = snoise(vec3(pos.xy * 0.8, time * 0.3)) * 0.02 * waveScale;
          float ripple2 = snoise(vec3(pos.xy * 1.5, time * 0.5 + 100.0)) * 0.01 * waveScale;
          float ripple3 = snoise(vec3(pos.xy * 3.0, time * 0.8 + 200.0)) * 0.005 * waveScale;

          // Larger rolling waves
          float wave1 = sin(pos.x * 0.8 + time * 0.4) * 0.025 * waveScale;
          float wave2 = sin(pos.y * 0.6 + time * 0.35) * 0.02 * waveScale;
          float wave3 = sin((pos.x + pos.y) * 0.5 + time * 0.45) * 0.015 * waveScale;

          pos.z = wave1 + wave2 + wave3 + ripple1 + ripple2 + ripple3;
          vElevation = pos.z;
          vWorldPos = pos;

          // Calculate normal for specular lighting
          float eps = 0.1;
          float hL = snoise(vec3((pos.xy + vec2(-eps, 0.0)) * 0.8, time * 0.3)) * 0.02;
          float hR = snoise(vec3((pos.xy + vec2(eps, 0.0)) * 0.8, time * 0.3)) * 0.02;
          float hD = snoise(vec3((pos.xy + vec2(0.0, -eps)) * 0.8, time * 0.3)) * 0.02;
          float hU = snoise(vec3((pos.xy + vec2(0.0, eps)) * 0.8, time * 0.3)) * 0.02;
          vNormal = normalize(vec3(hL - hR, hD - hU, eps * 2.0));

          // Edge fade factor - used to blend ocean into sky at edges
          vEdgeFade = smoothstep(20.0, 30.0, distFromCenter);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 coastColor;
        uniform vec3 shallowColor;
        uniform vec3 midColor;
        uniform vec3 deepColor;
        uniform vec3 abyssColor;
        uniform vec3 edgeColor;
        uniform vec2 mapCenter;
        uniform float time;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 viewPos;

        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vWorldPos;
        varying float vEdgeFade;
        varying vec3 vNormal;

        void main() {
          // Distance from map center
          float dist = length(vWorldPos.xy - mapCenter);

          // Depth zones - smooth transitions for tropical gradient
          float coastZone = 1.0 - smoothstep(0.0, 4.0, dist);
          float shallowZone = smoothstep(3.0, 8.0, dist);
          float midZone = smoothstep(7.0, 14.0, dist);
          float deepZone = smoothstep(12.0, 20.0, dist);
          float abyssZone = smoothstep(18.0, 26.0, dist);
          float edgeZone = smoothstep(24.0, 30.0, dist);

          // Mix colors based on depth zones - tropical gradient
          vec3 color = coastColor;
          color = mix(color, shallowColor, shallowZone);
          color = mix(color, midColor, midZone);
          color = mix(color, deepColor, deepZone);
          color = mix(color, abyssColor, abyssZone);
          color = mix(color, edgeColor, edgeZone);

          // Subtle animated caustic patterns (only in shallow areas, very soft)
          float caustic1 = sin(vWorldPos.x * 4.0 + time * 0.8) * sin(vWorldPos.y * 4.0 + time * 0.6);
          float caustic2 = sin(vWorldPos.x * 3.0 - time * 0.7) * sin(vWorldPos.y * 3.5 - time * 0.5);
          float caustics = (caustic1 + caustic2) * 0.5 * 0.03 * (1.0 - shallowZone); // Reduced intensity
          color += caustics * vec3(0.2, 0.5, 0.6);

          // Specular highlights - sun reflection (softened for realism)
          vec3 viewDir = normalize(viewPos - vec3(vWorldPos.xy, 0.0));
          vec3 normal = normalize(vec3(vNormal.xy * 0.3, 1.0)); // Reduced normal influence for smoother surface
          vec3 reflectDir = reflect(-sunDirection, normal);

          // Very soft, diffused specular (high roughness simulation)
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Lower exponent = wider, softer highlight
          float specIntensity = spec * 0.25 * (1.0 - midZone * 0.7); // Reduced intensity

          color += specIntensity * sunColor * (1.0 - vEdgeFade);

          // Very subtle wave highlights
          float highlight = vElevation * 4.0 + 0.5;
          color = mix(color, color * 1.08, smoothstep(0.45, 0.55, highlight) * 0.08 * (1.0 - midZone));

          // Gentle fresnel effect
          float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 0.0, 1.0)), 0.0), 4.0);
          color = mix(color, color * 1.05, fresnel * 0.1 * (1.0 - vEdgeFade));

          // Fade to transparent at edges to blend with sky
          float alpha = 1.0 - vEdgeFade * 0.4;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = state.clock.elapsedTime * 0.5;
      material.uniforms.viewPos.value.copy(camera.position);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, 0]}
    />
  );
}
