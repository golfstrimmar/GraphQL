import type { HtmlNode } from "@/types/HtmlNode";

function addNodeToTargetByKey(
  tree: HtmlNode[],
  targetKey: string,
  nodeToInsert: HtmlNode,
): HtmlNode[] {
  const addToArray = (arr: HtmlNode[]): HtmlNode[] =>
    arr.map((node) => {
      if (node._key === targetKey) {
        const children = Array.isArray(node.children) ? node.children : [];
        return { ...node, children: [...children, nodeToInsert] };
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        return { ...node, children: addToArray(node.children) };
      }

      return node;
    });

  return Array.isArray(tree) ? addToArray(tree) : addToArray([tree]);
}

export default addNodeToTargetByKey;
