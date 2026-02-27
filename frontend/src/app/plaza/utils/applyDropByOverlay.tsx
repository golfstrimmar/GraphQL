import type { HtmlNode } from "@/types/HtmlNode";
import validateHtmlStructure from "./validateHtmlStructure";
import removeNodeByKey, { RemovedMeta } from "./removeNodeByKey";
import addNodeToTargetByKey from "./addNodeToTargetByKey";

export type OverlayState = {
  parentKey: string | "__ROOT__";
  siblingKey: string | null;
  mode: "before" | "after" | "inside";
};

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

export type ApplyDropResult = {
  tree: HtmlNode[];
  meta: RemovedMeta;
};

const applyDropByOverlay = (
  sourceKey: string,
  ov: OverlayState,
  tree: HtmlNode[] | HtmlNode,
): ApplyDropResult => {
  const { parentKey, siblingKey, mode } = ov;

  const treeArray = Array.isArray(tree) ? tree : [tree];

  const { tree: withoutSource, meta } = removeNodeByKey(treeArray, sourceKey);
  const removed = meta.removed;

  if (!removed) {
    return { tree: treeArray, meta };
  }

  // === ВСТАВКА ВНУТРЬ ======================================
  if (mode === "inside" && siblingKey) {
    const res = addNodeToTargetByKey(withoutSource, siblingKey, removed);
    if (!validateHtmlStructure(res)) {
      flashInvalidDrop(siblingKey || parentKey);
      return { tree: treeArray, meta };
    }
    return { tree: res, meta };
  }

  // === ВСТАВКА НА КОРЕНЬ ===================================
  if (parentKey === "__ROOT__") {
    const baseArray = Array.isArray(withoutSource)
      ? [...withoutSource]
      : withoutSource
        ? [withoutSource]
        : [];

    if (!siblingKey) {
      baseArray.push(removed);
    } else {
      const idx = baseArray.findIndex((n) => n && n._key === siblingKey);

      if (idx === -1) {
        baseArray.push(removed);
      } else if (mode === "before") {
        baseArray.splice(idx, 0, removed);
      } else {
        baseArray.splice(idx + 1, 0, removed);
      }
    }

    if (!validateHtmlStructure(baseArray)) {
      flashInvalidDrop(siblingKey || "__ROOT__");
      return { tree: treeArray, meta };
    }

    return { tree: baseArray, meta };
  }

  // === ВСТАВКА НА ВЛОЖЕННЫЙ УРОВЕНЬ ========================

  const insertIntoParent = (nodes: HtmlNode[]): HtmlNode[] =>
    nodes.map((node) => {
      if (node._key === parentKey) {
        const parent = { ...node };
        const children = Array.isArray(parent.children)
          ? [...parent.children]
          : [];

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

      if (Array.isArray(node.children) && node.children.length > 0) {
        return {
          ...node,
          children: insertIntoParent(node.children),
        };
      }

      return node;
    });

  const baseWithout = Array.isArray(withoutSource)
    ? withoutSource
    : [withoutSource];

  const newTree = insertIntoParent(baseWithout);

  if (!validateHtmlStructure(newTree)) {
    flashInvalidDrop(siblingKey || parentKey);
    return { tree: treeArray, meta };
  }

  return { tree: newTree, meta };
};

export default applyDropByOverlay;
