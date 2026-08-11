export function SectionLabel({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="font-display text-[10px] tracking-[0.4em] text-accent">
        {index}
      </span>
      <span className="h-px w-12 bg-gradient-to-r from-accent/70 to-transparent" />
      <span className="text-[10px] tracking-[0.4em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
