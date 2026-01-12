// app/api/figma-to-html/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { HtmlNode } from "@/types/HtmlNode";

type FigmaExport = {
  metadata: any;
  designTokens: any;
  structure: any;
  summary: any;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set in environment variables");
}

export const maxDuration = 30;

// ----🔹🟢------
export async function POST(req: NextRequest) {
  try {
    const figmaJson = (await req.json()) as FigmaExport;

    const nodes = await generateHtmlNodesFromFigma(figmaJson);

    return NextResponse.json({ nodes }, { status: 200 });
  } catch (error) {
    console.error("figma-to-html error", error);
    return NextResponse.json(
      { error: "Failed to generate HTML structure" },
      { status: 500 },
    );
  }
}
// ===  упрощение дерева без картинок ===
function slimNode(node: any): SlimNode | null {
  const imageLikeTypes = ["VECTOR", "ELLIPSE", "RECTANGLE", "IMAGE"];

  if (imageLikeTypes.includes(node.type)) {
    return null;
  }

  const children = node.children?.map(slimNode).filter(Boolean) ?? [];

  const isText = node.type === "TEXT";
  const isFrameLike = ["FRAME", "GROUP", "COMPONENT", "INSTANCE"].includes(
    node.type,
  );

  if (!isText && !children.length) {
    return null;
  }

  const res: SlimNode = {
    name: node.name,
    type: node.type,
  };

  if (isText) {
    res.content = node.content;
    res.styles = {
      text: {
        size: node.styles?.text?.size,
      },
    };
  }

  if (isFrameLike) {
    res.size = node.size;
  }

  if (children.length) {
    res.children = children;
  }

  return res;
}

// ===  нарезка по верхним children ===
function chunkChildren(root: SlimNode, maxChildrenPerChunk = 8): SlimNode[] {
  const children = root.children ?? [];
  if (!children.length) return [root];

  const chunks: SlimNode[] = [];

  for (let i = 0; i < children.length; i += maxChildrenPerChunk) {
    chunks.push({
      ...root,
      children: children.slice(i, i + maxChildrenPerChunk),
    });
  }

  return chunks;
}

// ===  вынесен один вызов Groq  ===
async function callGroq(payload: {
  structure: any;
  designTokens: any;
}): Promise<HtmlNode[]> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const systemPrompt = `
Ты помощник для генерации черновой структуры веб-страницы из Figma JSON.

Твоя задача: анализировать JSON-структуру одного фрейма Figma (structure + designTokens)
и возвращать массив HtmlNode, описывающих HTML-структуру для этого фрейма.

ФОРМАТ HtmlNode:
{
  "tag": "section" | "div" | "header" | "footer" | "main" | "article" | "aside" |
          "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "li" | "button" | "a" | "span",
  "text": "строка текста или пустая строка",
  "class": "строка css-классов (может быть пустой)",
  "style": "строка inline-стилей (может быть пустой)",

  "attributes": { "href": "...", "id": "..." }, // необязательно
  "children": [ ...HtmlNode... ] // массив таких же объектов
}

ТРЕБОВАНИЯ:
- Верни ТОЛЬКО JSON-массив HtmlNode (без комментариев, лишнего текста и оберток).
- Не добавляй никаких других полей, кроме перечисленных.
- Не используй children как строку, только массив HtmlNode.
- Структура должна быть семантичной (заголовки → h1/h2/h3, текст → p, логичные section/article).
- Опирайся на размеры текста (designTokens, свойства size) и контент, чтобы выбирать теги и иерархию.
- Используй классы в духе BEM (например, "benefits", "benefits__header", "benefit-card", "benefit-card__title").
`;

  const userPrompt = `
Вот Figma JSON фрейма. Сгенерируй черновую структуру HtmlNode[] по правилам выше.

Figma JSON:
${JSON.stringify(payload, null, 2)}
`;

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
  };

  let attempt = 0;
  const maxRetries = 1;

  while (true) {
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
      const errText = await response.text();
      console.error("Groq API error status:", response.status);
      console.error("Groq API error body:", errText);

      if (response.status === 429 && attempt < maxRetries) {
        attempt += 1;
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    const text: string =
      data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";

    console.log("=== Groq raw text ===", text);

    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Groq JSON:", e, cleaned);
      // не валим весь запрос, а возвращаем пустой результат для этого чанка
      return [];
    }

    // если это один объект, а не массив — оборачиваем
    if (!Array.isArray(parsed)) {
      console.warn("Groq output is not an array, wrapping into array");
      parsed = [parsed];
    }

    return parsed as HtmlNode[];
  }
}

// ===  ===
async function generateHtmlNodesFromFigma(
  figma: FigmaExport,
): Promise<HtmlNode[]> {
  // 1) упрощаем figma.structure (без картинок)
  const slimRoot = slimNode(figma.structure);
  if (!slimRoot) return [];

  // 2) режем по верхним children
  const chunks = chunkChildren(slimRoot, 8);

  const allNodes: HtmlNode[] = [];

  // 3) для каждого чанка делаем ТОТ ЖЕ вызов Groq
  for (const chunk of chunks) {
    const payload = {
      structure: chunk,
      designTokens: figma.designTokens,
    };

    const nodes = await callGroq(payload);
    allNodes.push(...nodes);
  }

  // 4) возвращаем один плоский массив
  return allNodes;
}
