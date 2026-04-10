import type { HtmlNode } from "@/types/HtmlNode";

export function findNodeByKey(nodes: HtmlNode[], key: string): HtmlNode | null {
  for (const node of nodes) {
    if (node._key === key) return node;
    if (Array.isArray(node.children)) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}