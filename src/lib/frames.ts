type AssetPointer = { url: string };

const modulesA = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames/*.asset.json",
  { eager: true },
);

const modulesB = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames-b/*.asset.json",
  { eager: true },
);

const toUrls = (modules: Record<string, { default: AssetPointer }>) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, m]) => m.default.url);

export const frameUrlsA: string[] = toUrls(modulesA);
export const frameUrlsB: string[] = toUrls(modulesB);

/** Backwards-compatible alias for the first sequence. */
export const frameUrls = frameUrlsA;
