// app/api/html-to-json/route.ts
import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import sass from "sass";
import postcss from "postcss";
import type { HtmlNode } from "@/types/HtmlNode";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const maxDuration = 30;

/**
 * Локально: HTML + CSS → HtmlNode[]
 */
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
        if (t.trim()) {
          text += t;
        }
        return;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const childNode = walk(child);
        if (childNode) children.push(childNode);
      }
    });

    return {
      tag,
      text,
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

/**
 * Вызов Groq с ретраями при 429
 */
async function callGroqWithRetry(
  body: any,
  maxRetries = 2,
  baseDelayMs = 2000,
) {
  let attempt = 0;

  while (true) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status !== 429 || attempt >= maxRetries) {
      return res;
    }

    attempt += 1;
    const delay = baseDelayMs * attempt;
    console.warn(`Groq 429, retry ${attempt}/${maxRetries} in ${delay}ms`);
    await new Promise((r) => setTimeout(r, delay));
  }
}

/**
 * Опциональная доработка дерева через Groq
 */
async function enhanceWithGroq(nodes: HtmlNode[]): Promise<HtmlNode[]> {
  if (!GROQ_API_KEY) return nodes;

  const systemPrompt = `
Ты помощник для нормализации HTML-деревьев.
Вход: JSON-массив HtmlNode.
Задача: при необходимости слегка подчистить структуру (убрать пустые стили, пробельный текст и т.п.).
Всегда возвращай только корректный JSON-массив того же формата, без комментариев и пояснений.
`.trim();

  const userPrompt = JSON.stringify(nodes);

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
  };

  const response = await callGroqWithRetry(body, 2, 2000);

  if (!response.ok) {
    const status = response.status;
    const errBody = await response.text();
    console.error("Groq API error status:", status);
    console.error("Groq API error body:", errBody);
    return nodes;
  }

  const json = await response.json();
  const rawContent =
    (json.choices &&
      json.choices[0] &&
      json.choices[0].message?.content?.trim()) ||
    "";

  const content = rawContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as HtmlNode[];
    }
    console.warn("Groq returned non-array JSON, fallback to original nodes");
    return nodes;
  } catch (e) {
    console.error("Groq JSON parse error:", e);
    console.error("Groq raw content:", rawContent);
    return nodes;
  }
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

    const htmlNodes = await applyCssToDom(html, css);
    const enhanced = await enhanceWithGroq(htmlNodes);

    return NextResponse.json({ htmlJson: enhanced });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("html-to-json error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
