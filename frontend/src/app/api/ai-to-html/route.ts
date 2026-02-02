// app/api/figma-section-to-html/route.ts
import { NextRequest, NextResponse } from "next/server";

import type { HtmlNode } from "@/types/HtmlNode";

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  characters?: string;

  style?: {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
    textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
    fills?: Array<{
      type: string;
      color?: { r: number; g: number; b: number; a: number };
    }>;
  };

  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;

  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

type SectionNode = {
  id: string;
  name: string;
  type: string;
  children?: SectionNode[];
  characters?: string;
  style?: FigmaNode["style"];
  box?: FigmaNode["absoluteBoundingBox"];
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const maxDuration = 30;

// ===== HTTP handler =====
export async function POST(req: NextRequest) {
  console.log("🔹  → HTML started");

  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const figmaJson = await req.json();
    const root = figmaJson.document || figmaJson.structure || figmaJson;

    if (!root) {
      return NextResponse.json(
        { nodes: [], message: "No root node in Figma JSON" },
        { status: 200 },
      );
    }

    // 1) Находим нужную ноду по id
    const targetId = "986:2714";
    const section = findNodeById(root, targetId);
    if (!section) {
      return NextResponse.json(
        { nodes: [], message: `Node ${targetId} not found` },
        { status: 200 },
      );
    }

    console.log("Using section:", section.name, section.id);

    // 2) Упрощаем только эту секцию (с текстами и стилями)
    const compact = compactSection(section);

    // 3) Гоним компактную секцию в Groq
    const htmlNodes = await callGroqWithSection(compact);

    return NextResponse.json(
      {
        nodes: htmlNodes,
        count: htmlNodes.length,
        message: `Generated ${htmlNodes.length} HtmlNode from section ${targetId}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("figma-section-to-html error", error);
    return NextResponse.json(
      { error: "Failed to generate HTML from section" },
      { status: 500 },
    );
  }
}

// ===== helpers =====

// Рекурсивный поиск ноды по id
function findNodeById(node: FigmaNode, id: string): FigmaNode | null {
  if (!node || typeof node !== "object") return null;
  if (node.id === id) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  return null;
}

// Упрощаем секцию: только структура + тексты + базовые стили
function compactSection(node: FigmaNode): SectionNode {
  const compact: SectionNode = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.characters?.trim()) {
    compact.characters = node.characters.trim();
  }

  if (node.style) {
    compact.style = {
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      lineHeightPx: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
      textAlignHorizontal: node.style.textAlignHorizontal,
      textAlignVertical: node.style.textAlignVertical,
      fills: node.style.fills,
    };
  }

  if (node.absoluteBoundingBox) {
    compact.box = node.absoluteBoundingBox;
  }

  if (node.children && node.children.length) {
    compact.children = node.children.map(compactSection);
  }

  return compact;
}

// Вызов Groq по одной секции
async function callGroqWithSection(section: SectionNode): Promise<HtmlNode[]> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `
Ты помощник, который по фрагменту Figma-секции (type/name/children/characters/style/box)
создаёт HTML-структуру блока с карточками.

Входной JSON описывает одну секцию:
- type: FRAME/GROUP/TEXT/RECTANGLE и т.п.
- name: название ноды (может подсказать тип блока/карточки)
- characters: текст (если это текстовая нода)
- style: базовые текстовые стили (fontSize, fontWeight, textAlignHorizontal, fills)
- box: absoluteBoundingBox (x/y/width/height), чтобы понимать порядок/колонки
- children: вложенные ноды.

Нужно вернуть массив HtmlNode (JSON):
[
  {
    "tag": "section" | "div" | "header" | "footer" | "main" | "article" | "aside" |
            "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "li" | "button" | "a" | "span",
    "text": "строка текста",
    "class": "строка css-классов (может быть пустой)",
    "style": "строка inline-стилей (может быть пустой)",
    "children": [ ... HtmlNode ... ]
  }
]

ТРЕБОВАНИЯ:
- Верни ТОЛЬКО JSON-массив (без комментариев, без Markdown).
- Сохраняй смысл оригинального текста (characters).
- Используй name/type/box, чтобы понять где карточка, где заголовок, где список.
- Можно немного упрощать структуру (меньше вложенности, чем в Figma), но не терять ключевые тексты.
- class и style можешь генерировать свободно (card, card-title, card-body и т.п.).
`.trim();

  const userPrompt = `

Сгенерируй HtmlNode[] по правилам выше.
986:2714
SECTION:
${JSON.stringify(section)}
`.trim();

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
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
    const errText = await response.text();
    console.error("Groq API error status:", response.status);
    console.error("Groq API error body:", errText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();

  const text: string =
    data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";

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
    return [];
  }

  if (!Array.isArray(parsed)) parsed = [parsed];

  return parsed as HtmlNode[];
}
