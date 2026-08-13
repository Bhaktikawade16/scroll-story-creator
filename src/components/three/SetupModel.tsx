import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  ChairModel,
  KeyboardModel,
  LightingModel,
  MonitorModel,
  MouseModel,
  PCModel,
} from "./parts";

/** Eases a piece into place when it becomes part of the setup. */
function Piece({
  active,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  delay = 0,
  children,
}: {
  active: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  delay?: number;
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);
  const wait = useRef(delay);

  useFrame((_, dt) => {
    if (active && wait.current > 0) {
      wait.current -= dt;
      return;
    }
    if (!active) wait.current = delay;
    t.current = THREE.MathUtils.damp(t.current, active ? 1 : 0, 4, dt);
    const el = g.current;
    if (!el) return;
    el.scale.setScalar(Math.max(0.0001, t.current * scale));
    el.position.set(
      position[0],
      position[1] + (1 - t.current) * 1.4,
      position[2],
    );
    el.rotation.set(rotation[0], rotation[1] + (1 - t.current) * 0.6, rotation[2]);
    el.visible = t.current > 0.01;
  });

  return <group ref={g}>{children}</group>;
}

export function SetupModel({ active }: { active: string[] }) {
  const has = (k: string) => active.includes(k);
  return (
    <group position={[0, -0.35, 0]} scale={0.62}>
      {/* Desk */}
      <mesh position={[0, -0.65, 0.4]} receiveShadow>
        <boxGeometry args={[8.4, 0.16, 3.4]} />
        <meshStandardMaterial color="#0d1119" roughness={0.35} metalness={0.7} />
      </mesh>
      {[-3.9, 3.9].map((x) => (
        <mesh key={x} position={[x, -1.6, 0.4]}>
          <boxGeometry args={[0.16, 1.8, 2.8]} />
          <meshStandardMaterial color="#0b0e15" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      <Piece active={has("LIGHTING")} position={[0, 0.4, -1.6]} delay={0}>
        <LightingModel />
      </Piece>
      <Piece active={has("MONITOR")} position={[0, 0.5, -0.6]} delay={0.1}>
        <MonitorModel />
      </Piece>
      <Piece active={has("PC")} position={[3.1, 0.85, -0.3]} scale={0.9} delay={0.2}>
        <PCModel exploded={false} />
      </Piece>
      <Piece active={has("KEYBOARD")} position={[-0.3, -0.42, 1.0]} scale={0.85} delay={0.3}>
        <KeyboardModel />
      </Piece>
      <Piece active={has("MOUSE")} position={[1.9, -0.5, 1.05]} scale={0.45} delay={0.4}>
        <MouseModel />
      </Piece>
      <Piece active={has("CHAIR")} position={[-0.2, -1.7, 3.1]} scale={0.95} rotation={[0, Math.PI, 0]} delay={0.5}>
        <ChairModel />
      </Piece>
    </group>
  );
}
