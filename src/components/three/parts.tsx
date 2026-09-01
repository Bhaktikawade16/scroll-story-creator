import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Material } from "@/lib/setup-types";

export const ACCENT = "#38e1ff";
export const VIOLET = "#8b6cff";

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

/** Matte dark metal used for structural surfaces that don't respond to the material toggle. */
function metal(color = "#141821", rough = 0.42, metalness = 0.85) {
  return { color, roughness: rough, metalness } as const;
}

/**
 * Finish for a part's main chassis/shell — the one surface property every
 * part exposes to the "Material" control in the builder.
 */
function finish(material: Material | undefined, color = "#141821") {
  switch (material) {
    case "GLOSSY":
      return { color, roughness: 0.12, metalness: 0.35, envMapIntensity: 1.4 } as const;
    case "CHROME":
      return { color, roughness: 0.04, metalness: 1, envMapIntensity: 1.8 } as const;
    case "MATTE":
    default:
      return { color, roughness: 0.55, metalness: 0.5, envMapIntensity: 1 } as const;
  }
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

function Fan({
  position,
  size = 0.34,
  color = ACCENT,
  intensity = 1,
}: {
  position: [number, number, number];
  size?: number | undefined;
  color?: string | undefined;
  intensity?: number | undefined;
}) {
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
              color="#0e1119"
              emissive={color}
              emissiveIntensity={0.55 * intensity}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** TOWER = full ATX w/ glass panel. COMPACT = mini-ITX, smaller, no glass. CUBE = small-form-factor cube. */
export function PCModel({
  exploded,
  accent = ACCENT,
  variant = "TOWER",
  material,
  intensity = 1,
}: {
  exploded: boolean;
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const cube = variant === "CUBE";
  const compact = variant === "COMPACT" || cube;
  const scale = cube ? 0.62 : compact ? 0.78 : 1;
  const depth = cube ? 1.9 : 1.35; // cube gets a squarer footprint
  const shellFinish = finish(material, "#141821");
  return (
    <group position={[0, -0.15, 0]} scale={scale}>
      {/* Motherboard + CPU cooler + RAM live on the back plate */}
      <Part offset={[0, 0, 0]} exploded={exploded}>
        <mesh position={[0.34, 0, 0]}>
          <boxGeometry args={[0.05, 2.1, depth]} />
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
          <boxGeometry args={[0.06, 1.5, depth - 0.2]} />
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
            <meshStandardMaterial {...metal("#202634", 0.35, 0.9)} />
          </mesh>
          <Fan position={[-0.24, 0, 0]} size={0.22} color={accent} intensity={intensity} />
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
              color="#0f0c18"
              emissive={VIOLET}
              emissiveIntensity={0.7 * intensity}
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
          <meshStandardMaterial
            color="#0a0a0c"
            emissive={accent}
            emissiveIntensity={1.7 * intensity}
          />
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
        <Fan position={[0, 0.6, 0.62]} color={accent} intensity={intensity} />
        <Fan position={[0, -0.05, 0.62]} color={accent} intensity={intensity} />
        <Fan position={[0, -0.7, 0.62]} color={accent} intensity={intensity} />
      </Part>

      {/* Chassis shell — only the full tower keeps a glass side panel */}
      {variant === "TOWER" && (
        <Part offset={[0.05, 0.1, 1.5]} exploded={exploded} label="GLASS PANEL" labelAt={[-0.3, 0, 0]}>
          <mesh position={[-0.36, 0, 0]}>
            <boxGeometry args={[0.04, 2.1, depth]} />
            <meshPhysicalMaterial
              color={accent}
              transmission={0.92}
              thickness={0.4}
              roughness={0.06}
              metalness={0}
              transparent
              opacity={0.35}
            />
          </mesh>
        </Part>
      )}

      <Part offset={[0, 1.5, 0]} exploded={exploded} label="TOP PANEL" labelAt={[0, 0.3, 0]}>
        <mesh position={[0, 1.09, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.08, depth + 0.05]} />
          <meshStandardMaterial {...shellFinish} />
        </mesh>
      </Part>

      <Part offset={[0, -1.2, 0]} exploded={exploded}>
        <mesh position={[0, -1.09, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.08, depth + 0.05]} />
          <meshStandardMaterial {...shellFinish} />
        </mesh>
      </Part>

      {/* Frame rails always present */}
      <mesh position={[0, 0, -0.7]}>
        <boxGeometry args={[0.76, 2.1, 0.05]} />
        <meshStandardMaterial {...metal("#10141d")} />
      </mesh>

      {/* I/O shield detail on the back panel — a small cluster of ports/vents. */}
      <group position={[0.32, -0.55, -0.72]}>
        {[0, 1, 2].map((i) => (
          <mesh key={`port-${i}`} position={[0, i * 0.08, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.015]} />
            <meshStandardMaterial color="#050506" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`vent-${i}`} position={[-0.14, i * 0.05 - 0.05, 0]}>
            <boxGeometry args={[0.05, 0.012, 0.015]} />
            <meshStandardMaterial color="#050506" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** STANDARD = flat 16:9 panel. ULTRAWIDE = wider flat panel. CURVED = arced 16:9 panel. */
export function MonitorModel({
  accent = ACCENT,
  variant = "STANDARD",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const wide = variant === "ULTRAWIDE";
  const curved = variant === "CURVED";
  const shellW = wide ? 4.15 : 3.1;
  const screenW = wide ? 3.95 : 2.94;
  const glowW = wide ? 4.25 : 3.2;
  const shellFinish = finish(material, "#0d1017");
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[shellW, 1.75, 0.07]} />
        <meshStandardMaterial {...shellFinish} />
      </mesh>
      {/*
        Both screens are always mounted; only `visible` toggles. Swapping
        between two different JSX branches at the same tree position (via a
        ternary) makes React *update* one mesh into the other instead of
        creating a new one — and this project's dev-tooling instruments every
        JSX element with a data-tsd-source attribute for "click to open
        source", which React Three Fiber can't safely apply as a prop update
        (it isn't a real object property on a Three.js mesh). Always-mounted
        siblings only ever go through prop updates on booleans, never that
        attribute, so the crash can't happen.
      */}
      <mesh position={[0, 1.1, 0.045]} visible={!curved}>
        <planeGeometry args={[screenW, 1.6]} />
        <meshStandardMaterial
          color="#0a1b24"
          emissive={accent}
          emissiveIntensity={0.6 * intensity}
          roughness={0.18}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 1.1, -6.932]} visible={curved}>
        <cylinderGeometry args={[7.102, 7.102, 1.6, 48, 1, true, -0.1841, 0.3682]} />
        <meshStandardMaterial
          color="#0a1b24"
          emissive={accent}
          emissiveIntensity={0.6 * intensity}
          roughness={0.18}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 1.1, -0.06]}>
        <planeGeometry args={[glowW, 1.85]} />
        <meshBasicMaterial color={accent} transparent opacity={Math.min(0.6, 0.02 + intensity * 0.26)} />
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

/** FULL = w/ numpad. TKL = tenkeyless. COMPACT60 = 60%, no function row or arrow cluster. */
export function KeyboardModel({
  accent = ACCENT,
  variant = "FULL",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const sixty = variant === "COMPACT60";
  const cols = variant === "TKL" ? 12 : sixty ? 12 : 15;
  const rows = sixty ? 4 : 5;
  const boardWidth = cols * 0.213;
  const boardDepth = sixty ? 0.85 : 1.15;
  const startX = -((cols - 1) * 0.21) / 2;
  const rowSpacing = boardDepth / rows;
  const keys = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push([c, r]);
    return out;
  }, [cols, rows]);
  const shellFinish = finish(material, "#121722");
  return (
    <group position={[0, -0.35, 0]} rotation={[-0.12, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[boardWidth, 0.18, boardDepth]} />
        <meshStandardMaterial {...shellFinish} />
      </mesh>
      <mesh position={[0, -0.11, 0]}>
        <boxGeometry args={[boardWidth + 0.04, 0.05, boardDepth + 0.04]} />
        <meshStandardMaterial color="#0a0d12" emissive={accent} emissiveIntensity={1.5 * intensity} />
      </mesh>
      {keys.map(([c, r]) => (
        <mesh
          key={`${c}-${r}`}
          position={[startX + c * 0.21, 0.11, -boardDepth / 2 + rowSpacing / 2 + r * rowSpacing]}
        >
          <boxGeometry args={[0.17, 0.05, rowSpacing * 0.82]} />
          <meshStandardMaterial
            color="#1c2331"
            emissive={accent}
            emissiveIntensity={0.12 * intensity}
            roughness={0.6}
          />
        </mesh>
      ))}
      {/* Rubber feet — small grounding detail where the board meets the desk. */}
      {[-1, 1].map((side) =>
        [-1, 1].map((end) => (
          <mesh
            key={`${side}-${end}`}
            position={[side * (boardWidth / 2 - 0.15), -0.1, end * (boardDepth / 2 - 0.08)]}
          >
            <cylinderGeometry args={[0.035, 0.04, 0.03, 10]} />
            <meshStandardMaterial color="#050506" roughness={0.85} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** ERGO = larger sculpted shell. MINI = compact travel shell. GAMING = ergo shell + side thumb buttons. */
export function MouseModel({
  accent = ACCENT,
  variant = "ERGO",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const gaming = variant === "GAMING";
  const scale = variant === "MINI" ? 1.32 : gaming ? 1.68 : 1.6;
  const shellFinish = finish(material, "#141924");
  return (
    <group position={[0, -0.3, 0]} scale={scale}>
      <mesh position={[0, 0.22, 0]} scale={[0.62, 0.42, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.62, 48, 32]} />
        <meshStandardMaterial {...shellFinish} />
      </mesh>
      <mesh position={[0, 0.35, 0.12]}>
        <boxGeometry args={[0.07, 0.14, 0.24]} />
        <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={1.6 * intensity} />
      </mesh>
      {gaming &&
        [-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.36, 0.14, 0.05]} scale={[0.14, 0.1, 0.32]}>
            <sphereGeometry args={[0.62, 24, 18]} />
            <meshStandardMaterial {...metal("#1c2331", 0.35, 0.6)} />
          </mesh>
        ))}
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[0.9, 1.4]} />
        <meshBasicMaterial color={accent} transparent opacity={Math.min(0.6, 0.03 + intensity * 0.26)} />
      </mesh>
    </group>
  );
}

/** HIGHBACK = tall relaxed backrest. RACER = narrower bucket-style. MESH = open slatted backrest. */
export function ChairModel({
  accent = ACCENT,
  variant = "HIGHBACK",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const racer = variant === "RACER";
  const mesh = variant === "MESH";
  const backW = racer ? 0.98 : 1.15;
  const backH = racer ? 1.95 : 1.7;
  const backY = racer ? 1.88 : 1.75;
  const stripeY = racer ? 2.78 : 2.72;
  const shellFinish = finish(material, "#141822");
  // Cushions/upholstery never read as mirror-shiny even on the GLOSSY/CHROME
  // finish settings — floor the roughness so fabric still looks like fabric.
  const cushionFinish = {
    ...shellFinish,
    roughness: Math.max(shellFinish.roughness, mesh ? 0.88 : racer ? 0.5 : 0.78),
  };
  return (
    <group position={[0, -1.1, 0]}>
      {mesh ? (
        <group position={[0, backY, -0.35]} rotation={[0.14, 0, 0]}>
          {/* Frame outline */}
          {[-backW / 2, backW / 2].map((x) => (
            <mesh key={x} position={[x, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.06, backH, 0.1]} />
              <meshStandardMaterial {...shellFinish} />
            </mesh>
          ))}
          {[-1, -0.4, 0.2, 0.8].map((t, i) => (
            <mesh key={i} position={[0, t * (backH / 2.4), 0]}>
              <boxGeometry args={[backW, 0.045, 0.06]} />
              <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={0.9 * intensity} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ) : (
        <mesh position={[0, backY, -0.35]} rotation={[0.14, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[backW, backH, 0.16]} />
          <meshStandardMaterial {...cushionFinish} />
        </mesh>
      )}
      <mesh position={[0, stripeY, -0.5]} rotation={[0.14, 0, 0]}>
        <boxGeometry args={[0.7, 0.34, 0.18]} />
        <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={0.6 * intensity} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.92, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.18, 1.05]} />
        <meshStandardMaterial {...cushionFinish} />
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

/** PULSE = breathing glow. STATIC = constant glow. RAINBOW = cycling hue, always animated. */
export function LightingModel({
  accent = ACCENT,
  variant = "PULSE",
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const ref = useRef<THREE.Group>(null);
  const pulse = variant === "PULSE";
  const rainbow = variant === "RAINBOW";
  const hueColor = useMemo(() => new THREE.Color(), []);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (!m) return;
      if (rainbow) {
        hueColor.setHSL(((state.clock.elapsedTime * 0.15 + i * 0.12) % 1), 0.9, 0.55);
        m.color.copy(hueColor);
        m.emissive.copy(hueColor);
        m.emissiveIntensity = (1.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3) * intensity;
      } else if (pulse) {
        // Breathes from nearly dark to well ABOVE static's level, at a snappy
        // rate — the peak/trough gap is wide enough that tone-mapping can't
        // flatten it into looking like a steady glow.
        m.emissiveIntensity = Math.max(0.03, 1.5 + Math.sin(state.clock.elapsedTime * 2.4 + i * 0.4) * 1.5) * intensity;
      } else {
        // STATIC sits at a fixed mid-level, clearly below pulse's peak and
        // clearly above its trough, so the two read as obviously different
        // behaviors rather than both settling near the same brightness.
        m.emissiveIntensity = 0.9 * intensity;
      }
    });
  });
  // A slim monitor light bar — like a real BenQ/Xiaomi screen bar — rather than
  // full-height towers. Reads as a desk accessory instead of dominating the scene.
  return (
    <group position={[0, 0.05, 0]}>
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[2.4, 0.09, 0.09]} />
        <meshStandardMaterial color="#12151c" roughness={0.4} metalness={0.6} />
      </mesh>
      <group ref={ref}>
        {[-0.72, 0, 0.72].map((x, i) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.68, 0.045, 0.03]} />
            <meshStandardMaterial color="#0a0d12" emissive={accent} emissiveIntensity={0.9 * intensity} />
          </mesh>
        ))}
      </group>
      {/* Small mounting arms suggesting it clips onto a monitor's top edge. */}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, -0.16, 0.06]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.26, 0.04]} />
          <meshStandardMaterial color="#0c0e13" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* Soft downward glow the bar would actually cast onto the desk/monitor —
          no artificial cap, so the full slider range is visible end-to-end. */}
      <mesh position={[0, -0.4, 0.15]} rotation={[-0.9, 0, 0]}>
        <planeGeometry args={[2.6, 0.9]} />
        <meshBasicMaterial color={accent} transparent opacity={Math.min(0.65, 0.03 + intensity * 0.27)} />
      </mesh>
    </group>
  );
}

/** CLIP = small basic webcam. RING = webcam with a circular ring light. STREAM = larger pro streaming cam. */
export function WebcamModel({
  accent = ACCENT,
  variant = "CLIP",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const ring = variant === "RING";
  const stream = variant === "STREAM";
  const bodyScale = stream ? 1.35 : 1;
  const shellFinish = finish(material, "#14161c");
  return (
    <group position={[0, -0.1, 0]} scale={bodyScale}>
      {/* Clip */}
      <mesh position={[0, -0.28, -0.05]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.18, 0.3, 0.08]} />
        <meshStandardMaterial {...metal("#101216", 0.4)} />
      </mesh>
      {/* Camera body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.16, 0.34, 8, 16]} />
        <meshStandardMaterial {...shellFinish} />
      </mesh>
      {/* Lens */}
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
        <meshStandardMaterial color="#050608" roughness={0.15} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
        <meshStandardMaterial color="#0a2530" roughness={0.05} metalness={0.9} />
      </mesh>
      {/* Status LED — grows and brightens with intensity so it's not just a
          fixed-size dot that merely changes color temperature. */}
      <mesh position={[0.12, 0.13, 0.14]} scale={0.7 + Math.min(intensity, 2.2) * 0.5}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4 * intensity} />
      </mesh>
      {/* Soft halo around the lens — the main always-visible glow surface, so
          every variant (not just Ring) shows an obvious intensity change. */}
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={Math.min(0.6, 0.02 + intensity * 0.26)} />
      </mesh>
      {ring && (
        <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.025, 12, 40]} />
          <meshStandardMaterial color="#0a0d12" emissive={accent} emissiveIntensity={1.8 * intensity} />
        </mesh>
      )}
      {stream && (
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.16]} />
          <meshStandardMaterial {...metal("#0c0e12", 0.35)} />
        </mesh>
      )}
    </group>
  );
}

/** DESKTOP = small bookshelf pair. SOUNDBAR = single wide bar. STUDIO = larger studio monitors. */
export function SpeakersModel({
  accent = ACCENT,
  variant = "DESKTOP",
  material,
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const soundbar = variant === "SOUNDBAR";
  const studio = variant === "STUDIO";
  const shellFinish = finish(material, "#121419");
  const h = studio ? 0.95 : 0.62;
  const w = studio ? 0.42 : 0.3;
  const woofer = studio ? 0.14 : 0.09;

  // Both shapes are always mounted; only `visible` toggles. Returning two
  // completely different JSX trees from the same conditional branch makes
  // React *update* one shape into the other instead of creating a new one —
  // and this project's dev-tooling instruments every JSX element with a
  // tracking attribute that React Three Fiber can't safely apply as a prop
  // update. Always-mounted siblings only ever go through normal prop
  // updates, so the crash can't happen. (Same fix as the curved monitor bug.)
  return (
    <group>
      <group visible={soundbar} position={[0, -0.65, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.22, 0.28]} />
          <meshStandardMaterial {...shellFinish} />
        </mesh>
        <mesh position={[0, -0.02, 0.145]}>
          <planeGeometry args={[2.0, 0.1]} />
          <meshStandardMaterial color="#0a0d12" emissive={accent} emissiveIntensity={1.6 * intensity} roughness={0.5} />
        </mesh>
        {[-0.85, 0, 0.85].map((x) => (
          <mesh key={x} position={[x, 0, 0.141]}>
            <circleGeometry args={[0.07, 20]} />
            <meshStandardMaterial color="#050608" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, -0.3, 0.2]} rotation={[-0.6, 0, 0]}>
          <planeGeometry args={[2.4, 0.7]} />
          <meshBasicMaterial color={accent} transparent opacity={Math.min(0.65, 0.03 + intensity * 0.27)} />
        </mesh>
      </group>

      <group visible={!soundbar}>
        {[-1.05, 1.05].map((x) => (
          <group key={x} position={[x, -0.4 + h / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, h, w * 0.9]} />
              <meshStandardMaterial {...shellFinish} />
            </mesh>
            <mesh position={[0, h * 0.22, w * 0.46]}>
              <circleGeometry args={[woofer, 24]} />
              <meshStandardMaterial color="#0a0c10" roughness={0.7} />
            </mesh>
            <mesh position={[0, -h * 0.28, w * 0.46]}>
              <circleGeometry args={[woofer * 0.55, 20]} />
              <meshStandardMaterial color="#0a0c10" emissive={accent} emissiveIntensity={1.7 * intensity} roughness={0.4} />
            </mesh>
            <mesh position={[0, -h / 2 - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[w * 0.9, 20]} />
              <meshBasicMaterial color={accent} transparent opacity={Math.min(0.65, 0.04 + intensity * 0.27)} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** STANDARD = compact pad. XL = full-desk extended pad. RGB_EDGE = extended pad w/ glowing rim. */
export function MousepadModel({
  accent = ACCENT,
  variant = "STANDARD",
  intensity = 1,
}: {
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const xl = variant === "XL" || variant === "RGB_EDGE";
  const rgb = variant === "RGB_EDGE";
  const w = xl ? 4.4 : 1.6;
  const d = xl ? 1.7 : 1.5;
  return (
    <group position={[0, -0.75, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[w, 0.035, d]} />
        <meshStandardMaterial color="#0d0e12" roughness={0.92} metalness={0} />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[w - 0.06, 0.01, d - 0.06]} />
        <meshStandardMaterial color="#16181e" roughness={0.85} metalness={0} />
      </mesh>
      {/* Base underglow — present on EVERY style, not just RGB Edge, so the
          intensity slider always has something visible to act on regardless
          of which variant is selected. RGB Edge adds its own brighter rim on top. */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.5, d + 0.5]} />
        <meshBasicMaterial color={accent} transparent opacity={Math.min(0.55, 0.02 + intensity * 0.22)} />
      </mesh>
      {rgb && (
        <group>
          <mesh position={[0, -0.012, d / 2 - 0.01]}>
            <boxGeometry args={[w - 0.04, 0.012, 0.02]} />
            <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={1.6 * intensity} />
          </mesh>
          <mesh position={[0, -0.012, -(d / 2 - 0.01)]}>
            <boxGeometry args={[w - 0.04, 0.012, 0.02]} />
            <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={1.6 * intensity} />
          </mesh>
          <mesh position={[w / 2 - 0.01, -0.012, 0]}>
            <boxGeometry args={[0.02, 0.012, d - 0.04]} />
            <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={1.6 * intensity} />
          </mesh>
          <mesh position={[-(w / 2 - 0.01), -0.012, 0]}>
            <boxGeometry args={[0.02, 0.012, d - 0.04]} />
            <meshStandardMaterial color="#0a0a0c" emissive={accent} emissiveIntensity={1.6 * intensity} />
          </mesh>
        </group>
      )}
    </group>
  );
}
