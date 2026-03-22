import type { HtmlNode } from "@/types/HtmlNode";
import type { RemovedMeta } from "./removeNodeByKey";

const cleanupStylesAfterRemove = (
  meta: RemovedMeta,
  nextHtml: HtmlNode[],
  isDragging = false,
): HtmlNode[] => {
  if (isDragging) return nextHtml;
  const { removed, removedClass, marks } = meta;
  if (!removed) return nextHtml;

  const cls = removedClass ?? "";
  let res = nextHtml;

  const hasNodesWithMark = (mark: string): boolean => {
    const arr = Array.isArray(res) ? res : [res];

    const visit = (node: HtmlNode): boolean => {
      if (
        node.tag !== "style" &&
        node.tag !== "script" &&
        typeof node.class === "string" &&
        new RegExp(`(^|\\s)${mark}(\\s|$)`).test(node.class)
      ) {
        return true;
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (typeof child === "string") continue;
          if (visit(child)) return true;
        }
      }

      return false;
    };

    for (const n of arr) {
      if (visit(n)) return true;
    }
    return false;
  };

  const filterStylesDeep = (
    nodes: HtmlNode[],
    cssMark: string,
  ): HtmlNode[] => {
    const visit = (node: HtmlNode): HtmlNode | null => {
      if (
        node.tag === "style" &&
        typeof node.text === "string" &&
        node.text.includes(cssMark)
      ) {
        return null;
      }

      if (Array.isArray(node.children)) {
        const newChildren: (HtmlNode | string)[] = [];
        for (const ch of node.children) {
          if (typeof ch === "string") {
            newChildren.push(ch);
          } else {
            const v = visit(ch);
            if (v) newChildren.push(v);
          }
        }
        return { ...node, children: newChildren as HtmlNode["children"] };
      }

      return node;
    };

    const result: HtmlNode[] = [];
    for (const n of nodes) {
      const v = visit(n);
      if (v) result.push(v);
    }
    return result;
  };

  // Финальная очистка по всем токенам удаленного класса
  const allTokens = cls.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of allTokens) {
    if (!hasNodesWithMark(token)) {
      res = filterStylesDeep(res, token);
    }
  }
  for (const token of allTokens) {
    if (!hasNodesWithMark(token)) {
      res = filterStylesDeep(res, token);
    }
  }

  return res;
};

export default cleanupStylesAfterRemove;