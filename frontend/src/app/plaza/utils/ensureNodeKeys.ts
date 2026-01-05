type HtmlNode = {
  _key?: string;
  children?: HtmlNode[];
};

export function ensureNodeKeys(
  tree: HtmlNode | HtmlNode[],
): HtmlNode | HtmlNode[] {
  const withKey = (node: HtmlNode): HtmlNode => ({
    ...node,
    _key: node._key ?? crypto.randomUUID(),
    children: node.children ? node.children.map(withKey) : [],
  });

  return Array.isArray(tree) ? tree.map(withKey) : withKey(tree);
}
