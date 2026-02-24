import { NextResponse } from "next/server";
import { DOMParser as XmldomParser } from "xmldom";
import defaults from "@/app/api/json-to-html/utils/default";

const { selfClosingTags, SERVICE_TEXTS } = defaults;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// === ICONS: img[src] -> inline SVG =======================

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

// === UTILS ==================================================

function normalizeClasses(cls?: string): string[] {
  if (!cls) return [];
  return cls
    .split(/\s+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function buildAttrs(node: any) {
  const attrs = [];
  if (node.class && node.class.trim())
    attrs.push(`class="${node.class.trim()}"`);
  if (node.attributes && typeof node.attributes === "object") {
    for (const [key, value] of Object.entries(node.attributes)) {
      attrs.push(`${key}="${String(value).replace(/"/g, "&quot;")}"`);
    }
  }
  return attrs.length ? " " + attrs.join(" ") : "";
}

function getScssSelector(node: any) {
  const nodeClasses = normalizeClasses(node.class);
  if (nodeClasses.length) return "." + nodeClasses.join(".");
  return node.tag || "div";
}

function cleanServiceText(raw: string): string {
  let text = raw;
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);
  sorted.forEach((word) => {
    const pattern = word.replace(/\s+/g, "\\s+");
    const re = new RegExp(`^\\s*${pattern}\\s*$`, "i");
    if (re.test(text)) text = "";
  });
  return text;
}

function attrsToPug(node: any) {
  const parts: string[] = [];
  if (node.attributes && typeof node.attributes === "object") {
    for (const [key, value] of Object.entries(node.attributes)) {
      parts.push(`${key}="${String(value).replace(/"/g, "'")}"`);
    }
  }
  return parts.length ? `(${parts.join(" ")})` : "";
}

function toPug(nodes: any[], indent = ""): string {
  return nodes
    .map((node) => {
      const { tag, text = "", class: cls = "", children = [] } = node;
      let pugLine = indent + tag;

      if (cls && cls.trim()) {
        pugLine += "." + cls.trim().split(/\s+/).join(".");
      }

      const attrString = attrsToPug(node);
      if (attrString) pugLine += attrString;

      const cleanedText = cleanServiceText(text);
      if (cleanedText.trim()) pugLine += ` ${cleanedText.trim()}`;

      let result = pugLine;

      if (children.length > 0) {
        result += "\n" + toPug(children, indent + "  ");
      }

      return result;
    })
    .join("\n");
}

function stripServiceTexts(html: string): string {
  let out = html;
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);

  sorted.forEach((text) => {
    const pattern = text.replace(/\s+/g, "\\s+");
    const re = new RegExp(`>(\\s*)${pattern}(\\s*)<`, "g");
    out = out.replace(re, ">$1$2<");
  });

  out = out.replace(/>\s+</g, "><").trim();
  return out;
}

function renderNodesAndCollectScss(nodes: any[]): {
  html: string;
  scssBlocks: any[];
  pug: string;
  inlineScss: string;
} {
  let html = "";
  let scssBlocks: any[] = [];
  let pug = "";
  let inlineScss = "";

  nodes.forEach((node) => {
    const {
      tag,
      text = "",
      class: nodeClass = "",
      style = "",
      children = [],
    } = node;

    // special case: <style> — забираем text как SCSS и не рендерим в HTML
    if (tag === "style") {
      if (text && text.trim()) {
        inlineScss += text.trim() + "\n";
      }

      if (children.length > 0) {
        const childRes = renderNodesAndCollectScss(children);
        // html += childRes.html;
        // scssBlocks.push(...childRes.scssBlocks);
        // pug += (pug ? "\n" : "") + childRes.pug;
        inlineScss += childRes.inlineScss;
      }
      return;
    }

    const selector = getScssSelector(node);

    let childHtml = "";
    let childScssBlocks: any[] = [];
    let childInlineScss = "";
    if (children.length > 0) {
      const childRes = renderNodesAndCollectScss(children);
      childHtml = childRes.html;
      childScssBlocks = childRes.scssBlocks;
      childInlineScss = childRes.inlineScss;
    }
    scssBlocks.push({
      selector,
      style: style.trim(),
      children: childScssBlocks,
    });
    const attrsStr = buildAttrs(node);
    const cleanedText = cleanServiceText(text);
    let htmlItem: string;

    if (selfClosingTags.has(String(tag).toLowerCase())) {
      htmlItem = `<${tag}${attrsStr}/>`;
    } else {
      htmlItem = `<${tag}${attrsStr}>${cleanedText}${childHtml}</${tag}>`;
    }

    html += htmlItem;
    html = stripServiceTexts(html);

    const pugNode = toPug([node]);
    pug += (pug ? "\n" : "") + pugNode;

    inlineScss += childInlineScss;
  });

  return { html, scssBlocks, pug: pug.trim(), inlineScss };
}

function scssBlocksToString(blocks: any[], indent = ""): string {
  let out = "";
  blocks.forEach(({ selector, style, children }) => {
    out += `${indent}${selector} {${style ? " " + style : ""}`;
    if (children && children.length > 0) {
      out += "\n" + scssBlocksToString(children, indent + "  ");
      out += indent;
    }
    out += " }\n";
  });
  return out;
}

function normalizeBlock(block: string) {
  return block
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .trim();
}

function collapseOnce(str: string) {
  let out = "";
  let i = 0;
  let prevNorm: string | null = null;

  while (i < str.length) {
    const start = str.indexOf("li", i);
    if (start === -1) {
      out += str.slice(i);
      break;
    }

    out += str.slice(i, start);

    let j = start + 2;
    while (j < str.length && /\s/.test(str[j])) j++;
    if (j >= str.length || str[j] !== "{") {
      out += str.slice(start, j);
      i = j;
      prevNorm = null;
      continue;
    }

    let pos = j;
    let depth = 0;
    while (pos < str.length) {
      const ch = str[pos];
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      pos++;
      if (depth === 0) break;
    }

    let block = str.slice(start, pos);

    const braceIndex = block.indexOf("{");
    const head = block.slice(0, braceIndex + 1);
    const body = block.slice(braceIndex + 1, -1);
    const cleanedBody = removeDuplicateLiBlocks(body);
    block = head + cleanedBody + "}";

    const norm = normalizeBlock(block);

    if (norm !== prevNorm) {
      out += block;
      prevNorm = norm;
    }

    i = pos;
  }

  return out;
}

function removeDuplicateLiBlocks(str: string): string {
  while (true) {
    const next = collapseOnce(str);
    if (next === str) return next;
    str = next;
  }
}

function postFixScss(scss: string) {
  return scss
    .replace(/(&\.)?([a-zA-Z0-9_-]+)\s*\{\s*@extend\s+\.\\2\s*;\s*}/g, "")
    .replace(/&(\.[a-zA-Z0-9_-]+)/g, "$1")
    .replace(/^\s*\.[a-zA-Z0-9_-]+\s*;$/gm, "")
    .trim();
}

// === GROQ ==================================================

async function callGroq(scss: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `
    Ты получаешь ОДИН SCSS-блок вида:

    .selector {
      prop: value;
      ...
    }

    Твоя задача:
    - не менять навание селектора;
    - не добавлять селекторы повторно;
    - не менять структуру селекторов;
    - не объявлять классы через запятую;
    - не объявлять классы по названиям тэга;
    - не добавлять название класса , если его не существует;
    - не добавлять & к вложенным селекторам;
    - только отформатировать: переносы строк и отступы.

    Ответ: только содержимое блока, начиная с ".selector {" и заканчивая "}".
    - убери дублирующиеся правила;
    - в ответе ТОЛЬКО чистый SCSS без комментариев.
  `.trim();

  const userPrompt = `
Вот сырой SCSS. Очисти и отформатируй его по правилам.
- не менять навание селектора;
- не добавлять селекторы повторно;
- не менять структуру селекторов;
- не объявлять классы через запятую;
- не объявлять классы по названиям тэга;
- не добавлять название класса , если его не существует;
- не добавлять & к вложенным селекторам;
- только отформатировать: переносы строк и отступы.
SCSS:
${scss}
  `.trim();

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
  };

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Groq API error status:", response.status);
    console.error("Groq API error body:", errBody);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const json = await response.json();
  const cleaned = json.choices?.[0]?.message?.content?.trim() ?? "";
  return cleaned;
}

// === ROUTE =================================================

export async function POST(request: Request) {
  try {
    const body = await request.json(); // htmlJson
    const nodes = body || [];

    const transformedNodes = await transformIconsBySrc(nodes);

    const { html, scssBlocks, pug, inlineScss } =
      renderNodesAndCollectScss(transformedNodes);

    const rawScssBlocks = removeDuplicateLiBlocks(
      scssBlocksToString(scssBlocks),
    );

    // style-тэги -> inlineScss, style-поля нод -> rawScssBlocks
    const rawScss = (inlineScss ? inlineScss + "\n" : "") + rawScssBlocks;

    let finalScss = rawScss;
    // если захочешь чистить через Groq — раскомментируй:
    // if (GROQ_API_KEY && rawScss && rawScss.trim()) {
    //   const cleanedByGroq = await callGroq(rawScss);
    //   finalScss = postFixScss(cleanedByGroq || rawScss);
    // } else {
    //   finalScss = postFixScss(rawScss);
    // }

    return NextResponse.json({
      html,
      scss: finalScss,
      pug,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
