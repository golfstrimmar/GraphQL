// Devidering/plazaDomain.ts
import type { ProjectNode } from "../PlazaComponent";

// убрать _key из дерева
export function removeKeys(node: ProjectNode | string): ProjectNode | string {
  if (typeof node === "string") return node;

  const { _key, children, ...rest } = node;

  return {
    ...rest,
    children: Array.isArray(children) ? children.map(removeKeys) : children,
  };
}

// google fonts import
export function buildGoogleFontsImport(fontFamilies: string[]): string {
  const uniqueFonts = Array.from(new Set(fontFamilies));
  if (!uniqueFonts.length) return "";
  return `@import url('https://fonts.googleapis.com/css2?${uniqueFonts
    .map(
      (name) =>
        `family=${encodeURIComponent(name)}:ital,wght@0,100..900;1,100..900`,
    )
    .join("&")}&display=swap');`;
}

// SCSS-миксины
export function createMixins(
  uniqueMixins: {
    mixin: string;
    fontFamily: string;
    fontWeight: number;
    fontSize: string;
    color: string;
  }[],
): string {
  if (!uniqueMixins?.length) return "";

  return uniqueMixins
    .map(
      (el) => `@mixin ${el.mixin} {
  font-family: "${el.fontFamily}", sans-serif;
  font-weight: ${el.fontWeight};
  font-size: ${el.fontSize};
  color: ${el.color};
}`,
    )
    .join("\n\n");
}
