import type { HtmlNode } from "@/types/HtmlNode";
import defaults from "@/app/api/json-to-html/utils/default";
const { selfClosingTags, SERVICE_TEXTS } = defaults;

export function parseHtml(nodes: HtmlNode[]): string {
  const parseHtmlSync = (nodes: HtmlNode[]): string =>
    nodes
      .map((node) => {
        if (!node.tag) return "";
        if (node.tag === "script") return "";

        const attrPairs: string[] = [];

        if (node.attributes) {
          for (const [key, value] of Object.entries(node.attributes)) {
            if (value === undefined || value === null) continue;
            attrPairs.push(`${key}="${String(value)}"`);
          }
        }

        if (node.class && node.class.trim()) {
          attrPairs.push(`class="${node.class}"`);
        }
        if (node.style && node.style.trim()) {
          attrPairs.push(`style="${node.style}"`);
        }
        if (node._key) {
          attrPairs.push(`data-key="${node._key}"`);
        }

        const attrsString = attrPairs.length ? " " + attrPairs.join(" ") : "";
        const isSelfClosing = selfClosingTags.has(node.tag);

        // текст без служебных значений
        const rawText = node.text ?? "";
        const innerText = SERVICE_TEXTS.includes(rawText.trim())
          ? ""
          : rawText;

        if (isSelfClosing) {
          return `<${node.tag}${attrsString} />`;
        }

        const childrenHtml =
          node.children && node.children.length
            ? parseHtmlSync(node.children)
            : "";

        return `<${node.tag}${attrsString}>${innerText}${childrenHtml}</${node.tag}>`;
      })
      .join("");
  return parseHtmlSync(nodes);
}