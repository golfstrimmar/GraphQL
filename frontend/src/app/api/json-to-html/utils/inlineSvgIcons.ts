import type { HtmlNode } from "@/types/HtmlNode";
import { DOMParser as XmldomParser } from "xmldom";

export async function inlineSvgIcons(nodes: HtmlNode[]): Promise<HtmlNode[]> {
  const parser = new XmldomParser();

  const processNode = async (node: HtmlNode): Promise<HtmlNode> => {
    const src = node.attributes?.src;

    const isSvgIcon =
      node.tag === "img" &&
      node.class === "svg-wrapper" &&
      typeof src === "string" &&
      src.trim().toLowerCase().endsWith(".svg");

    if (!isSvgIcon) {
      const children = node.children
        ? await Promise.all(node.children.map(processNode))
        : [];
      return { ...node, children };
    }

    const res = await fetch(src);
    const svgText = await res.text();

    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgEl = svgDoc.getElementsByTagName("svg")[0];
    if (!svgEl) return node;

    const svgAttrs: Record<string, string> = {};
    for (let i = 0; i < svgEl.attributes.length; i++) {
      const a = svgEl.attributes[i];
      svgAttrs[a.name] = a.value;
    }

    // пробрасываем размер иконки
    if (node.style) {
      svgAttrs.style = (svgAttrs.style ? svgAttrs.style + "; " : "") + node.style;
    }

    const svgInner = svgText
      .slice(svgText.indexOf(">") + 1, svgText.lastIndexOf("</svg>"));

    const svgNode: HtmlNode = {
      tag: "svg",
      class: "svg-wrapper",
      style: svgAttrs.style,
      attributes: svgAttrs,
      text: svgInner,
      children: [],
      _key: node._key,
    };

    return svgNode;
  };

  return Promise.all(nodes.map(processNode));
}