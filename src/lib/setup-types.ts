/**
 * Central definitions for "what a customizable part looks like."
 * Framework-agnostic (no React/Three imports) so it's safe to use from:
 * - the 3D components (client)
 * - the builder UI (client)
 * - the gallery backend (server) for validation
 */

export const CATEGORIES = [
  "PC",
  "MONITOR",
  "KEYBOARD",
  "MOUSE",
  "CHAIR",
  "LIGHTING",
  "WEBCAM",
  "SPEAKERS",
  "MOUSEPAD",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Every valid variant value across all categories (kept flat for simple storage/validation). */
export const ALL_VARIANTS = [
  "TOWER",
  "COMPACT",
  "CUBE",
  "STANDARD",
  "ULTRAWIDE",
  "CURVED",
  "FULL",
  "TKL",
  "COMPACT60",
  "ERGO",
  "MINI",
  "GAMING",
  "HIGHBACK",
  "RACER",
  "MESH",
  "PULSE",
  "STATIC",
  "RAINBOW",
  "CLIP",
  "RING",
  "STREAM",
  "DESKTOP",
  "SOUNDBAR",
  "STUDIO",
  "XL",
  "RGB_EDGE",
] as const;

export type Variant = (typeof ALL_VARIANTS)[number];

export const VARIANT_OPTIONS: Record<Category, { value: Variant; label: string }[]> = {
  PC: [
    { value: "TOWER", label: "FULL TOWER" },
    { value: "COMPACT", label: "MINI ITX" },
    { value: "CUBE", label: "SFF CUBE" },
  ],
  MONITOR: [
    { value: "STANDARD", label: "STANDARD" },
    { value: "ULTRAWIDE", label: "ULTRAWIDE" },
    { value: "CURVED", label: "CURVED" },
  ],
  KEYBOARD: [
    { value: "FULL", label: "FULL SIZE" },
    { value: "TKL", label: "TENKEYLESS" },
    { value: "COMPACT60", label: "60%" },
  ],
  MOUSE: [
    { value: "ERGO", label: "ERGO" },
    { value: "MINI", label: "COMPACT" },
    { value: "GAMING", label: "GAMING" },
  ],
  CHAIR: [
    { value: "HIGHBACK", label: "HIGH BACK" },
    { value: "RACER", label: "RACER" },
    { value: "MESH", label: "MESH" },
  ],
  LIGHTING: [
    { value: "PULSE", label: "PULSE" },
    { value: "STATIC", label: "STATIC" },
    { value: "RAINBOW", label: "RAINBOW" },
  ],
  WEBCAM: [
    { value: "CLIP", label: "CLIP-ON" },
    { value: "RING", label: "RING LIGHT" },
    { value: "STREAM", label: "STREAM PRO" },
  ],
  SPEAKERS: [
    { value: "DESKTOP", label: "DESKTOP" },
    { value: "SOUNDBAR", label: "SOUNDBAR" },
    { value: "STUDIO", label: "STUDIO" },
  ],
  MOUSEPAD: [
    { value: "STANDARD", label: "STANDARD" },
    { value: "XL", label: "XL EXTENDED" },
    { value: "RGB_EDGE", label: "RGB EDGE" },
  ],
};

export const DEFAULT_VARIANT: Record<Category, Variant> = {
  PC: "TOWER",
  MONITOR: "STANDARD",
  KEYBOARD: "FULL",
  MOUSE: "ERGO",
  CHAIR: "HIGHBACK",
  LIGHTING: "PULSE",
  WEBCAM: "CLIP",
  SPEAKERS: "DESKTOP",
  MOUSEPAD: "STANDARD",
};

export const COLOR_PALETTE: { value: string; label: string }[] = [
  { value: "#38e1ff", label: "CYAN" },
  { value: "#8b6cff", label: "VIOLET" },
  { value: "#ffb84d", label: "AMBER" },
  { value: "#ff5c8a", label: "ROSE" },
  { value: "#35e28f", label: "EMERALD" },
  { value: "#f5f7fb", label: "WHITE" },
];

export const DEFAULT_COLOR = COLOR_PALETTE[0]!.value;

/** Surface finish for the main chassis/shell of a part. Affects roughness/metalness only. */
export const MATERIALS = ["MATTE", "GLOSSY", "CHROME"] as const;
export type Material = (typeof MATERIALS)[number];

export const MATERIAL_OPTIONS: { value: Material; label: string }[] = [
  { value: "MATTE", label: "MATTE" },
  { value: "GLOSSY", label: "GLOSSY" },
  { value: "CHROME", label: "CHROME" },
];

export const DEFAULT_MATERIAL: Material = "MATTE";

/** Glow/emissive brightness multiplier applied to a part's accent elements. */
export const MIN_INTENSITY = 0.2;
export const MAX_INTENSITY = 2.2;
export const DEFAULT_INTENSITY = 1;

/** Loosely-typed hex color check — accepts any #rgb/#rrggbb the user picks. */
export const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** A single customized part: which piece, its color/style/finish/glow. */
export type PartConfig = {
  category: Category;
  color: string;
  variant: Variant;
  material: Material;
  intensity: number;
};

export function defaultConfig(category: Category): PartConfig {
  return {
    category,
    color: DEFAULT_COLOR,
    variant: DEFAULT_VARIANT[category],
    material: DEFAULT_MATERIAL,
    intensity: DEFAULT_INTENSITY,
  };
}
