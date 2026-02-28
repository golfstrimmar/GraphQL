import defaults from "@/app/api/json-to-html/utils/default";
import { DOMParser as XmldomParser } from "xmldom";

const { selfClosingTags, SERVICE_TEXTS } = defaults;

// === HTML ===
function buildAttrs(node) {
  const { class: cls, attributes = {} } = node;
  const attrs: string[] = [];

  if (cls) attrs.push(`class="${cls}"`);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === "") return;
    // не пропускаем style по ключу, стиль у тебя лежит отдельно в node.style
    attrs.push(`${key}="${String(value)}"`);
  });

  return attrs.length ? " " + attrs.join(" ") : "";
}

function cleanServiceText(raw: string): string {
  if (!raw) return "";
  let text = raw;
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);
  sorted.forEach((word) => {
    const pattern = word.replace(/\s+/g, "\\s+");
    const re = new RegExp(`^\\s*${pattern}\\s*$`, "i");
    if (re.test(text)) text = "";
  });

  return text;
}

// === IMG → SVG ===
function getIconNameFromSrc(src: string): string | null {
  try {
    const url = new URL(src);
    const pathname = url.pathname;
    if (!pathname.endsWith(".svg")) return null;
    const last24Index = pathname.lastIndexOf("/24/");
    if (last24Index === -1) return null;
    const iconPath = pathname.substring(last24Index + 4);
    return iconPath;
  } catch {
    return null;
  }
}

async function fetchHeroiconSvgByFileName(
  fileName: string,
): Promise<string | null> {
  const url = `https://cdn.jsdelivr.net/npm/heroicons@latest/24/${fileName}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.text();
}

function svgTextToProjectNode(svgText: string, baseNode: any): any {
  const parser = new XmldomParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.getElementsByTagName("svg")[0];
  if (!svgEl) return baseNode;

  const svgAttrs: Record<string, string> = {};
  for (let i = 0; i < svgEl.attributes.length; i++) {
    const attr = svgEl.attributes.item(i);
    if (!attr) continue;
    svgAttrs[attr.name] = attr.value;
  }

  const children: any[] = [];
  for (let i = 0; i < svgEl.childNodes.length; i++) {
    const node = svgEl.childNodes.item(i);
    if (node.nodeType !== 1) continue;
    const el = node as any;

    const childAttrs: Record<string, string> = {};
    for (let j = 0; j < el.attributes.length; j++) {
      const attr = el.attributes.item(j);
      if (!attr) continue;
      childAttrs[attr.name] = attr.value;
    }

    children.push({
      tag: el.tagName,
      text: "",
      class: "",
      style: "",
      attributes: childAttrs,
      children: [],
    });
  }

  return {
    tag: "svg",
    text: "",
    class: baseNode.class || "svg-icon",
    style: baseNode.style || "",
    attributes: {
      ...svgAttrs,
      stroke: "currentColor",
    },
    children,
  };
}

async function transformIconsBySrc(nodes: any[]): Promise<any[]> {
  const result: any[] = [];

  for (const node of nodes) {
    let transformed = { ...node };

    if (node.children && Array.isArray(node.children)) {
      transformed.children = await transformIconsBySrc(node.children);
    }

    if (node.tag === "img" && node.attributes?.src) {
      const src = String(node.attributes.src);
      const fileName = getIconNameFromSrc(src);
      if (fileName) {
        const svgText = await fetchHeroiconSvgByFileName(fileName);
        if (svgText) {
          transformed = svgTextToProjectNode(svgText, node);
        }
      }
    }

    result.push(transformed);
  }

  return result;
}

// === синхронный обход дерева → HTML ===
function parseHtmlSync(nodes: any[]): string {
  let html = "";

  nodes.forEach((node) => {
    if (!node || !node.tag || node.tag === "style") return;

    const { tag, text, children = [] } = node;
    const attrsStr = buildAttrs(node);
    const cleanedText = cleanServiceText(text || "");

    let childHtml = "";
    if (Array.isArray(children) && children.length > 0) {
      childHtml = parseHtmlSync(children);
    }

    const lowerTag = String(tag).toLowerCase();
    let htmlItem: string;

    if (selfClosingTags.has(lowerTag)) {
      htmlItem = `<${tag}${attrsStr}/>`;
    } else {
      htmlItem = `<${tag}${attrsStr}>${cleanedText}${childHtml}</${tag}>`;
    }

    html += htmlItem;
  });

  return html;
}

// публичная функция: сначала асинхронный transform, потом синхронный parse
const parseHtml = async (nodes: any[]): Promise<string> => {
  const transformedNodes = await transformIconsBySrc(nodes);
  return parseHtmlSync(transformedNodes);
};

// === SCSS ===
const buildScss = (nodes: any[]): string => {
  let resSCSS = "";

  // 1) вытаскиваем текст из <style> тегов
  const styleTags = nodes.filter((node) => node.tag === "style");
  if (styleTags.length > 0) {
    styleTags.forEach((styleTag) => {
      const styleContent = styleTag.text || "";
      resSCSS += styleContent;
    });
  }

  // 2) inline style + вложенность
  nodes.forEach((node) => {
    if (!node || !node.tag) return;

    const cls = node.class;
    const styleStr = node.style || "";
    const tag = node.tag;

    const currentSelector = cls ? `.${cls}` : tag;

    const childrenScss =
      Array.isArray(node.children) && node.children.length > 0
        ? buildScss(node.children)
        : "";

    let blockBody = "";
    if (styleStr) blockBody += styleStr;
    if (childrenScss) blockBody += childrenScss;

    if (blockBody) {
      resSCSS += `${currentSelector}{${blockBody}}`;
    }
  });

  return resSCSS;
};

const clearFunctions = {
  parseHtml,
  buildScss,
};

export default clearFunctions;
