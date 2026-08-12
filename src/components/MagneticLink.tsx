import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/** Button/link that leans toward the pointer with a soft glow. */
export function MagneticLink({
  to,
  children,
  className = "",
  strength = 14,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [d, setD] = useState({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      className="inline-block"
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setD({
          x: ((e.clientX - r.left) / r.width - 0.5) * strength * 2,
          y: ((e.clientY - r.top) / r.height - 0.5) * strength,
        });
      }}
      onPointerLeave={() => setD({ x: 0, y: 0 })}
      style={{
        transform: `translate3d(${d.x}px, ${d.y}px, 0)`,
        transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </div>
  );
}
