export type ColorState = {
  headers1color: string;
  headers2color: string;
  headers3color: string;
  headers4color: string;
  headers5color: string;
  headers6color: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
};

export type FontSizeState = {
  fontSizeHeader1: string;
  fontSizeHeader2: string;
  fontSizeHeader3: string;
  fontSizeHeader4: string;
  fontSizeHeader5: string;
  fontSizeHeader6: string;
};
type FontSlot = {
  id: string; // "headersfont", "font2" — используется в UI
  label: string; // подпись в UI
  family: string; // имя шрифта (Inter, Roboto) — это и есть value для базы
  importString: string; // строка @import, только для фронта
};
export type HtmlNode = {
  tag: string;
  text?: string;
  class?: string;
  style?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[] | string;
  _key?: string;
};

const mergeStyle = (oldStyle: string | undefined, extra: string) => {
  const base = (oldStyle || "").trim().replace(/;+\s*$/g, "");
  const add = extra.trim();
  if (!base) return add;
  if (!add) return base;
  return `${base}; ${add}`;
};

function applyHeadersToNode(
  node: HtmlNode,
  colors: ColorState,
  fonts: FontSlot[],
  fontSizes: FontSizeState,
): HtmlNode {
  const updated: HtmlNode = { ...node };

  const enrichHeader = (
    level: 1 | 2 | 3 | 4 | 5 | 6,
    colorKey: keyof ColorState,
    fontSizeKey: keyof FontSizeState,
    fontId: string,
  ) => {
    if (node.tag !== `h${level}`) return;

    const colorName = colors[colorKey];
    const fontSize = fontSizes[fontSizeKey];
    const family = fonts.find((f) => f.id === fontId)?.family;

    const parts = [
      colorName ? `color: ${colorName};` : "",
      fontSize ? `font-size: ${fontSize};` : "",
      family
        ? `font-family: "${family}", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;`
        : "",
      "font-weight: bold;",
    ]
      .filter(Boolean)
      .join(" ");

    updated.style = mergeStyle(node.style, parts);
  };

  enrichHeader(1, "headers1color", "fontSizeHeader1", "headers1font");
  enrichHeader(2, "headers2color", "fontSizeHeader2", "headers2font");
  enrichHeader(3, "headers3color", "fontSizeHeader3", "headers3font");
  enrichHeader(4, "headers4color", "fontSizeHeader4", "headers4font");
  enrichHeader(5, "headers5color", "fontSizeHeader5", "headers5font");
  enrichHeader(6, "headers6color", "fontSizeHeader6", "headers6font");

  if (Array.isArray(node.children)) {
    updated.children = node.children.map((ch) =>
      applyHeadersToNode(ch as HtmlNode, colors, fonts, fontSizes),
    );
  }

  return updated;
}

export function applyDSHeadersToTree(
  tree: HtmlNode | HtmlNode[],
  colors: ColorState,
  fonts: FontSlot[],
  fontSizes: FontSizeState,
): HtmlNode | HtmlNode[] {
  if (Array.isArray(tree)) {
    return tree.map((n) => applyHeadersToNode(n, colors, fonts, fontSizes));
  }
  return applyHeadersToNode(tree, colors, fonts, fontSizes);
}
