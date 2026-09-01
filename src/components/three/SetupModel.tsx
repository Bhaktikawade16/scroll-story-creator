import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Category, PartConfig } from "@/lib/setup-types";
import {
  ChairModel,
  KeyboardModel,
  LightingModel,
  MonitorModel,
  MouseModel,
  MousepadModel,
  PCModel,
  SpeakersModel,
  WebcamModel,
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

  return (
    <group ref={g} castShadow>
      {children}
    </group>
  );
}

/** A drooping cable between two points — TubeGeometry along a sagging bezier curve. */
function Cable({
  from,
  to,
  sag = 0.4,
  color = "#0a0a0c",
}: {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
  color?: string;
}) {
  const geometry = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().lerp(end, 0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 20, 0.032, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2], sag]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.15} />
    </mesh>
  );
}

/** Dark walnut desk with subtle grain, a cable grommet, and a fabric desk mat —
 *  small details that read as "a real desk" rather than a flat slab. */
function Desk() {
  const grainY = -0.565; // just above the slab's top face
  return (
    <group>
      <mesh position={[0, -0.65, 0.4]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.16, 3.4]} />
        <meshStandardMaterial color="#18120d" roughness={0.55} metalness={0.04} />
      </mesh>
      {/* Subtle grain streaks — thin, barely-lighter strips for a hint of wood texture. */}
      {[-1.1, -0.15, 0.95].map((z, i) => (
        <mesh key={i} position={[0, grainY, z]}>
          <boxGeometry args={[8.2, 0.006, 0.05]} />
          <meshStandardMaterial color="#2a1f16" roughness={0.5} metalness={0.02} />
        </mesh>
      ))}
      {/* Front edge highlight so the slab reads as having a rounded-over lip. */}
      <mesh position={[0, -0.575, 1.98]}>
        <boxGeometry args={[8.4, 0.03, 0.06]} />
        <meshStandardMaterial color="#332619" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Cable grommet near the back where wires disappear off the desk. */}
      <mesh position={[2.2, -0.565, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.09, 20]} />
        <meshStandardMaterial color="#050506" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-3.9, 3.9].map((x) => (
        <group key={x}>
          <mesh position={[x, -1.6, 0.4]} castShadow>
            <boxGeometry args={[0.16, 1.8, 2.8]} />
            <meshStandardMaterial color="#0b0e15" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Foot pads */}
          <mesh position={[x, -2.5, 0.4]}>
            <cylinderGeometry args={[0.14, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#050506" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function SetupModel({ active }: { active: PartConfig[] }) {
  const configFor = (cat: Category) => active.find((a) => a.category === cat);
  const has = (cat: Category) => !!configFor(cat);

  return (
    <group position={[0, -0.35, 0]} scale={0.62}>
      <Desk />

      {/* Cable management — only drawn between pieces that are actually on the desk. */}
      {has("PC") && has("MONITOR") && (
        <Cable from={[2.6, 0.05, 0.35]} to={[-0.45, -0.15, -0.35]} sag={0.55} />
      )}
      {has("PC") && has("KEYBOARD") && (
        <Cable from={[2.55, -0.15, 0.55]} to={[-0.9, -0.78, 1.15]} sag={0.32} />
      )}
      {has("PC") && has("MOUSE") && (
        <Cable from={[2.55, -0.2, 0.6]} to={[1.6, -0.86, 1.05]} sag={0.22} />
      )}
      {has("PC") && has("LIGHTING") && (
        <Cable from={[2.55, 0.35, 0.15]} to={[0.85, 2.28, -0.3]} sag={-0.15} />
      )}
      {has("PC") && has("WEBCAM") && (
        <Cable from={[2.55, 0.4, 0.2]} to={[0.15, 1.95, -0.28]} sag={-0.1} />
      )}
      {has("PC") && has("SPEAKERS") && (
        <Cable from={[2.5, -0.3, 0.2]} to={[-1.0, -0.55, -0.95]} sag={0.3} />
      )}

      <Piece active={has("LIGHTING")} position={[0, 2.32, -0.42]} delay={0}>
        <LightingModel
          accent={configFor("LIGHTING")?.color}
          variant={configFor("LIGHTING")?.variant}
          intensity={configFor("LIGHTING")?.intensity}
        />
      </Piece>
      <Piece active={has("WEBCAM")} position={[0, 2.0, -0.3]} scale={0.55} delay={0.05}>
        <WebcamModel
          accent={configFor("WEBCAM")?.color}
          variant={configFor("WEBCAM")?.variant}
          material={configFor("WEBCAM")?.material}
          intensity={configFor("WEBCAM")?.intensity}
        />
      </Piece>
      <Piece active={has("MONITOR")} position={[0, 0.5, -0.6]} delay={0.1}>
        <MonitorModel
          accent={configFor("MONITOR")?.color}
          variant={configFor("MONITOR")?.variant}
          material={configFor("MONITOR")?.material}
          intensity={configFor("MONITOR")?.intensity}
        />
      </Piece>
      <Piece active={has("PC")} position={[3.1, 0.85, -0.3]} scale={0.9} delay={0.2}>
        <PCModel
          exploded={false}
          accent={configFor("PC")?.color}
          variant={configFor("PC")?.variant}
          material={configFor("PC")?.material}
          intensity={configFor("PC")?.intensity}
        />
      </Piece>
      <Piece active={has("KEYBOARD")} position={[-0.3, -0.42, 1.0]} scale={0.85} delay={0.3}>
        <KeyboardModel
          accent={configFor("KEYBOARD")?.color}
          variant={configFor("KEYBOARD")?.variant}
          material={configFor("KEYBOARD")?.material}
          intensity={configFor("KEYBOARD")?.intensity}
        />
      </Piece>
      <Piece active={has("MOUSE")} position={[1.9, -0.5, 1.05]} scale={0.45} delay={0.4}>
        <MouseModel
          accent={configFor("MOUSE")?.color}
          variant={configFor("MOUSE")?.variant}
          material={configFor("MOUSE")?.material}
          intensity={configFor("MOUSE")?.intensity}
        />
      </Piece>
      <Piece active={has("MOUSEPAD")} position={[0.75, 0.18, 1.0]} delay={0.15}>
        <MousepadModel
          accent={configFor("MOUSEPAD")?.color}
          variant={configFor("MOUSEPAD")?.variant}
          intensity={configFor("MOUSEPAD")?.intensity}
        />
      </Piece>
      <Piece active={has("SPEAKERS")} position={[0, -0.17, -1.0]} delay={0.25}>
        <SpeakersModel
          accent={configFor("SPEAKERS")?.color}
          variant={configFor("SPEAKERS")?.variant}
          material={configFor("SPEAKERS")?.material}
          intensity={configFor("SPEAKERS")?.intensity}
        />
      </Piece>
      <Piece active={has("CHAIR")} position={[-0.2, -1.7, 3.1]} scale={0.95} rotation={[0, Math.PI, 0]} delay={0.5}>
        <ChairModel
          accent={configFor("CHAIR")?.color}
          variant={configFor("CHAIR")?.variant}
          material={configFor("CHAIR")?.material}
          intensity={configFor("CHAIR")?.intensity}
        />
      </Piece>
    </group>
  );
}
