// HTML5 Content Categories
const phrasingTags = new Set([
  "span",
  "strong",
  "em",
  "b",
  "i",
  "a",
  "img",
  "br",
  "small",
]);
const voidTags = new Set(["img", "input", "br", "hr", "meta", "link"]);

const validateHtmlStructure = (tree: any): boolean => {
  if (Array.isArray(tree)) {
    return tree.every(validateNode);
  }
  return validateNode(tree);
};

const validateNode = (node: any): boolean => {
  if (typeof node === "string") return true;
  if (!node?.tag) return true;

  const tag = node.tag.toLowerCase(); // 🆕 Нормализация

  // 1. Void elements НЕ МОГУТ иметь children
  if (voidTags.has(tag) && (node.children?.length ?? 0) > 0) {
    console.warn(`❌ Void <${tag}> has ${node.children?.length} children`);
    return false;
  }

  // 2. Phrasing content принимает ТОЛЬКО phrasing
  if (["p", "span"].includes(tag)) {
    const invalidChild =
      Array.isArray(node.children) &&
      node.children.some(
        (child: any) =>
          typeof child !== "string" &&
          child?.tag &&
          !phrasingTags.has(child.tag.toLowerCase()), // 🆕 Нормализация!
      );
    if (invalidChild) {
      console.warn(`❌ <${tag}> only phrasing content`);
      return false;
    }
  }

  // 3. Рекурсия (теперь работает!)
  return Array.isArray(node.children)
    ? node.children.every(validateNode) // ✅ Внешняя функция!
    : true;
};

export default validateHtmlStructure;
