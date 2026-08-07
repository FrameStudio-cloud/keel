import { useEffect, useMemo, useState } from "react";

const TOKENS = {
  chart1: "--color-chart-1",
  chart2: "--color-chart-2",
  chart3: "--color-chart-3",
  chart4: "--color-chart-4",
  chart5: "--color-chart-5",
  chart6: "--color-chart-6",
  brand: "--color-brand",
  brandSoft: "--color-brand-soft",
  brandStrong: "--color-brand-strong",
  textFaint: "--color-text-faint",
  textMuted: "--color-text-muted",
  textBody: "--color-text-body",
  textPrimary: "--color-text-primary",
  surface1: "--color-surface-1",
  surface2: "--color-surface-2",
  surface3: "--color-surface-3",
  borderSubtle: "--color-border-subtle",
  borderStrong: "--color-border-strong",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger",
  info: "--color-info",
};

function readVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function useThemeColors() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    document.addEventListener("keel:theme-change", handler);
    return () => document.removeEventListener("keel:theme-change", handler);
  }, []);

  return useMemo(() => {
    const colors = {};
    for (const [key, varName] of Object.entries(TOKENS)) {
      colors[key] = readVar(varName);
    }
    return colors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
}
