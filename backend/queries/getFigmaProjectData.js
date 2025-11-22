import prisma from "../prisma/client.js";

// Функция поиска всех текстовых узлов с реальными свойствами стиля:
function findAllTextNodes(obj, acc = []) {
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
function getMixinName(fontFamily, fontWeight, fontSize) {
  return `font-${fontFamily
    .toLowerCase()
    .replace(/\s+/g, "-")}-${fontWeight}-${parseInt(fontSize)}`;
}
const getFigmaProjectData = async (_, { projectId }) => {
  if (!projectId) throw new Error("Missing projectId");

  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });

  if (!project) throw new Error("Project not found");

  const realJsonContent =
    typeof project.fileCache === "string"
      ? JSON.parse(project.fileCache)
      : project.fileCache;

  const colors = Object.values(realJsonContent.designTokens?.colors || {});
  const fonts = realJsonContent.designTokens?.fonts || {};
  const textNodes = findAllTextNodes(realJsonContent.structure);
  const usedCombos = new Set();
  textNodes.forEach((node) => {
    usedCombos.add(`${node.fontFamily}|${node.fontWeight}|${node.fontSize}`);
  });
  usedCombos.forEach((combo) => {
    const [family, weight, size, color] = combo.split("|");
    const mixinName = getMixinName(family, weight, size, color);
    console.log(`@mixin ${mixinName} {
  font-family: "${family}", sans-serif;
  font-weight: ${weight};
  font-size: ${size};
  color: ${color};
}`);
  });
  const enhancedTextNodes = textNodes.map((node) => ({
    ...node,
    mixin: getMixinName(node.fontFamily, node.fontWeight, node.fontSize),
  }));

  return {
    project,
    colors,
    fonts,
    textNodes: enhancedTextNodes,
  };
};

export default getFigmaProjectData;
