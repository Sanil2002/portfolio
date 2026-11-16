"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  images: string[];
  active: number;
  /** 0 → 1 lid opening, driven by scroll. */
  open: React.MutableRefObject<number>;
  reduced: boolean;
  mobile: boolean;
};

function Laptop({ images, active, open, reduced }: Props) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const { pointer } = useThree();
  const textures = useTexture(images);
  const flash = useRef(0);

  useMemo(() => textures.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace)), [textures]);

  // Brief "screen blink" when the project changes.
  useEffect(() => {
    flash.current = 1;
  }, [active]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 30);
    const r = root.current;
    if (r) {
      r.rotation.y = THREE.MathUtils.damp(r.rotation.y, -0.35 + pointer.x * 0.35, 3, d);
      r.rotation.x = THREE.MathUtils.damp(r.rotation.x, 0.15 - pointer.y * 0.12, 3, d);
      if (!reduced) r.position.y = -0.35 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
    // Lid hinge: closed = 0 rad (flat on base), open ≈ 105°.
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, -open.current * 1.85, 5, d);
    if (screen.current) {
      flash.current = THREE.MathUtils.damp(flash.current, 0, 6, d);
      if (flash.current > 0.5 && screen.current.map !== textures[active]) {
        screen.current.map = textures[active];
        screen.current.needsUpdate = true;
      }
      screen.current.color.setScalar(1 - Math.sin(flash.current * Math.PI) * 0.85);
    }
  });

  const W = 3.2, D = 2.1, T = 0.12;
  return (
    <group ref={root} position={[0, -0.35, 0]}>
      {/* Base */}
      <RoundedBox args={[W, T, D]} radius={0.05} smoothness={2} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1f1f1c" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      {/* Keyboard deck + trackpad */}
      <mesh position={[0, T / 2 + 0.001, -0.2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[W * 0.86, D * 0.45]} />
        <meshStandardMaterial color="#121210" roughness={0.9} />
      </mesh>
      <mesh position={[0, T / 2 + 0.002, 0.65]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.1, 0.55]} />
        <meshStandardMaterial color="#2a2a26" roughness={0.6} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[0.5, 0.03]} />
        <meshBasicMaterial color="#ff5b1f" />
      </mesh>
      {/* Lid hinged at the back edge */}
      <group ref={lid} position={[0, T / 2, -D / 2]}>
        {/* Screen faces down when closed, toward the camera when open. */}
        <group position={[0, 0.075, D / 2]} rotation-x={Math.PI / 2}>
          <RoundedBox args={[W, D, 0.07]} radius={0.04} smoothness={2} position={[0, 0, -0.04]}>
            <meshStandardMaterial color="#1f1f1c" metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[W * 0.92, D * 0.88]} />
            <meshBasicMaterial ref={screen} map={textures[active]} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function LaptopScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      {visible && (
        <Canvas
          dpr={[1, props.mobile ? 1.5 : 2]}
          frameloop={props.reduced ? "demand" : "always"}
          camera={{ position: [0, 1.6, 5.4], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          eventSource={document.body}
          eventPrefix="client"
          onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 6, 4]} intensity={2.2} />
          <pointLight position={[-3, 1, 3]} intensity={18} color="#ff5b1f" />
          <Laptop {...props} />
          <Environment resolution={128}>
            <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 2, 1]} />
            <Lightformer intensity={1.2} color="#ff9a6b" position={[-4, 0, 1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
          </Environment>
        </Canvas>
      )}
    </div>
  );
}
