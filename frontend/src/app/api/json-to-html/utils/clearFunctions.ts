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
async function buildScssFromHtml(html: string): Promise<{
  html: string;
  scss: string;
}> {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const baseLines: string[] = [];
  const modLines: string[] = [];

  const isModifierSelector = (sel: string) =>
    sel.includes("._filled") || sel.includes(".isolate-");

  const pushLine = (selector: string, content: string, depth: number) => {
    const indent = "  ".repeat(depth);
    const target = isModifierSelector(selector) ? modLines : baseLines;
    content
      .split("\n")
      .forEach((line) => target.push(indent + line));
  };

  const walk = (el: HTMLElement, depth = 0) => {
    const className = el.getAttribute("class");
    const dataKey = el.getAttribute("data-key");
    const styleAttr = el.getAttribute("style");

    const selector = className
      ? `.${className.split(" ").join(".")}`
      : dataKey
        ? `${el.tagName.toLowerCase()}[data-key="${dataKey}"]`
        : el.tagName.toLowerCase();

    // открываем блок
    pushLine(selector, `${selector} {`, depth);

    if (styleAttr && styleAttr.trim()) {
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
      el.removeAttribute("style");
    }

    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => walk(child, depth + 1));

    // закрываем блок
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
  const rawHtml = parseHtml(nodes);
  const { html, scss } = await buildScssFromHtml(rawHtml);
  const js = await buildJs(nodes);
  return { html, scss, js };
}

export default runClearPipeline;