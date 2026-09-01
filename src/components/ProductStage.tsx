import { Suspense, lazy, useEffect, useState } from "react";
import type { Category } from "./three/Stage";
import type { Material, PartConfig } from "@/lib/setup-types";

const Stage = lazy(() => import("./three/Stage"));

export type { Category, PartConfig };

/**
 * Client-only mount for the WebGL stage.
 * The 3D scene is procedural geometry, so it stays razor sharp at any size.
 */
export function ProductStage(props: {
  category?: Category | undefined;
  exploded?: boolean | undefined;
  onToggleExplode?: (() => void) | undefined;
  autoSpin?: boolean | undefined;
  setup?: PartConfig[] | undefined;
  accent?: string | undefined;
  variant?: string | undefined;
  material?: Material | undefined;
  intensity?: number | undefined;
  className?: string | undefined;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-[9px] tracking-[0.35em] text-muted-foreground">
          INITIALISING RENDERER
        </span>
      </div>
    );

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="animate-pulse text-[9px] tracking-[0.35em] text-muted-foreground">
            LOADING 3D
          </span>
        </div>
      }
    >
      <Stage {...props} />
    </Suspense>
  );
}
