/** Ambient cinematic backdrop: aurora light fields, grid, and film grain. */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aurora-blob absolute -left-[15vw] top-[-10vh] h-[60vmax] w-[60vmax] rounded-full bg-primary/10 blur-[160px]" />
      <div className="aurora-blob-slow absolute -right-[20vw] top-[30vh] h-[55vmax] w-[55vmax] rounded-full bg-[var(--violet)]/10 blur-[180px]" />
      <div className="aurora-blob absolute bottom-[-20vh] left-[25vw] h-[50vmax] w-[50vmax] rounded-full bg-accent/[0.07] blur-[170px]" />
      <div className="grid-lines absolute inset-0 opacity-[0.28]" />
      <div className="grain absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
