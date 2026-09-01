import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  PerspectiveCamera,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Category, Material, PartConfig } from "@/lib/setup-types";
import { SetupModel } from "./SetupModel";
import {
  ACCENT,
  ChairModel,
  KeyboardModel,
  LightingModel,
  MonitorModel,
  MouseModel,
  MousepadModel,
  PCModel,
  SpeakersModel,
  VIOLET,
  WebcamModel,
} from "./parts";

export type { Category };

function ModelFor({
  category,
  exploded,
  accent,
  variant,
  material,
  intensity,
}: {
  category: Category;
  exploded: boolean;
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  switch (category) {
    case "MONITOR":
      return <MonitorModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "KEYBOARD":
      return <KeyboardModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "MOUSE":
      return <MouseModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "CHAIR":
      return <ChairModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "LIGHTING":
      return <LightingModel accent={accent} variant={variant} intensity={intensity} />;
    case "WEBCAM":
      return <WebcamModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "SPEAKERS":
      return <SpeakersModel accent={accent} variant={variant} material={material} intensity={intensity} />;
    case "MOUSEPAD":
      return <MousepadModel accent={accent} variant={variant} intensity={intensity} />;
    default:
      return <PCModel exploded={exploded} accent={accent} variant={variant} material={material} intensity={intensity} />;
  }
}

/** Cross-fades between categories with a scale/blur-in feel. */
function Morph({
  category,
  exploded,
  accent,
  variant,
  material,
  intensity,
}: {
  category: Category;
  exploded: boolean;
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const [shown, setShown] = useState(category);
  const pending = useRef(category);
  const t = useRef(1);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    pending.current = category;
  }, [category]);

  useFrame((_, dt) => {
    const out = pending.current !== shown;
    t.current = THREE.MathUtils.damp(t.current, out ? 0 : 1, out ? 9 : 5, dt);
    if (out && t.current < 0.06) {
      setShown(pending.current);
      t.current = 0.06;
    }
    const g = group.current;
    if (g) {
      const s = 0.82 + t.current * 0.18;
      g.scale.setScalar(s);
      g.position.y = (1 - t.current) * -0.45;
      g.rotation.y = (1 - t.current) * 0.5;
    }
  });

  return (
    <group ref={group}>
      <ModelFor
        category={shown}
        exploded={exploded && shown === "PC"}
        accent={accent}
        variant={variant}
        material={material}
        intensity={intensity}
      />
    </group>
  );
}

/** Drag-to-rotate + pointer parallax rig. */
function Rig({
  children,
  dragRef,
  autoSpin,
}: {
  children: React.ReactNode;
  dragRef: React.MutableRefObject<number>;
  autoSpin: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const spin = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (autoSpin) spin.current += dt * 0.12;
    const targetY = dragRef.current + spin.current + pointer.x * 0.22;
    const targetX = -pointer.y * 0.16;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4.5, dt);
  });

  return <group ref={group}>{children}</group>;
}

/** Key light that drifts with the pointer for a premium reactive sheen. */
function ReactiveLights() {
  const key = useRef<THREE.PointLight>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    const l = key.current;
    if (!l) return;
    l.position.x = THREE.MathUtils.damp(l.position.x, pointer.x * 5, 3, dt);
    l.position.y = THREE.MathUtils.damp(l.position.y, 2 + pointer.y * 2.5, 3, dt);
  });
  return (
    <>
      <ambientLight intensity={1.1} />
      <pointLight ref={key} position={[3, 3, 4]} intensity={90} color={ACCENT} distance={26} />
      <pointLight position={[-4, 1.4, -3]} intensity={60} color={VIOLET} distance={24} />
      <spotLight
        position={[0, 7, 2]}
        angle={0.6}
        penumbra={1}
        intensity={90}
        color="#ffffff"
      />
    </>
  );
}

/** A grounded room backdrop: a soft-lit back wall, so the setup reads as sitting
 *  in a real space rather than floating in a void. The existing infinite Grid
 *  already serves as the floor, so we don't duplicate it here. */
function Room() {
  return (
    <group>
      <mesh position={[0, 3.2, -6.5]}>
        <planeGeometry args={[26, 12]} />
        <meshStandardMaterial color="#0c1017" roughness={0.95} metalness={0} />
      </mesh>
      {/* Soft vertical bounce-light strips on the wall, like daylight through a gap in blinds. */}
      <mesh position={[-4.2, 3.4, -6.45]}>
        <planeGeometry args={[1.1, 9]} />
        <meshBasicMaterial color="#1a2836" transparent opacity={0.5} />
      </mesh>
      <mesh position={[3.6, 3.4, -6.45]}>
        <planeGeometry args={[0.7, 9]} />
        <meshBasicMaterial color="#1c1424" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const geo = useRef<THREE.BufferGeometry>(null);
  useEffect(() => {
    const n = 220;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 7 - 1.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geo.current?.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }, []);
  useFrame((state) => {
    if (ref.current)
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry ref={geo} />
      <pointsMaterial
        size={0.035}
        color={ACCENT}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Stage({
  category = "PC",
  exploded = false,
  onToggleExplode,
  autoSpin = true,
  className = "",
  setup,
  accent,
  variant,
  material,
  intensity,
}: {
  category?: Category | undefined;
  exploded?: boolean | undefined;
  onToggleExplode?: (() => void) | undefined;
  autoSpin?: boolean | undefined;
  className?: string | undefined;
  /** When provided, renders the full desk setup with these pieces assembled. */
  setup?: PartConfig[] | undefined;
  /** Accent color + style variant for single-part inspection mode (ignored when `setup` is provided). */
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
}) {
  const dragRef = useRef(0);
  const state = useRef({ down: false, x: 0, moved: 0 });

  return (
    <div
      className={`relative h-full w-full cursor-grab touch-pan-y active:cursor-grabbing ${className}`}
      onPointerDown={(e) => {
        state.current = { down: true, x: e.clientX, moved: 0 };
      }}
      onPointerMove={(e) => {
        if (!state.current.down) return;
        const dx = e.clientX - state.current.x;
        state.current.x = e.clientX;
        state.current.moved += Math.abs(dx);
        dragRef.current += dx * 0.006;
      }}
      onPointerUp={() => {
        if (state.current.down && state.current.moved < 6) onToggleExplode?.();
        state.current.down = false;
      }}
      onPointerLeave={() => {
        state.current.down = false;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerspectiveCamera makeDefault fov={34} position={[0, 0.6, 6.2]} />
        <ReactiveLights />
        <Environment preset="city" environmentIntensity={0.55} />
        <Room />
        <Rig dragRef={dragRef} autoSpin={autoSpin && !exploded}>
          {setup ? (
            <SetupModel active={setup} />
          ) : (
            <Morph
              category={category}
              exploded={exploded}
              accent={accent}
              variant={variant}
              material={material}
              intensity={intensity}
            />
          )}
        </Rig>
        <Grid
          position={[0, -1.55, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.35}
          cellColor="#0f2530"
          sectionSize={3}
          sectionThickness={0.5}
          sectionColor="#164457"
          fadeDistance={16}
          fadeStrength={2.2}
          infiniteGrid
        />
        <ContactShadows
          position={[0, -1.52, 0]}
          opacity={0.7}
          scale={16}
          blur={2.2}
          far={5}
          color="#000000"
        />
        <Dust />
        <fog attach="fog" args={["#05070b", 9, 24]} />
      </Canvas>
    </div>
  );
}
