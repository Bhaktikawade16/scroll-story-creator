import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const ACCENT = "#38e1ff";
export const VIOLET = "#8b6cff";

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

/** Matte dark metal used for all chassis surfaces. */
function metal(color = "#141821", rough = 0.42, metalness = 0.85) {
  return { color, roughness: rough, metalness } as const;
}

function Label({
  text,
  position,
  show,
}: {
  text: string;
  position: [number, number, number];
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Html position={position} center distanceFactor={7} zIndexRange={[10, 0]}>
      <span className="whitespace-nowrap rounded-full border border-[color:var(--color-accent)]/40 bg-background/70 px-2.5 py-1 text-[8px] tracking-[0.28em] text-foreground/90 backdrop-blur-md">
        {text}
      </span>
    </Html>
  );
}

/** Animated group that eases toward an offset when exploded. */
function Part({
  offset,
  exploded,
  children,
  label,
  labelAt,
}: {
  offset: [number, number, number];
  exploded: boolean;
  children: React.ReactNode;
  label?: string;
  labelAt?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.position.x = damp(g.position.x, exploded ? offset[0] : 0, 4, dt);
    g.position.y = damp(g.position.y, exploded ? offset[1] : 0, 4, dt);
    g.position.z = damp(g.position.z, exploded ? offset[2] : 0, 4, dt);
  });
  return (
    <group ref={ref}>
      {children}
      {label && labelAt ? (
        <Label text={label} position={labelAt} show={exploded} />
      ) : null}
    </group>
  );
}

function Fan({ position, size = 0.34 }: { position: [number, number, number]; size?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 3;
  });
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <torusGeometry args={[size, 0.035, 12, 32]} />
        <meshStandardMaterial {...metal("#1b2230", 0.5)} />
      </mesh>
      <group ref={ref}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI * 2]} position={[0, 0, 0]}>
            <boxGeometry args={[size * 0.9, 0.06, 0.02]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.35}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Exploded-view gaming tower. */
export function PCModel({ exploded }: { exploded: boolean }) {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Motherboard + CPU cooler + RAM live on the back plate */}
      <Part offset={[0, 0, 0]} exploded={exploded}>
        <mesh position={[0.34, 0, 0]}>
          <boxGeometry args={[0.05, 2.1, 1.35]} />
          <meshStandardMaterial {...metal("#0e131c", 0.6, 0.6)} />
        </mesh>
      </Part>

      <Part
        offset={[-0.55, 0.15, 0]}
        exploded={exploded}
        label="MOTHERBOARD"
        labelAt={[-0.2, 1.05, 0]}
      >
        <mesh position={[0.22, 0.1, 0]}>
          <boxGeometry args={[0.06, 1.5, 1.15]} />
          <meshStandardMaterial color="#101a1c" roughness={0.55} metalness={0.4} />
        </mesh>
      </Part>

      <Part
        offset={[-1.15, 0.5, 0]}
        exploded={exploded}
        label="CPU COOLER"
        labelAt={[0, 0.85, 0]}
      >
        <group position={[0.05, 0.42, 0.1]}>
          <mesh>
            <boxGeometry args={[0.42, 0.5, 0.5]} />
            <meshStandardMaterial {...metal("#20design".slice(0, 7) || "#202634", 0.35, 0.9)} />
          </mesh>
          <Fan position={[-0.24, 0, 0]} size={0.22} />
        </group>
      </Part>

      <Part
        offset={[-1.0, -0.15, 0.75]}
        exploded={exploded}
        label="RAM"
        labelAt={[0.1, 0.45, 0]}
      >
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.1, 0.55, -0.34 + i * 0.14]}>
            <boxGeometry args={[0.05, 0.42, 0.06]} />
            <meshStandardMaterial
              color={VIOLET}
              emissive={VIOLET}
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
        ))}
      </Part>

      <Part
        offset={[-0.85, -0.75, -0.35]}
        exploded={exploded}
        label="GPU"
        labelAt={[0, 0.35, 0]}
      >
        <mesh position={[0.05, -0.2, 0.05]}>
          <boxGeometry args={[0.42, 0.22, 1.1]} />
          <meshStandardMaterial {...metal("#171d29", 0.4)} />
        </mesh>
        <mesh position={[-0.12, -0.09, 0.05]}>
          <boxGeometry args={[0.02, 0.02, 0.8]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.4} />
        </mesh>
      </Part>

      <Part
        offset={[0, -0.85, -0.9]}
        exploded={exploded}
        label="POWER SUPPLY"
        labelAt={[0, -0.3, 0]}
      >
        <mesh position={[0.05, -0.85, -0.1]}>
          <boxGeometry args={[0.6, 0.4, 0.9]} />
          <meshStandardMaterial {...metal("#12161f", 0.55)} />
        </mesh>
      </Part>

      <Part
        offset={[0.15, 1.0, 0.55]}
        exploded={exploded}
        label="FANS"
        labelAt={[0, 0.55, 0]}
      >
        <Fan position={[0, 0.6, 0.62]} />
        <Fan position={[0, -0.05, 0.62]} />
        <Fan position={[0, -0.7, 0.62]} />
      </Part>

      {/* Chassis shell */}
      <Part offset={[0.05, 0.1, 1.5]} exploded={exploded} label="GLASS PANEL" labelAt={[-0.3, 0, 0]}>
        <mesh position={[-0.36, 0, 0]}>
          <boxGeometry args={[0.04, 2.1, 1.35]} />
          <meshPhysicalMaterial
            color="#7fd8ea"
            transmission={0.92}
            thickness={0.4}
            roughness={0.06}
            metalness={0}
            transparent
            opacity={0.35}
          />
        </mesh>
      </Part>

      <Part offset={[0, 1.5, 0]} exploded={exploded} label="TOP PANEL" labelAt={[0, 0.3, 0]}>
        <mesh position={[0, 1.09, 0]}>
          <boxGeometry args={[0.78, 0.08, 1.4]} />
          <meshStandardMaterial {...metal()} />
        </mesh>
      </Part>

      <Part offset={[0, -1.2, 0]} exploded={exploded}>
        <mesh position={[0, -1.09, 0]}>
          <boxGeometry args={[0.78, 0.08, 1.4]} />
          <meshStandardMaterial {...metal()} />
        </mesh>
      </Part>

      {/* Frame rails always present */}
      <mesh position={[0, 0, -0.7]}>
        <boxGeometry args={[0.76, 2.1, 0.05]} />
        <meshStandardMaterial {...metal("#10141d")} />
      </mesh>
    </group>
  );
}

export function MonitorModel() {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[3.1, 1.75, 0.07]} />
        <meshStandardMaterial {...metal("#0d1017", 0.35)} />
      </mesh>
      <mesh position={[0, 1.1, 0.045]}>
        <planeGeometry args={[2.94, 1.6]} />
        <meshStandardMaterial
          color="#0a1b24"
          emissive={ACCENT}
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 1.1, -0.06]}>
        <planeGeometry args={[3.2, 1.85]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.14, 0.95, 0.14]} />
        <meshStandardMaterial {...metal("#161b26", 0.3)} />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.06, 48]} />
        <meshStandardMaterial {...metal("#181e2b", 0.25)} />
      </mesh>
    </group>
  );
}

export function KeyboardModel() {
  const keys = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 15; c++) out.push([c, r]);
    return out;
  }, []);
  return (
    <group position={[0, -0.35, 0]} rotation={[-0.12, 0, 0]}>
      <mesh>
        <boxGeometry args={[3.2, 0.18, 1.15]} />
        <meshStandardMaterial {...metal("#121722", 0.4)} />
      </mesh>
      <mesh position={[0, -0.11, 0]}>
        <boxGeometry args={[3.24, 0.05, 1.19]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.1} />
      </mesh>
      {keys.map(([c, r]) => (
        <mesh key={`${c}-${r}`} position={[-1.47 + c * 0.21, 0.11, -0.42 + r * 0.21]}>
          <boxGeometry args={[0.17, 0.05, 0.17]} />
          <meshStandardMaterial
            color="#1c2331"
            emissive={ACCENT}
            emissiveIntensity={0.12}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export function MouseModel() {
  return (
    <group position={[0, -0.3, 0]} scale={1.6}>
      <mesh position={[0, 0.22, 0]} scale={[0.62, 0.42, 1]}>
        <sphereGeometry args={[0.62, 48, 32]} />
        <meshStandardMaterial {...metal("#141924", 0.32)} />
      </mesh>
      <mesh position={[0, 0.35, 0.12]}>
        <boxGeometry args={[0.07, 0.14, 0.24]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[0.9, 1.4]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export function ChairModel() {
  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, 1.75, -0.35]} rotation={[0.14, 0, 0]}>
        <boxGeometry args={[1.15, 1.7, 0.16]} />
        <meshStandardMaterial {...metal("#141822", 0.65, 0.3)} />
      </mesh>
      <mesh position={[0, 2.72, -0.5]} rotation={[0.14, 0, 0]}>
        <boxGeometry args={[0.7, 0.34, 0.18]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.92, 0.12]}>
        <boxGeometry args={[1.2, 0.18, 1.05]} />
        <meshStandardMaterial {...metal("#141822", 0.65, 0.3)} />
      </mesh>
      <mesh position={[0, 0.45, 0.1]}>
        <cylinderGeometry args={[0.09, 0.09, 0.8, 24]} />
        <meshStandardMaterial {...metal("#1d2432", 0.3)} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.5, 0.1, 0.1 + Math.sin(a) * 0.5]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[1.0, 0.07, 0.1]} />
            <meshStandardMaterial {...metal("#1d2432", 0.35)} />
          </mesh>
        );
      })}
    </group>
  );
}

export function LightingModel() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.children.forEach((c, i) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m?.emissiveIntensity !== undefined)
          m.emissiveIntensity =
            1 + Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.55;
      });
  });
  return (
    <group position={[0, -0.4, 0]}>
      <group ref={ref}>
        {[-1.1, 0, 1.1].map((x, i) => (
          <mesh key={x} position={[x, 0.9 + i * 0.05, -0.6]}>
            <boxGeometry args={[0.12, 2.2, 0.12]} />
            <meshStandardMaterial
              color={i === 1 ? VIOLET : ACCENT}
              emissive={i === 1 ? VIOLET : ACCENT}
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.9, -0.75]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 64]} />
        <meshStandardMaterial color="#0b0f16" roughness={0.12} metalness={0.9} />
      </mesh>
    </group>
  );
}
