import SERVICE_TEXTS from "@/utils/plaza/SERVICE_TEXTS";
function cleanServiceTexts(htmlJson: any[], updateFn: (next: any[]) => void) {
  const serviceSet = new Set(SERVICE_TEXTS.map((t) => t.trim().toLowerCase()));

  function walk(node) {
    if (!node || typeof node !== "object") return node;

    let nextText = node.text;
    if (typeof node.text === "string") {
      const normalizedText = node.text.trim().toLowerCase();
      if (serviceSet.has(normalizedText)) {
        nextText = ""; // ✅ очищаем
      }
    }

    let nextChildren = node.children;
    if (Array.isArray(node.children)) {
      nextChildren = node.children.map(walk);
    }

    return {
      ...node,
      text: nextText,
      children: nextChildren,
    };
  }

  const cleaned = Array.isArray(htmlJson)
    ? htmlJson.map(walk)
    : [walk(htmlJson)];

  updateFn(cleaned);
}

export default cleanServiceTexts;
