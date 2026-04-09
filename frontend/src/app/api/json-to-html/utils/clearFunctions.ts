import { DOMParser as XmldomParser } from "xmldom";
import { JSDOM } from "jsdom";

import defaults from "@/app/api/json-to-html/utils/default";
const { selfClosingTags, SERVICE_TEXTS } = defaults;

type HtmlNode = {
  tag: string;
  class?: string;
  style?: string;
  _key?: string;
  text?: string;
  children?: HtmlNode[];
  attributes?: Record<string, string>;
};
function collectExistingClasses(nodes: HtmlNode[]): Set<string> {
  const set = new Set<string>();

  const walk = (list: HtmlNode[]) => {
    list.forEach((node) => {
      if (node.class) {
        node.class
          .split(" ")
          .map((c) => c.trim())
          .filter((c) => c.startsWith("_")) // только модификаторы
          .forEach((c) => set.add(c));
      }
      if (node.children && node.children.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);
  return set;
}
async function inlineSvgIcons(nodes: HtmlNode[]): Promise<HtmlNode[]> {
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

function parseHtml(nodes: HtmlNode[]): string {
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
// 2) сырой html → очищенный html + scss (иерархия = DOM)
function stripMarkerBlock(style: string, whiteList: Set<string>): string {
  // ищем маркер начала: /* _something */
  const startMatch = style.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
  if (!startMatch) return style;

  const cls = startMatch[1]; // "_empty"
  if (whiteList.has(cls)) return style; // класс есть — ничего не режем

  const startIndex = startMatch.index!;
  // ищем закрывающий маркер для этого же имени: /* /_something */
  const endRegex = new RegExp(`/\\*\\s*/${cls}\\s*\\*/`);
  const endMatch = style.slice(startIndex).match(endRegex);
  if (!endMatch) {
    // нет закрывающего — на всякий случай вырежем только комментарий начала
    return style.slice(0, startIndex) + style.slice(startIndex + startMatch[0].length);
  }

  const endIndex = startIndex + endMatch.index! + endMatch[0].length;

  // вырезаем блок целиком: от начала маркера до конца закрывающего
  const before = style.slice(0, startIndex);
  const after = style.slice(endIndex);
  return (before + after).trim();
}
async function buildScssFromHtml(
  html: string,
  whiteList: Set<string>
): Promise<{ html: string; scss: string }> {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const baseLines: string[] = [];
  const modLines: string[] = [];

  const isModifierSelector = (sel: string) =>
    sel.includes("._filled") || sel.includes(".isolate-");

  const pushLine = (selector: string, content: string, depth: number) => {
    const indent = "  ".repeat(depth);
    const target = isModifierSelector(selector) ? modLines : baseLines;
    content.split("\n").forEach((line) => target.push(indent + line));
  };

  const walk = (el: HTMLElement, depth = 0) => {
    const className = el.getAttribute("class");
    const dataKey = el.getAttribute("data-key");
    let styleAttr = el.getAttribute("style") || "";

    const selector = className
      ? `.${className.split(" ").join(".")}`
      : dataKey
        ? `${el.tagName.toLowerCase()}[data-key="${dataKey}"]`
        : el.tagName.toLowerCase();

    pushLine(selector, `${selector} {`, depth);

    if (styleAttr.trim()) {
      // сначала вырежем маркерный блок, если его класс не в whiteList
      styleAttr = stripMarkerBlock(styleAttr, whiteList);

      if (styleAttr.trim()) {
        const hasComplex = /[&{}]/.test(styleAttr);
        if (hasComplex) {
          pushLine(selector, styleAttr.trim(), depth + 1);
        } else {
          const styleBody = styleAttr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((rule) => `${rule};`)
            .join("\n");
          if (styleBody) pushLine(selector, styleBody, depth + 1);
        }
      }

      el.removeAttribute("style");
    }

    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => walk(child, depth + 1));

    pushLine(selector, "}", depth);
  };

  const rootChildren = Array.from(document.body.children) as HTMLElement[];
  rootChildren.forEach((child) => walk(child, 0));

  const cleanedHtml = document.body.innerHTML;
  const scss = [...baseLines, "", ...modLines].join("\n");

  return { html: cleanedHtml, scss };
}

// 3) дерево → js (скрипты с @component, без дубликатов)
async function buildJs(nodes: HtmlNode[]): Promise<string> {
  const scripts: string[] = [];

  const walk = (list: HtmlNode[]) => {
    list.forEach((node) => {
      if (node.tag === "script" && node.text && node.text.trim()) {
        const raw = node.text.trim();

        // режем только компонентные комменты, оставляем чистый код
        const lines = raw.split("\n").map((l) => l.trim());
        const codeLines = lines.filter(
          (l) => !l.startsWith("/* @component:")
        );

        const jsCode = codeLines.join("\n").trim();

        if (jsCode) {
          scripts.push(jsCode);
        }
      }

      if (node.children && node.children.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);

  const uniqueScripts = Array.from(new Set(scripts));

  return uniqueScripts.join("\n\n");
}

// ЕДИНАЯ точка входа: нефть → бензин/керосин/мазут
async function runClearPipeline(nodes: HtmlNode[]): Promise<{
  html: string;
  scss: string;
  js: string;
}> {
  const set = collectExistingClasses(nodes);
  console.log("<=♻️♻️♻️=set=♻️♻️♻️==>", set);
  const withInlineSvg = await inlineSvgIcons(nodes);   // img → svg
  const rawHtml = parseHtml(withInlineSvg);
  const { html, scss } = await buildScssFromHtml(rawHtml, set);
  const js = await buildJs(nodes);
  return { html, scss, js };
}

export default runClearPipeline;