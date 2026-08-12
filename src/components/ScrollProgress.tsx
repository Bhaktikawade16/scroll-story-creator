import { motion, useScroll, useSpring } from "motion/react";

/** Hairline vertical rail on the right edge showing scroll depth. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.3,
  });

  return (
    <div
      className="pointer-events-none fixed right-3 top-1/2 z-[60] hidden h-[42vh] w-px -translate-y-1/2 bg-foreground/10 sm:block"
      aria-hidden
    >
      <motion.div
        style={{ scaleY }}
        className="h-full w-full origin-top bg-gradient-to-b from-primary via-accent to-[var(--violet)]"
      />
    </div>
  );
}
