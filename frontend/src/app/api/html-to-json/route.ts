// app/api/html-to-json/route.ts
import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import sass from "sass";
import postcss from "postcss";

export type HtmlNode = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: HtmlNode[] | string;
};

// 🔹 утилита: HTML + CSS → HtmlNode[]
async function applyCssToDom(html: string, css: string): Promise<HtmlNode[]> {
  const dom = new JSDOM(html);
  const { document, Node } = dom.window;

  const root = postcss.parse(css);

  const styleMap = new Map<Element, string>();

  root.walkRules((rule) => {
    const selector = rule.selector;
    if (!selector) return;

    const decls: string[] = [];
    rule.walkDecls((decl) => {
      decls.push(`${decl.prop}: ${decl.value};`);
    });
    const styleString = decls.join(" ");

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const prev = styleMap.get(el) ?? "";
      styleMap.set(el, `${prev} ${styleString}`.trim());
    });
  });

  const walk = (node: globalThis.Node): HtmlNode | null => {
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    const cls = el.getAttribute("class")?.trim() ?? "";
    const inlineStyle = el.getAttribute("style")?.trim() ?? "";
    const cssStyle = styleMap.get(el) ?? "";

    const mergedStyle = [cssStyle, inlineStyle]
      .filter(Boolean)
      .join(" ")
      .trim();

    const attributes: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === "class" || attr.name === "style") continue;
      attributes[attr.name] = attr.value;
    }

    let text = "";
    const children: HtmlNode[] = [];

    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent ?? "";
        // не создаём отдельный узел, просто копим текст
        text += t;
        return;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const childNode = walk(child);
        if (childNode) children.push(childNode);
      }
    });

    return {
      tag,
      text, // здесь весь текст внутри тега
      class: cls,
      style: mergedStyle,
      attributes: Object.keys(attributes).length ? attributes : undefined,
      _key: crypto.randomUUID(),
      children,
    };
  };

  const result: HtmlNode[] = [];
  document.body.childNodes.forEach((n) => {
    const node = walk(n);
    if (node) result.push(node);
  });

  return result;
}

// 🔹 сам роут
export async function POST(request: Request) {
  try {
    const { html, scss } = (await request.json()) as {
      html: string;
      scss: string;
    };

    if (typeof html !== "string" || typeof scss !== "string") {
      return NextResponse.json(
        { error: "`html` и `scss` должны быть строками" },
        { status: 400 },
      );
    }

    const css = sass.compileString(scss).css;
    console.log("<=✨✨✨====css===>", css);
    const htmlJson = await applyCssToDom(html, css);

    return NextResponse.json({ htmlJson });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
