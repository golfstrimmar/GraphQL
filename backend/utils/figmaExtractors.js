// ========🔤 цвета
const rgbToHex = (r, g, b, a = 1) => {
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
    return null;
  }
  const toHex = (n) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const alpha = typeof a === "number" ? toHex(a) : "ff";
  return `${hex}${alpha}`;
};

const extractColorsFromNode = (node) => {
  const colors = [];
  if (!node || typeof node !== "object") return colors;

  if (node.style?.backgroundColor) {
    const bg = node.style.backgroundColor;
    const hex = rgbToHex(bg.r, bg.g, bg.b, bg.a);
    if (hex) colors.push(hex);
  }

  if (Array.isArray(node.effects)) {
    node.effects.forEach((effect) => {
      if (effect?.color) {
        const c = effect.color;
        const hex = rgbToHex(c.r, c.g, c.b, c.a);
        if (hex) colors.push(hex);
      }
    });
  }

  if (Array.isArray(node.gradientStops)) {
    node.gradientStops.forEach((stop) => {
      if (stop?.color) {
        const c = stop.color;
        const hex = rgbToHex(c.r, c.g, c.b, c.a);
        if (hex) colors.push(hex);
      }
    });
  }

  if (node.characters && node.style?.color) {
    const c = node.style.color;
    const hex = rgbToHex(c.r, c.g, c.b, c.a);
    if (hex) colors.push(hex);
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      const childColors = extractColorsFromNode(child);
      if (childColors.length) colors.push(...childColors);
    });
  }

  return Array.from(new Set(colors.filter((c) => typeof c === "string" && c)));
};

// =========🔤 шрифты
const extractFontsFromNode = (node, acc = {}) => {
  if (!node || typeof node !== "object") return acc;

  if (node.type === "TEXT" && node.style && node.style.fontFamily) {
    const family = String(node.style.fontFamily).trim();
    const weight = node.style.fontWeight;
    const size = node.style.fontSize;

    if (!acc[family]) {
      acc[family] = {
        family,
        sizes: {},
        weights: {},
      };
    }

    if (typeof size === "number") {
      acc[family].sizes[`size-${size}`] = `${size}px`;
    }

    if (typeof weight === "number" || typeof weight === "string") {
      const w = String(weight);
      acc[family].weights[`weight-${w}`] = w;
    }
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => extractFontsFromNode(child, acc));
  }
  return acc;
};

// ===========🔠 сбор textNodes
const rgbToCss = (r, g, b) => {
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
    return null;
  }
  const to255 = (n) => Math.round(n * 255);
  return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
};

const buildMixinName = (family, weight, size) => {
  const fam = String(family).toLowerCase().replace(/\s+/g, "-"); // montserrat, sf-pro-display
  const w = String(weight);
  const s = typeof size === "number" ? size : parseInt(size, 10);
  return `font-${fam}-${w}-${s}`;
};

const extractTextNodesFromNode = (node, acc = []) => {
  if (!node || typeof node !== "object") return acc;

  if (node.type === "TEXT" && node.characters && node.style?.fontFamily) {
    const family = String(node.style.fontFamily).trim();
    const weight = node.style.fontWeight;
    const size = node.style.fontSize;

    // цвет берём из первого SOLID fill
    let color = null;
    if (Array.isArray(node.fills) && node.fills.length > 0) {
      const solid = node.fills.find((f) => f.type === "SOLID" && f.color);
      if (solid && solid.color) {
        color = rgbToCss(solid.color.r, solid.color.g, solid.color.b);
      }
    }

    const fontSize =
      typeof size === "number" ? `${size}px` : `${parseInt(size, 10)}px`;
    const fontWeight = String(weight);
    const mixin = buildMixinName(family, fontWeight, fontSize);

    acc.push({
      text: node.characters,
      color,
      mixin,
      fontSize,
      fontFamily: family,
      fontWeight,
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => extractTextNodesFromNode(child, acc));
  }

  return acc;
};

export const extractFigmaData = (figmaJson) => {
  const root = figmaJson?.document || figmaJson;

  if (!root || typeof root !== "object") {
    return { colors: [], fonts: {}, textNodes: [] };
  }

  const colors = extractColorsFromNode(root);
  const fonts = extractFontsFromNode(root);
  const rawTextNodes = extractTextNodesFromNode(root);
  // 🔁 убираем строгие дубликаты (по тексту + шрифту + размеру + цвету)
  const seen = new Set();
  const textNodes = rawTextNodes.filter((n) => {
    const key = `${n.text}|${n.fontFamily}|${n.fontWeight}|${n.fontSize}|${n.color}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    colors,
    fonts,
    textNodes,
  };
};
