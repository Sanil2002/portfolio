"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  /** 0 → 1 as the hero scrolls out; drives scale / position / distortion. */
  progress: React.MutableRefObject<number>;
  onOrbClick?: () => void;
  reduced: boolean;
  mobile: boolean;
};

function Orb({ progress, onOrbClick, reduced, mobile }: Props) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.Material & { distort: number; speed: number }>(null);
  const { viewport, pointer } = useThree();
  const [hover, setHover] = useState(false);
  const punch = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    const d = Math.min(dt, 1 / 30);

    // Soft follow + parallax tilt toward cursor (eased).
    const targetX = (mobile ? 0 : viewport.width * 0.18) + pointer.x * 0.6 + p * viewport.width * 0.15;
    const targetY = pointer.y * 0.4 - p * viewport.height * 0.35;
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 3, d);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 3, d);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.5 + p * 1.5, 3, d);
    g.rotation.y += d * (reduced ? 0 : 0.15) + (pointer.x * 0.5 - g.rotation.y) * 0.02;

    const base = Math.min(viewport.width, viewport.height) * (mobile ? 0.32 : 0.28);
    punch.current = THREE.MathUtils.damp(punch.current, 0, 6, d);
    const s = base * (1 - p * 0.45) * (hover ? 1.06 : 1) * (1 + punch.current);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 4, d));

    if (mat.current) {
      mat.current.distort = THREE.MathUtils.damp(mat.current.distort, (hover ? 0.55 : 0.35) + p * 0.35 + punch.current, 4, d);
    }
  });

  return (
    <Float speed={reduced ? 0 : 1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={group}>
        <mesh
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onClick={() => {
            punch.current = 0.25;
            onOrbClick?.();
          }}
        >
          <icosahedronGeometry args={[1, mobile ? 24 : 64]} />
          <MeshDistortMaterial
            ref={mat as never}
            color="#ff5b1f"
            roughness={0.15}
            metalness={0.3}
            distort={0.35}
            speed={reduced ? 0 : 1.6}
            envMapIntensity={1.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function OrbScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering when the hero is offscreen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, props.mobile ? 1.5 : 2]}
        frameloop={visible ? (props.reduced ? "demand" : "always") : "never"}
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <pointLight position={[-4, -2, 2]} intensity={30} color="#ffb18a" />
        <Orb {...props} />
        {/* Local studio lighting — no HDR download. */}
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
          <Lightformer intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer intensity={1.5} color="#ff9a6b" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
