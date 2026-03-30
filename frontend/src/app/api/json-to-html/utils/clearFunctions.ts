import defaults from "@/app/api/json-to-html/utils/default";
import { DOMParser as XmldomParser } from "xmldom";

const { selfClosingTags, SERVICE_TEXTS } = defaults;

// === HTML ===
function buildAttrs(node) {
  const { class: cls, attributes = {} } = node;
  const attrs: string[] = [];

  if (cls) attrs.push(`class="${cls}"`);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null) return;
    // разрешаем пустые строки для булевых атрибутов (controls, playsinline и т.д.)
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

// === Simple Icons (cdn.simpleicons.org) ===
function getSimpleIconNameFromSrc(src: string): string | null {
  // https://cdn.simpleicons.org/github        → "github"
  // https://cdn.simpleicons.org/github/white  → "github"
  try {
    const url = new URL(src);
    if (!url.hostname.includes("simpleicons.org")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchSimpleIconSvg(name: string): Promise<string | null> {
  const url = `https://cdn.simpleicons.org/${name}`;
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
    style: (baseNode.style || "") + " overflow: visible;",
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

      // --- Heroicons ---
      const heroFileName = getIconNameFromSrc(src);
      if (heroFileName) {
        const svgText = await fetchHeroiconSvgByFileName(heroFileName);
        if (svgText) {
          transformed = svgTextToProjectNode(svgText, node);
        }
      }
      // Simple Icons обрабатываются клиентским скриптом (см. buildJs)
    }

    result.push(transformed);
  }

  return result;
}

// === синхронный обход дерева → HTML ===
function parseHtmlSync(nodes: any[]): string {
  let html = "";

  nodes.forEach((node) => {
    if (!node || !node.tag || node.tag === "style" || node.tag === "script") return;

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
  // Группируем по селектору — всех детей объединяем в один массив,
  // чтобы buildScss рекурсивно дедуплицировал их
  const selectorMap = new Map<string, { styleStr: string; allChildren: any[] }>();

  nodes.forEach((node) => {
    if (!node || !node.tag || node.tag === "style" || node.tag === "script") return;

    const rawCls = typeof node.class === "string" ? node.class.trim() : "";
    const styleStr = (node.style || "").trim();

    const currentSelector = rawCls
      ? "." + rawCls.split(/\s+/).join(".")
      : node.tag;

    if (!selectorMap.has(currentSelector)) {
      selectorMap.set(currentSelector, { styleStr, allChildren: [] });
    }

    const entry = selectorMap.get(currentSelector)!;
    // собираем детей всех узлов с одинаковым селектором
    if (Array.isArray(node.children) && node.children.length > 0) {
      entry.allChildren.push(...node.children);
    }
  });

  // Эмитируем один блок на уникальный селектор
  selectorMap.forEach(({ styleStr, allChildren }, selector) => {
    // рекурсивно строим SCSS из объединённого пула детей
    const mergedChildren = allChildren.length > 0 ? buildScss(allChildren) : "";
    if (styleStr) {
      resSCSS += `${selector} { ${styleStr} ${mergedChildren} }`;
    } else if (mergedChildren) {
      resSCSS += mergedChildren;
    }
  });

  return resSCSS;
};

// === JS ===

// Проверяет, есть ли в дереве хоть один img.social-img
function hasSocialImg(nodes: any[]): boolean {
  for (const node of nodes) {
    if (node?.tag === "img" && node?.class?.includes("social-img")) return true;
    if (Array.isArray(node?.children) && hasSocialImg(node.children)) return true;
  }
  return false;
}

const SOCIAL_IMG_SCRIPT = `/* @component: .social-img */
(function () {
  function replaceSocialIcons() {
    document.querySelectorAll("img.social-img").forEach(async function (img) {
      const src = img.getAttribute("src");
      if (!src) return;
      try {
        const res = await fetch(src);
        if (!res.ok) return;
        const svgText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;
        svg.setAttribute("class", img.className);
        svg.setAttribute("fill", "currentColor");
        const style = img.getAttribute("style");
        if (style) svg.setAttribute("style", style);
        img.parentNode.replaceChild(svg, img);
      } catch (e) {
        console.warn("social-img: failed to load", src, e);
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", replaceSocialIcons);
  } else {
    replaceSocialIcons();
  }
})();
`;

// рекурсивный сбор <script> тегов без побочных эффектов
function collectJs(nodes: any[]): string {
  let resJS = "";
  nodes.forEach((node) => {
    if (!node || !node.tag) return;
    if (node.tag === "script") {
      resJS += (node.text || "") + "\n";
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      resJS += collectJs(node.children);
    }
  });
  return resJS;
}

const buildJs = (nodes: any[]): string => {
  // сначала собираем весь JS из дерева
  const resJS = collectJs(nodes);
  // проверяем маркер один раз — против полного накопленного JS
  if (hasSocialImg(nodes) && !resJS.includes("/* @component: .social-img */")) {
    return resJS + SOCIAL_IMG_SCRIPT;
  }
  return resJS;
};

const clearFunctions = {
  parseHtml,
  buildScss,
  buildJs,
};

export default clearFunctions;


