import validateHtmlStructure from "./validateHtmlStructure";
import removeNodeByKey from "./removeNodeByKey";
import addNodeToTargetByKey from "./addNodeToTargetByKey";

const flashInvalidDrop = (key: string | "__ROOT__") => {
  if (key === "__ROOT__") {
    const baza = document.querySelector(".baza") as HTMLElement | null;
    if (baza) {
      baza.classList.add("tag-scale-pulse");
      setTimeout(() => baza.classList.remove("tag-scale-pulse"), 1000);
    }
    return;
  }

  const el = document.querySelector<HTMLElement>(
    `.renderedNode[data-key="${key}"]`,
  );
  if (!el) return;

  el.classList.add("tag-scale-pulse");
  setTimeout(() => {
    el.classList.remove("tag-scale-pulse");
  }, 1000);
};

const applyDropByOverlay = (sourceKey: string, ov: OverlayState, tree: any) => {
  const { parentKey, siblingKey, mode } = ov;

  const { tree: withoutSource, removed } = removeNodeByKey(tree, sourceKey);
  if (!removed) return tree;

  // Вставка внутрь
  if (mode === "inside" && siblingKey) {
    const res = addNodeToTargetByKey(withoutSource, siblingKey, removed);
    if (!validateHtmlStructure(res)) {
      flashInvalidDrop(siblingKey || parentKey);
      return tree;
    }
    return res;
  }

  // Вставка на корень
  if (parentKey === "__ROOT__") {
    const asArray = Array.isArray(withoutSource)
      ? [...withoutSource]
      : [withoutSource];

    if (!siblingKey) {
      asArray.push(removed);
    } else {
      const idx = asArray.findIndex((n) => n && n._key === siblingKey);
      if (idx === -1) {
        asArray.push(removed);
      } else if (mode === "before") {
        asArray.splice(idx, 0, removed);
      } else {
        asArray.splice(idx + 1, 0, removed);
      }
    }

    if (!validateHtmlStructure(asArray)) {
      flashInvalidDrop(siblingKey || "__ROOT__");
      return tree;
    }
    return asArray;
  }

  // Вложенные уровни
  const insertIntoParent = (node: any): any => {
    if (Array.isArray(node)) return node.map(insertIntoParent);

    if (node._key === parentKey) {
      const parent = { ...node };
      if (!Array.isArray(parent.children)) parent.children = [];
      const children = [...parent.children];

      if (!siblingKey) {
        children.push(removed);
      } else {
        const idx = children.findIndex((c) => c && c._key === siblingKey);
        if (idx === -1) {
          children.push(removed);
        } else if (mode === "before") {
          children.splice(idx, 0, removed);
        } else {
          children.splice(idx + 1, 0, removed);
        }
      }

      parent.children = children;
      return parent;
    }

    if (Array.isArray(node.children)) {
      return { ...node, children: node.children.map(insertIntoParent) };
    }

    return node;
  };

  const newTree = insertIntoParent(withoutSource);
  if (!validateHtmlStructure(newTree)) {
    flashInvalidDrop(siblingKey || parentKey);
    return tree;
  }
  return newTree;
};

export default applyDropByOverlay;
