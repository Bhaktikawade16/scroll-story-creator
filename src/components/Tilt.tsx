import { useRef, useState, type ReactNode } from "react";

/** Subtle 3D perspective tilt that follows the pointer. */
export function Tilt({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ x: -py * max, y: px * max });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      style={{ perspective: "1200px" }}
      className={className}
    >
      <div
        style={{
          transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)`,
          transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
