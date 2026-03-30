import { NextRequest, NextResponse } from "next/server";
import { themeManifests } from "@/app/plaza/utils/themeManifests";
import type { HtmlNode } from "@/types/HtmlNode";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; // Оптимально для 2026 года
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Собирает объект свойств в чистую CSS-строку.
 * Гарантирует отсутствие вложенности и селекторов.
 */
function serializeProperties(properties: Record<string, string>): string {
  return Object.entries(properties)
    .filter(([key, value]) => {
        // Жесткий фильтр: ключ — это CSS свойство, а не селектор
        return key && value && !/[{}.#]/.test(key) && typeof value === 'string';
    })
    .map(([key, value]) => `${key.trim()}: ${value.trim()}`)
    .join("; ");
}

/**
 * Парсит текущую строку стиля в объект для удобного мерджа.
 */
function parseStyle(styleStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!styleStr) return result;
    styleStr.split(";").forEach(s => {
        const parts = s.split(":");
        if (parts.length === 2) {
            const k = parts[0].trim();
            const v = parts[1].trim();
            if (k && v) result[k] = v;
        }
    });
    return result;
}

/**
 * Умное слияние стилей.
 * Теперь принимает карту объектов: { _key: { color: "#000", ... } }
 */
function applyStylesToOriginal(originalNodes: HtmlNode[], styleMap: Record<string, any>): HtmlNode[] {
  return originalNodes.map(node => {
    const newNode = { ...node };
    if (node._key && styleMap[node._key]) {
      const aiProps = styleMap[node._key];
      
      if (typeof aiProps === 'object' && aiProps !== null) {
        // Берем текущие стили (раскладка, позиционирование)
        const currentStyles = parseStyle(node.style || "");
        
        // Вливаем изменения от ИИ (цвета, шрифты)
        const merged = { ...currentStyles, ...aiProps };
        
        // Превращаем обратно в чистый CSS
        newNode.style = serializeProperties(merged);
      }
    }
    
    if (Array.isArray(newNode.children)) {
      newNode.children = applyStylesToOriginal(newNode.children, styleMap);
    }
    return newNode;
  });
}

function getSkeleton(nodes: HtmlNode[]): any[] {
  return nodes.map(node => ({
    _key: node._key,
    tag: node.tag,
    class: node.class || "",
    style: node.style || "", // ТЕПЕРЬ ОТПРАВЛЯЕМ ТЕКУЩИЕ СТИЛИ (Важно!)
    text: typeof node.text === 'string' ? node.text.substring(0, 30) : "",
    children: Array.isArray(node.children) ? getSkeleton(node.children) : undefined
  }));
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "API key missing" }, { status: 500 });
  }

  try {
    const { htmlJson, themeName } = await req.json();
    const theme = themeManifests[themeName] || themeManifests["Commerce"];
    const architecture = getSkeleton(htmlJson);

    const systemPrompt = `
You are a HIGH-PRECISION Layout Style Harmonizer. Theme: "${theme.name}". 
Target Aesthetic: Colors (BG: ${theme.colors.bg}, Text: ${theme.colors.text}, Accent: ${theme.colors.accent}), Font: ${theme.font}.

CONTEXT: You are provided with a website architecture where each node ALREADY HAS existing inline styles (positioning, layout, sizes).

YOUR TASK: 
1. Review the "style" property of each node.
2. MODIFY ONLY color-related properties (color, background, border-color, shadow) and font properties to match the theme.
3. PRESERVE all layout properties (display, position, flex, width, height, transition, margin, padding) unless they directly clash with the theme.
4. RETURN only a JSON object mapping "_key" to an OBJECT of properties to OVERRIDE or MERGE.

STRICT RULE: Do NOT return CSS selectors, braces {}, or nesting. 
ONLY return property-value pairs in a flat JSON structure.

EXAMPLE: { "_key_123": { "color": "#ff0000", "font-family": "${theme.font}" } }
`.trim();

    const maxRetries = 10;
    let styleMap: Record<string, any> = {};

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const resp = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nArchitecture with styles: ${JSON.stringify(architecture)}` }] }],
            generationConfig: { 
                temperature: 0,
                response_mime_type: "application/json"
            }
          }),
        });

        if (resp.status === 429) {
            await wait(5000);
            continue;
        }

        if (!resp.ok) throw new Error(`Status ${resp.status}`);

        const data = await resp.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
            styleMap = JSON.parse(responseText);
            break;
        }
      } catch (e: any) {
        if (attempt === maxRetries) throw e;
        await wait(2000);
      }
    }

    const updatedHtmlJson = applyStylesToOriginal(htmlJson, styleMap);

    return NextResponse.json({ nodes: updatedHtmlJson });

  } catch (error: any) {
    console.error("AI Stylize Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Error" }, { status: 500 });
  }
}
