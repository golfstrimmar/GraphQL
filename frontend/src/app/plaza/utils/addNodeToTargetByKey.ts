import type { HtmlNode } from "@/types/HtmlNode";
function addNodeToTargetByKey(
  tree: HtmlNode[],
  targetKey: string,
  nodeToInsert: HtmlNode,
): Tree {
  const addToArray = (arr: HtmlNode[]): HtmlNode[] =>
    arr.map((node) => {
      if (node._key === targetKey) {
        const children = Array.isArray(node.children) ? node.children : [];
        return { ...node, children: [...children, nodeToInsert] };
      }
      if (node.children?.length) {
        return { ...node, children: addToArray(node.children) };
      }
      return node;
    });

  if (Array.isArray(tree)) {
    return addToArray(tree);
  } else {
    if (tree._key === targetKey) {
      const children = Array.isArray(tree.children) ? tree.children : [];
      return { ...tree, children: [...children, nodeToInsert] };
    }
    const [root] = addToArray([tree]);
    return root;
  }
}
export default addNodeToTargetByKey;
