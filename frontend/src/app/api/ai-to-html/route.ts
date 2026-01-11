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

async function generateHtmlNodesFromFigma(
  figma: FigmaExport,
): Promise<HtmlNode[]> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const payload = {
    structure: figma.structure,
    designTokens: figma.designTokens,
  };

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
  "_key": "уникальный ключ-идентификатор",
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

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // проверь точное имя модели в консоли Groq
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("Groq API error:", err);
    throw new Error("Groq API error");
  }

  const data = await response.json();

  const text: string =
    data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";

  let parsed: HtmlNode[];
  console.log("=== Groq raw text ===", text);
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");

  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Groq JSON:", e, cleaned);
    throw new Error("Groq returned invalid JSON");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Groq output is not an array");
  }

  return parsed;
}
