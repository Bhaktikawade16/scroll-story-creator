type AssetPointer = { url: string };

const modules = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames/*.asset.json",
  { eager: true },
);

export const frameUrls: string[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default.url);
