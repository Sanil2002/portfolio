"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { play } from "@/lib/sound";

export type CanSpec = { id: string; label: string; group: string };

type Props = {
  cans: CanSpec[];
  active: string;
  onSelect: (id: string) => void;
  /** Touch / reduced motion: static floating cans, no physics or dragging. */
  staticMode: boolean;
};

const PALETTE = [
  { body: "#ff5b1f", ink: "#0e0e0c" },
  { body: "#f2ede4", ink: "#0e0e0c" },
  { body: "#1a1a17", ink: "#ff5b1f" },
];

const R = 0.85, H = 2.3;

/** Paints a wrap-around can label to a canvas texture. */
function useLabel(label: string, group: string, i: number) {
  return useMemo(() => {
    const { body, ink } = PALETTE[i % PALETTE.length];
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = body; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = ink;
    g.fillRect(0, 40, 1024, 6); g.fillRect(0, 466, 1024, 6);
    g.textAlign = "center";
    g.font = "600 30px Arial, sans-serif";
    g.fillText("SM.  CODE  CO.", 256, 100);
    g.fillText(group.toUpperCase(), 768, 100);
    const words = label.toUpperCase().split(" ");
    // Auto-fit each word to the camera-facing third of the can.
    words.forEach((w, k) => {
      let size = words.length > 1 ? 120 : 150;
      g.font = `${size}px Impact, 'Arial Black', sans-serif`;
      const max = 330;
      const m = g.measureText(w).width;
      if (m > max) { size = Math.floor((size * max) / m); g.font = `${size}px Impact, 'Arial Black', sans-serif`; }
      g.fillText(w, 512, 250 + k * 120 - (words.length - 1) * 50);
    });
    g.font = "600 26px Arial, sans-serif";
    g.fillText("FRESHLY BREWED IN KERALA · EST. 2024", 512, 440);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [label, group, i]);
}

function CanMesh({ spec, i, active, onDown }: { spec: CanSpec; i: number; active: boolean; onDown?: (e: ThreeEvent<PointerEvent>) => void }) {
  const tex = useLabel(spec.label, spec.group, i);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <mesh castShadow onPointerDown={onDown}>
        {/* thetaStart = PI so the centre of the label faces the camera. */}
        <cylinderGeometry args={[R, R, H, 48, 1, true, Math.PI]} />
        <meshStandardMaterial map={tex} metalness={0.25} roughness={0.35} emissive={active ? "#ff5b1f" : "#000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, (s * H) / 2, 0]} rotation-x={(s * -Math.PI) / 2}>
          <circleGeometry args={[R, 48]} />
          <meshStandardMaterial color="#b9b4ab" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {/* Rim */}
      <mesh position={[0, H / 2, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[R * 0.97, 0.035, 8, 48]} />
        <meshStandardMaterial color="#cfcac1" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function PhysicsCans({ cans, active, onSelect }: Omit<Props, "staticMode">) {
  const { viewport, camera, pointer, raycaster } = useThree();
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const drag = useRef<{ i: number; offset: THREE.Vector3 } | null>(null);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const w = viewport.width, h = viewport.height;

  // Selecting a category from the list makes its can hop.
  useEffect(() => {
    const i = cans.findIndex((c) => c.id === active);
    bodies.current[i]?.applyImpulse({ x: (Math.random() - 0.5) * 2, y: 9, z: 0 }, true);
    bodies.current[i]?.applyTorqueImpulse({ x: 0, y: 0, z: (Math.random() - 0.5) * 2 }, true);
  }, [active, cans]);

  useEffect(() => {
    const up = () => {
      if (drag.current) play("pop");
      drag.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  useFrame(() => {
    const d = drag.current;
    if (!d) return;
    const b = bodies.current[d.i];
    if (!b) return;
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) return;
    const p = b.translation();
    const tx = THREE.MathUtils.clamp(hit.x - d.offset.x, -w / 2 + R, w / 2 - R);
    const ty = THREE.MathUtils.clamp(hit.y - d.offset.y, -h / 2 + H / 2, h / 2 - H / 2);
    // Velocity-follow: releasing keeps the velocity, so you can flick.
    b.setLinvel({ x: (tx - p.x) * 14, y: (ty - p.y) * 14, z: 0 }, true);
  });

  return (
    <>
      {/* Floor, ceiling and walls fitted to the visible area. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w, 0.5, 2]} position={[0, -h / 2 - 0.2, 0]} />
        <CuboidCollider args={[w, 0.5, 2]} position={[0, h / 2 + 9, 0]} />
        <CuboidCollider args={[0.5, h * 2, 2]} position={[-w / 2 - 0.5, 0, 0]} />
        <CuboidCollider args={[0.5, h * 2, 2]} position={[w / 2 + 0.5, 0, 0]} />
      </RigidBody>

      {cans.map((c, i) => {
        const x = ((i + 0.5) / cans.length - 0.5) * Math.min(w * 0.75, cans.length * 2.4);
        return (
          <RigidBody
            key={c.id}
            ref={(r) => { bodies.current[i] = r; }}
            colliders={false}
            // Staggered drop, all spawned below the ceiling.
            position={[x, h / 2 + 1.5 + i * 1.2, 0]}
            rotation={[0, 0, (i % 2 ? 1 : -1) * 0.08]}
            enabledTranslations={[true, true, false]}
            enabledRotations={[false, false, true]}
            restitution={0.35}
            friction={1}
            linearDamping={0.4}
            angularDamping={1.4}
            onContactForce={({ totalForceMagnitude }) => {
              if (totalForceMagnitude > 1500) play("hover");
            }}
          >
            <CylinderCollider args={[H / 2, R]} />
            <CanMesh
              spec={c}
              i={i}
              active={c.id === active}
              onDown={(e) => {
                e.stopPropagation();
                const b = bodies.current[i];
                if (!b) return;
                const p = b.translation();
                drag.current = { i, offset: new THREE.Vector3(e.point.x - p.x, e.point.y - p.y, 0) };
                document.body.style.userSelect = "none";
                onSelect(c.id);
                play("click");
              }}
            />
          </RigidBody>
        );
      })}
    </>
  );
}

function StaticCans({ cans, active, onSelect }: Omit<Props, "staticMode">) {
  const { viewport } = useThree();
  const span = Math.min(viewport.width * 0.85, cans.length * 2.2);
  return (
    <>
      {cans.map((c, i) => (
        <Float key={c.id} speed={1.2} floatIntensity={0.4} rotationIntensity={0.2}>
          <group
            position={[((i + 0.5) / cans.length - 0.5) * span, (i % 2 ? -0.4 : 0.3), 0]}
            rotation={[0, -0.4, (i % 2 ? 1 : -1) * 0.12]}
            scale={Math.min(1, viewport.width / (cans.length * 2))}
            onClick={() => onSelect(c.id)}
          >
            <CanMesh spec={c} i={i} active={c.id === active} />
          </group>
        </Float>
      ))}
    </>
  );
}

export default function CansScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount physics only once the section is near (cans "drop in"), pause when offscreen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setMounted(true);
    }, { threshold: 0.15 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" data-cursor={props.staticMode ? undefined : "Drag"}>
      {mounted && (
        <Canvas
          dpr={[1, props.staticMode ? 1.5 : 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0, 12], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 6]} intensity={2.2} />
          <pointLight position={[-5, -2, 4]} intensity={25} color="#ff5b1f" />
          {props.staticMode ? (
            <StaticCans {...props} />
          ) : (
            <Physics gravity={[0, -18, 0]} paused={!visible}>
              <PhysicsCans {...props} />
            </Physics>
          )}
          <Environment resolution={128}>
            <Lightformer intensity={2.5} position={[0, 5, 3]} scale={[10, 2, 1]} />
            <Lightformer intensity={1.2} color="#ff9a6b" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[5, 3, 1]} />
          </Environment>
        </Canvas>
      )}
    </div>
  );
}
