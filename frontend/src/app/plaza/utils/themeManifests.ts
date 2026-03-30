export interface ThemeTokens {
  name: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
  };
  font: string;
}

export const themeManifests: Record<string, ThemeTokens> = {
  "Commerce": {
    name: "Commerce",
    colors: {
      bg: "#ffffff",
      surface: "#f3f4f6",
      text: "#111827",
      accent: "#2563eb",
    },
    font: "Inter, sans-serif",
  },
  "Neo-Brutalism": {
    name: "Neo-Brutalism",
    colors: {
      bg: "#fef9f1",
      surface: "#ffffff",
      text: "#000000",
      accent: "#fbbf24",
    },
    font: "Outfit, sans-serif",
  },
  "Techno": {
    name: "Techno",
    colors: {
      bg: "#0a0a0b",
      surface: "#1e1e20",
      text: "#ffffff",
      accent: "#39ff14",
    },
    font: "Inter, sans-serif",
  },
  "Glassmorphism": {
    name: "Glassmorphism",
    colors: {
      bg: "#6366f1",
      surface: "rgba(255, 255, 255, 0.15)",
      text: "#ffffff",
      accent: "#ffffff",
    },
    font: "Outfit, sans-serif",
  },
  "Loft": {
    name: "Loft",
    colors: {
      bg: "#fcfaf7",
      surface: "#ffffff",
      text: "#1f1f1f",
      accent: "#a1824a",
    },
    font: "Libre Baskerville, serif",
  }
};
