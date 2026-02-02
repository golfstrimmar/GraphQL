import type { HtmlNode } from "@/types/HtmlNode";
type Tree = HtmlNode | HtmlNode[];

function removeNodeByKey(
  tree: Tree,
  key: string,
): { tree: Tree; removed: HtmlNode | null } {
  const removeFromArray = (
    arr: HtmlNode[],
  ): { arr: HtmlNode[]; removed: HtmlNode | null } => {
    let removed: HtmlNode | null = null;

    const newArr = arr.flatMap((node) => {
      if (node._key === key) {
        removed = node;
        return [];
      }
      if (node.children?.length) {
        const { arr: newChildren, removed: childRemoved } = removeFromArray(
          node.children,
        );
        if (childRemoved) removed = childRemoved;
        return [{ ...node, children: newChildren }];
      }
      return [node];
    });

    return { arr: newArr, removed };
  };

  if (Array.isArray(tree)) {
    const { arr, removed } = removeFromArray(tree);
    return { tree: arr, removed };
  } else {
    if (tree._key === key) {
      return { tree: [], removed: tree };
    }
    const { arr, removed } = removeFromArray([tree]);
    return { tree: arr, removed };
  }
}
export default removeNodeByKey;
