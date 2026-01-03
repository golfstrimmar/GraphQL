type HtmlNode = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: HtmlNode[] | string;
};
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
