type AssetPointer = { url: string };

const modulesA = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames/*.asset.json",
  { eager: true },
);

const modulesB = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames-b/*.asset.json",
  { eager: true },
);

const modulesC = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames-c/*.asset.json",
  { eager: true },
);

const modulesD = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames-d/*.asset.json",
  { eager: true },
);

const modulesE = import.meta.glob<{ default: AssetPointer }>(
  "../assets/frames-e/*.asset.json",
  { eager: true },
);

const toUrls = (modules: Record<string, { default: AssetPointer }>) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, m]) => m.default.url);

export const frameUrlsA: string[] = toUrls(modulesA);
export const frameUrlsB: string[] = toUrls(modulesB);
/** Headset orbit sequence. */
export const frameUrlsC: string[] = toUrls(modulesC);
/** Processor macro sequence. */
export const frameUrlsD: string[] = toUrls(modulesD);
/** PC interior sequence. */
export const frameUrlsE: string[] = toUrls(modulesE);

/** Backwards-compatible alias for the first sequence. */
export const frameUrls = frameUrlsA;
