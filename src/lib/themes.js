export const THEMES = [
  {
    id: "keel-light",
    name: "Keel Light",
    mode: "light",
    description: "Warm neutrals with a blue anchor",
    swatches: ["#2563eb", "#f59e0b", "#10b981", "#f6f6f3"],
  },
  {
    id: "forest",
    name: "Forest",
    mode: "light",
    description: "Fresh emerald light theme",
    swatches: ["#059669", "#f59e0b", "#0d9488", "#f4f7f4"],
  },
  {
    id: "keel-dark",
    name: "Keel Dark",
    mode: "dark",
    description: "Deep navy elevation for night work",
    swatches: ["#3b82f6", "#fbbf24", "#34d399", "#0d1117"],
  },
  {
    id: "midnight",
    name: "Midnight",
    mode: "dark",
    description: "Indigo-violet night theme",
    swatches: ["#818cf8", "#fbbf24", "#34d399", "#0b1020"],
  },
];

export const DEFAULT_THEME_ID = "keel-light";

export const LEGACY_THEME_MAP = { light: "keel-light", dark: "keel-dark" };

export const THEME_STORAGE_KEY = "keel-theme";

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function getThemeMode(id) {
  return getTheme(id).mode;
}

export function normalizeTheme(id) {
  if (!id) return DEFAULT_THEME_ID;
  if (LEGACY_THEME_MAP[id]) return LEGACY_THEME_MAP[id];
  return getTheme(id) ? id : DEFAULT_THEME_ID;
}

export function applyTheme(id) {
  const themeId = normalizeTheme(id);
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    /* private mode etc. — ignore */
  }
  document.dispatchEvent(new CustomEvent("keel:theme-change", { detail: themeId }));
  return themeId;
}
