// lib/designSystem/generateHeaderNodesFromDS.ts
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

export type FontSlot = {
  id: string;
  label: string;
  family: string;
  importString: string;
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

export function generateHeaderNodesFromDS(
  colors: ColorState,
  fonts: FontSlot[],
  fontSizes: FontSizeState,
): HtmlNode[] {
  const nodes: HtmlNode[] = [];

  const baseStyle = " padding: 2px 4px; border: 1px solid #adadad;";
  const makeHeader = (
    level: 1 | 2 | 3 | 4 | 5 | 6,
    colorKey: keyof ColorState,
    fontSizeKey: keyof FontSizeState,
    fontId: string,
  ) => {
    const colorName = colors[colorKey]; // например "headers1color"
    if (!colorName) return; // нет цвета — не создаём узел

    const fontSize = fontSizes[fontSizeKey]; // "46px"
    const fontFamily =
      fonts.find((f) => f.id === fontId)?.family || "system-ui";

    const styleParts = [
      baseStyle,
      `color: ${colorName};`,
      fontSize ? `font-size: ${fontSize};` : "",
      fontFamily
        ? `font-family: "${fontFamily}", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;`
        : "",
      "font-weight: bold;",
    ]
      .filter(Boolean)
      .join(" ");

    nodes.push({
      tag: `h${level}`,
      text: `h${level}`,
      class: "",
      style: styleParts,
      children: [],
    });
  };

  makeHeader(1, "headers1color", "fontSizeHeader1", "headers1font");
  makeHeader(2, "headers2color", "fontSizeHeader2", "headers2font");
  makeHeader(3, "headers3color", "fontSizeHeader3", "headers3font");
  makeHeader(4, "headers4color", "fontSizeHeader4", "headers4font");
  makeHeader(5, "headers5color", "fontSizeHeader5", "headers5font");
  makeHeader(6, "headers6color", "fontSizeHeader6", "headers6font");

  return nodes;
}
