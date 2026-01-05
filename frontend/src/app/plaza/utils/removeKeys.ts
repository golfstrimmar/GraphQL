type HtmlNode = {
  tag: string;
  class?: string;
  text?: string;
  style?: string;
  children?: HtmlNode[];
  attributes?: Record<string, any>;
};

type HtmlNodeWithKey = HtmlNode & { _key?: string };

export function removeKeys(
  tree: HtmlNodeWithKey | HtmlNodeWithKey[],
): HtmlNode | HtmlNode[] {
  const stripNode = (node: HtmlNodeWithKey): HtmlNode => ({
    tag: node.tag,
    class: node.class,
    text: node.text,
    style: node.style,
    attributes: node.attributes,
    children: node.children ? node.children.map(stripNode) : [],
  });

  return Array.isArray(tree) ? tree.map(stripNode) : stripNode(tree);
}
