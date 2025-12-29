const validateHtmlStructure = (tree: any): boolean => {
  // HTML5 Content Categories [web:240]
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
  const flowTags = new Set([
    "div",
    "section",
    "article",
    "header",
    "footer",
    "ul",
    "li",
    "p",
  ]);
  const voidTags = new Set(["img", "input", "br", "hr", "meta", "link"]);

  const validateNode = (node: any): boolean => {
    if (typeof node === "string") return true;
    if (!node?.tag) return true;

    // 1. Void elements НЕ МОГУТ иметь children [web:245]
    if (voidTags.has(node.tag) && node.children?.length) {
      console.warn(`Void element <${node.tag}> cannot have children`);
      return false;
    }

    // 2. Phrasing content (p, span) принимает ТОЛЬКО phrasing [web:237][web:244]
    if (["p", "span"].includes(node.tag)) {
      const invalidChild =
        Array.isArray(node.children) &&
        node.children.some(
          (child: any) =>
            typeof child !== "string" &&
            child?.tag &&
            !phrasingTags.has(child.tag),
        );
      if (invalidChild) {
        console.warn(`<${node.tag}> can only contain phrasing content`);
        return false;
      }
    }

    // 3. Flow content (div, section) принимает всё
    if (Array.isArray(node.children)) {
      return node.children.every(validateNode);
    }

    return true;
  };

  return validateNode(tree);
};

export default validateHtmlStructure;
