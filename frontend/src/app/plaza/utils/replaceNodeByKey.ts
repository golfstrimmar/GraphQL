import type { HtmlNode } from "@/types/HtmlNode";

function replaceNodeByKey(
  nodes: HtmlNode[],
  key: string,
  newNode: HtmlNode
): HtmlNode[] {
  return nodes.map((node) => {
    if (node._key === key) {
      return newNode;
    }

    if (node.children && node.children.length) {
      return {
        ...node,
        children: replaceNodeByKey(node.children, key, newNode),
      };
    }

    return node;
  });
}


export default replaceNodeByKey;