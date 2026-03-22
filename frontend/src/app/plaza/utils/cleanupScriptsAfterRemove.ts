import type { HtmlNode } from "@/types/HtmlNode";
import type { RemovedMeta } from "./removeNodeByKey";

const cleanupScriptsAfterRemove = (
  meta: RemovedMeta,
  nextHtml: HtmlNode[],
  isDragging = false,
): HtmlNode[] => {
  if (isDragging) return nextHtml;
  const { removed, removedClass } = meta;
  if (!removed) return nextHtml;

  const cls = removedClass ?? "";
  if (!cls) return nextHtml;

  let res = nextHtml;

  // Проверяет, есть ли в дереве хотя бы одна не-script нода с этим классом
  const hasNodesWithMark = (mark: string, currentTree: HtmlNode[]): boolean => {
    const visit = (node: HtmlNode): boolean => {
      if (
        node.tag !== "script" &&
        typeof node.class === "string" &&
        node.class.includes(mark)
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
    return currentTree.some(visit);
  };

  // Удаляет все script-ноды, чей text содержит jsMark
  const filterScriptsDeep = (nodes: HtmlNode[], jsMark: string): HtmlNode[] => {
    const visit = (node: HtmlNode): HtmlNode | null => {
      if (
        node.tag === "script" &&
        typeof node.text === "string" &&
        node.text.includes(jsMark)
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

  // "custom-select foo" → ["custom-select","custom","select","foo"]
  const expandTokens = (tokens: string[]): string[] => {
    const set = new Set<string>();
    for (const token of tokens) {
      set.add(token);
      const parts = token.split(/[-__]+/).filter((p) => p.length >= 3);
      for (const part of parts) set.add(part);
    }
    return Array.from(set);
  };

  const allTokens = expandTokens(cls.split(/\s+/).filter(Boolean));

  for (const token of allTokens) {
    if (!hasNodesWithMark(token, res)) {
      res = filterScriptsDeep(res, token);
    }
  }

  return res;
};

export default cleanupScriptsAfterRemove;
