// src/utils/figmaExtractors.js

// Функция поиска текстовых узлов с нужными стилями
export function findAllTextNodes(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;
  if (obj.type === "TEXT" && obj.content) {
    const textStyle = obj.styles?.text;
    const fontFamily = textStyle?.family;
    const fontWeight = textStyle?.weight;
    const fontSize = textStyle?.size;
    const color = obj.styles?.bg;
    if (fontFamily && fontWeight && fontSize) {
      acc.push({
        text: obj.content,
        fontFamily,
        fontWeight,
        fontSize: fontSize + "px",
        color: color || null,
      });
    }
  }
  if (Array.isArray(obj.children)) {
    obj.children.forEach((child) => findAllTextNodes(child, acc));
  }
  return acc;
}

// Генерация имени миксина по параметрам
export function getMixinName(fontFamily, fontWeight, fontSize) {
  return `font-${fontFamily
    .toLowerCase()
    .replace(/\s+/g, "-")}-${fontWeight}-${parseInt(fontSize)}`;
}

// Функция извлечения данных для резолвера
export function extractFigmaData(realJsonContent) {
  const colors = Object.values(realJsonContent.designTokens?.colors || {});

  const fontsObj = realJsonContent.designTokens?.fonts || {};
  const fonts = fontsObj;
  const textNodes = findAllTextNodes(realJsonContent.structure);

  const usedCombos = new Set();
  textNodes.forEach((node) => {
    usedCombos.add(
      `${node.fontFamily}|${node.fontWeight}|${node.fontSize}|${node.color}`,
    );
  });

  const enhancedTextNodes = textNodes.map((node) => ({
    ...node,
    mixin: getMixinName(node.fontFamily, node.fontWeight, node.fontSize),
  }));

  return { colors, fonts, textNodes: enhancedTextNodes };
}
