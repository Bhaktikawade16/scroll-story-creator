/** Tiny futuristic annotations that drift slowly around the 3D scenes. */
export function Hud({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 ${className}`}
      aria-hidden
    >
      {items.map((t, i) => (
        <span
          key={t}
          className="hud-float absolute text-[9px] tracking-[0.32em] text-muted-foreground/70"
          style={{
            top: `${16 + i * 22}%`,
            left: i % 2 === 0 ? "5%" : "auto",
            right: i % 2 === 0 ? "auto" : "5%",
            animationDelay: `${i * 1.7}s`,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
