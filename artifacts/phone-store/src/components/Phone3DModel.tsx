import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, PresentationControls, RoundedBox } from '@react-three/drei';

interface PhoneModelProps {
  interactive?: boolean;
  scale?: number;
}

// iPhone 17 Pro Max — accurate proportions
const PW = 1.44;
const PH = 3.12;
const PD = 0.118;

export function Phone3DModel({ interactive = false, scale = 1 }: PhoneModelProps) {
  const groupRef   = useRef<THREE.Group>(null);
  const screenRef  = useRef<THREE.MeshStandardMaterial>(null);
  const lensGlass1 = useRef<THREE.MeshStandardMaterial>(null);
  const lensGlass2 = useRef<THREE.MeshStandardMaterial>(null);
  const lensGlass3 = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!interactive && groupRef.current) {
      groupRef.current.rotation.y = t * 0.38;
      groupRef.current.rotation.x = Math.sin(t * 0.22) * 0.07;
      groupRef.current.rotation.z = Math.sin(t * 0.14) * 0.012;
    }

    // Breathing OLED glow
    if (screenRef.current) {
      screenRef.current.emissiveIntensity = 0.13 + Math.sin(t * 1.6) * 0.04;
    }

    // Lens shimmer — staggered timing
    if (lensGlass1.current) lensGlass1.current.envMapIntensity = 5.0 + Math.sin(t * 2.4)       * 2.0;
    if (lensGlass2.current) lensGlass2.current.envMapIntensity = 5.0 + Math.sin(t * 2.4 + 1.2) * 2.0;
    if (lensGlass3.current) lensGlass3.current.envMapIntensity = 5.0 + Math.sin(t * 2.4 + 2.4) * 2.0;
  });

  const phone = (
    <group ref={groupRef} scale={scale}>

      {/* ━━━ TITANIUM FRAME ━━━ */}
      <RoundedBox args={[PW, PH, PD]} radius={0.13} smoothness={14}>
        <meshStandardMaterial
          color="#7E7264"
          metalness={0.97}
          roughness={0.07}
          envMapIntensity={3.2}
        />
      </RoundedBox>

      {/* Inner frame inset — slightly darker band on sides */}
      <RoundedBox args={[PW - 0.025, PH - 0.025, PD + 0.001]} radius={0.125} smoothness={14}>
        <meshStandardMaterial
          color="#6A6050"
          metalness={0.97}
          roughness={0.11}
          envMapIntensity={2.0}
        />
      </RoundedBox>

      {/* ━━━ BACK CERAMIC GLASS ━━━ */}
      <mesh position={[0, 0, -(PD / 2) - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[PW - 0.065, PH - 0.065]} />
        <meshStandardMaterial
          color="#0D0F18"
          metalness={0.14}
          roughness={0.04}
          envMapIntensity={2.8}
        />
      </mesh>

      {/* ━━━ FRONT SCREEN — Super Retina XDR ━━━ */}
      <mesh position={[0, 0, PD / 2 + 0.001]}>
        <planeGeometry args={[PW - 0.065, PH - 0.065]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#020510"
          metalness={0.04}
          roughness={0.008}
          emissive="#071435"
          emissiveIntensity={0.13}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Screen edge glow strip — top */}
      <mesh position={[0, PH / 2 - 0.065, PD / 2 + 0.0015]}>
        <planeGeometry args={[PW - 0.065, 0.09]} />
        <meshStandardMaterial color="#060C22" metalness={0.04} roughness={0.01} transparent opacity={0.5} />
      </mesh>

      {/* ━━━ HOME INDICATOR ━━━ */}
      <mesh position={[0, -(PH / 2) + 0.23, PD / 2 + 0.002]}>
        <RoundedBox args={[0.4, 0.022, 0.001]} radius={0.011} smoothness={6}>
          <meshStandardMaterial color="#FFFFFF" metalness={0.0} roughness={0.4} transparent opacity={0.2} />
        </RoundedBox>
      </mesh>

      {/* ━━━ DYNAMIC ISLAND ━━━ */}
      <mesh position={[0, PH / 2 - 0.21, PD / 2 + 0.004]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.053, 0.23, 10, 24]} />
        <meshStandardMaterial color="#000000" metalness={0.08} roughness={0.02} />
      </mesh>
      {/* Face ID / front camera dot (right side of pill) */}
      <mesh position={[0.115, PH / 2 - 0.21, PD / 2 + 0.005]}>
        <circleGeometry args={[0.024, 20]} />
        <meshStandardMaterial color="#080810" metalness={0.3} roughness={0.15} />
      </mesh>

      {/* ━━━ CAMERA MODULE — top-left back ━━━ */}
      <group position={[-PW / 2 + 0.445, PH / 2 - 0.545, -(PD / 2) - 0.034]}>

        {/* Module housing */}
        <RoundedBox args={[0.83, 0.83, 0.068]} radius={0.125} smoothness={10}>
          <meshStandardMaterial color="#090909" metalness={0.6} roughness={0.22} envMapIntensity={2.0} />
        </RoundedBox>

        {/* Outer decorative ring around entire module */}
        <mesh position={[0, 0, 0.035]}>
          <torusGeometry args={[0.405, 0.006, 6, 72]} />
          <meshStandardMaterial color="#1E1C1A" metalness={0.85} roughness={0.12} transparent opacity={0.5} />
        </mesh>

        {/* ── MAIN CAMERA — bottom-left, largest ── */}
        <group position={[-0.2, -0.185, 0.036]}>
          {/* Outer housing ring */}
          <mesh>
            <torusGeometry args={[0.160, 0.027, 12, 64]} />
            <meshStandardMaterial color="#1C1A18" metalness={0.95} roughness={0.07} envMapIntensity={2.2} />
          </mesh>
          {/* Inner barrel ring */}
          <mesh position={[0, 0, 0.004]}>
            <torusGeometry args={[0.130, 0.011, 8, 64]} />
            <meshStandardMaterial color="#2E2A26" metalness={0.92} roughness={0.11} />
          </mesh>
          {/* Lens glass — deep blue-black anti-reflective */}
          <mesh position={[0, 0, 0.007]}>
            <circleGeometry args={[0.118, 64]} />
            <meshStandardMaterial
              ref={lensGlass1}
              color="#030816"
              metalness={0.04}
              roughness={0.002}
              envMapIntensity={5.0}
            />
          </mesh>
          {/* Lens element ring 1 */}
          <mesh position={[0, 0, 0.009]}>
            <torusGeometry args={[0.076, 0.005, 6, 56]} />
            <meshStandardMaterial color="#0D1528" metalness={0.08} roughness={0.01} transparent opacity={0.65} />
          </mesh>
          {/* Lens element ring 2 */}
          <mesh position={[0, 0, 0.011]}>
            <torusGeometry args={[0.044, 0.004, 6, 48]} />
            <meshStandardMaterial color="#0D1528" metalness={0.08} roughness={0.01} transparent opacity={0.55} />
          </mesh>
          {/* Center aperture */}
          <mesh position={[0, 0, 0.013]}>
            <circleGeometry args={[0.022, 28]} />
            <meshStandardMaterial color="#010108" metalness={0.55} roughness={0.0} />
          </mesh>
          {/* Tiny center highlight */}
          <mesh position={[0.028, 0.028, 0.014]}>
            <circleGeometry args={[0.007, 12]} />
            <meshStandardMaterial color="#8090C0" metalness={0.1} roughness={0.0} transparent opacity={0.35} />
          </mesh>
        </group>

        {/* ── ULTRA-WIDE — top-center ── */}
        <group position={[0.1, 0.2, 0.036]}>
          {/* Housing ring */}
          <mesh>
            <torusGeometry args={[0.120, 0.021, 12, 64]} />
            <meshStandardMaterial color="#1C1A18" metalness={0.95} roughness={0.07} envMapIntensity={2.2} />
          </mesh>
          {/* Barrel ring */}
          <mesh position={[0, 0, 0.004]}>
            <torusGeometry args={[0.097, 0.009, 8, 64]} />
            <meshStandardMaterial color="#2E2A26" metalness={0.92} roughness={0.11} />
          </mesh>
          {/* Lens glass */}
          <mesh position={[0, 0, 0.007]}>
            <circleGeometry args={[0.087, 64]} />
            <meshStandardMaterial
              ref={lensGlass2}
              color="#040918"
              metalness={0.04}
              roughness={0.002}
              envMapIntensity={5.0}
            />
          </mesh>
          {/* Element ring */}
          <mesh position={[0, 0, 0.009]}>
            <torusGeometry args={[0.055, 0.004, 6, 48]} />
            <meshStandardMaterial color="#0D1528" metalness={0.08} roughness={0.01} transparent opacity={0.6} />
          </mesh>
          {/* Aperture */}
          <mesh position={[0, 0, 0.011]}>
            <circleGeometry args={[0.016, 24]} />
            <meshStandardMaterial color="#010108" metalness={0.55} roughness={0.0} />
          </mesh>
          <mesh position={[0.02, 0.02, 0.012]}>
            <circleGeometry args={[0.005, 10]} />
            <meshStandardMaterial color="#8090C0" metalness={0.1} roughness={0.0} transparent opacity={0.3} />
          </mesh>
        </group>

        {/* ── TETRAPRISM TELEPHOTO — bottom-right ── */}
        <group position={[0.207, -0.175, 0.036]}>
          {/* Housing ring */}
          <mesh>
            <torusGeometry args={[0.138, 0.023, 12, 64]} />
            <meshStandardMaterial color="#1C1A18" metalness={0.95} roughness={0.07} envMapIntensity={2.2} />
          </mesh>
          {/* Barrel ring */}
          <mesh position={[0, 0, 0.004]}>
            <torusGeometry args={[0.113, 0.010, 8, 64]} />
            <meshStandardMaterial color="#2E2A26" metalness={0.92} roughness={0.11} />
          </mesh>
          {/* Lens glass */}
          <mesh position={[0, 0, 0.007]}>
            <circleGeometry args={[0.102, 64]} />
            <meshStandardMaterial
              ref={lensGlass3}
              color="#040918"
              metalness={0.04}
              roughness={0.002}
              envMapIntensity={5.0}
            />
          </mesh>
          {/* Element ring 1 */}
          <mesh position={[0, 0, 0.009]}>
            <torusGeometry args={[0.066, 0.005, 6, 56]} />
            <meshStandardMaterial color="#0D1528" metalness={0.08} roughness={0.01} transparent opacity={0.6} />
          </mesh>
          {/* Element ring 2 */}
          <mesh position={[0, 0, 0.011]}>
            <torusGeometry args={[0.038, 0.003, 6, 48]} />
            <meshStandardMaterial color="#0D1528" metalness={0.08} roughness={0.01} transparent opacity={0.5} />
          </mesh>
          {/* Aperture */}
          <mesh position={[0, 0, 0.013]}>
            <circleGeometry args={[0.019, 28]} />
            <meshStandardMaterial color="#010108" metalness={0.55} roughness={0.0} />
          </mesh>
          <mesh position={[0.024, 0.024, 0.014]}>
            <circleGeometry args={[0.006, 12]} />
            <meshStandardMaterial color="#8090C0" metalness={0.1} roughness={0.0} transparent opacity={0.32} />
          </mesh>
        </group>

        {/* ── LiDAR SCANNER ── */}
        <group position={[0.265, 0.03, 0.036]}>
          <mesh>
            <torusGeometry args={[0.050, 0.013, 10, 36]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.72} roughness={0.22} />
          </mesh>
          {/* Inner grid pattern (simplified) */}
          <mesh position={[0, 0, 0.003]}>
            <circleGeometry args={[0.035, 36]} />
            <meshStandardMaterial color="#060606" metalness={0.28} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.004]}>
            <torusGeometry args={[0.018, 0.003, 4, 24]} />
            <meshStandardMaterial color="#0A0A0A" metalness={0.4} roughness={0.25} />
          </mesh>
        </group>

        {/* ── TRUE TONE FLASH ── */}
        <mesh position={[-0.265, 0.30, 0.038]}>
          <RoundedBox args={[0.106, 0.08, 0.022]} radius={0.030} smoothness={6}>
            <meshStandardMaterial
              color="#EDE6CC"
              metalness={0.04}
              roughness={0.24}
              emissive="#FFF9C0"
              emissiveIntensity={0.06}
            />
          </RoundedBox>
        </mesh>

        {/* ── MICROPHONE ── */}
        <mesh position={[-0.325, -0.09, 0.036]}>
          <circleGeometry args={[0.025, 18]} />
          <meshStandardMaterial color="#050505" metalness={0.2} roughness={0.55} />
        </mesh>

      </group>

      {/* ━━━ ACTION BUTTON (left, upper) ━━━ */}
      <mesh position={[-(PW / 2) - 0.013, PH * 0.23, 0]}>
        <RoundedBox args={[0.050, 0.136, PD * 0.73]} radius={0.015} smoothness={6}>
          <meshStandardMaterial color="#6A5E50" metalness={0.97} roughness={0.09} envMapIntensity={1.8} />
        </RoundedBox>
      </mesh>

      {/* ━━━ VOLUME UP ━━━ */}
      <mesh position={[-(PW / 2) - 0.013, PH * 0.10, 0]}>
        <RoundedBox args={[0.050, 0.21, PD * 0.73]} radius={0.015} smoothness={6}>
          <meshStandardMaterial color="#6A5E50" metalness={0.97} roughness={0.09} envMapIntensity={1.8} />
        </RoundedBox>
      </mesh>

      {/* ━━━ VOLUME DOWN ━━━ */}
      <mesh position={[-(PW / 2) - 0.013, -PH * 0.044, 0]}>
        <RoundedBox args={[0.050, 0.21, PD * 0.73]} radius={0.015} smoothness={6}>
          <meshStandardMaterial color="#6A5E50" metalness={0.97} roughness={0.09} envMapIntensity={1.8} />
        </RoundedBox>
      </mesh>

      {/* ━━━ POWER BUTTON (right) ━━━ */}
      <mesh position={[PW / 2 + 0.013, PH * 0.065, 0]}>
        <RoundedBox args={[0.050, 0.31, PD * 0.73]} radius={0.015} smoothness={6}>
          <meshStandardMaterial color="#6A5E50" metalness={0.97} roughness={0.09} envMapIntensity={1.8} />
        </RoundedBox>
      </mesh>

      {/* ━━━ USB-C PORT ━━━ */}
      <mesh position={[0, -(PH / 2) - 0.001, 0]}>
        <RoundedBox args={[0.225, 0.048, PD * 0.78]} radius={0.019} smoothness={4}>
          <meshStandardMaterial color="#020202" metalness={0.6} roughness={0.42} />
        </RoundedBox>
      </mesh>

      {/* ━━━ SPEAKER DOTS — left cluster ━━━ */}
      {([-0.39, -0.34, -0.29, -0.24] as number[]).map((x, i) => (
        <mesh key={`sl${i}`} position={[x, -(PH / 2) - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.017, 8]} />
          <meshStandardMaterial color="#020202" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}

      {/* ━━━ SPEAKER DOTS — right cluster ━━━ */}
      {([0.24, 0.29, 0.34, 0.39] as number[]).map((x, i) => (
        <mesh key={`sr${i}`} position={[x, -(PH / 2) - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.017, 8]} />
          <meshStandardMaterial color="#020202" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}

      {/* ━━━ APPLE LOGO (back center) ━━━ */}
      {/* Outer circle */}
      <mesh position={[0, 0.14, -(PD / 2) - 0.002]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.088, 0.115, 36]} />
        <meshStandardMaterial color="#1C1A16" metalness={0.62} roughness={0.05} envMapIntensity={1.0} />
      </mesh>
      {/* Inner filled disk */}
      <mesh position={[0, 0.14, -(PD / 2) - 0.0025]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.088, 36]} />
        <meshStandardMaterial color="#161410" metalness={0.35} roughness={0.06} envMapIntensity={0.6} />
      </mesh>
      {/* Stem nub */}
      <mesh position={[0, 0.238, -(PD / 2) - 0.0025]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.016, 12]} />
        <meshStandardMaterial color="#161410" metalness={0.35} roughness={0.06} />
      </mesh>

    </group>
  );

  if (interactive) {
    return (
      <PresentationControls
        global
        snap={false}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        speed={1.5}
      >
        <Float rotationIntensity={0.12} floatIntensity={0.5} speed={1.5}>
          {phone}
        </Float>
      </PresentationControls>
    );
  }

  return (
    <Float rotationIntensity={0.35} floatIntensity={2.2} speed={1.8}>
      {phone}
    </Float>
  );
}
