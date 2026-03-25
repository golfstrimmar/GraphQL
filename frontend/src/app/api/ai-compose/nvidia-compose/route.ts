import { NextRequest, NextResponse } from "next/server";
import type { HtmlNode } from "@/types/HtmlNode";

// NVIDIA NIM API configuration
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL_NAME = "meta/llama-3.1-70b-instruct"; // High-performance model with good reasoning

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  console.log("🚀 NVIDIA Compose started");

  if (!NVIDIA_API_KEY) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY is not configured in .env" },
      { status: 500 }
    );
  }

  try {
    const { prompt, context, currentJson } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert AI Web Architect. Your goal is to compose a list of UI components (HtmlNode[]) based on a user prompt and a provided Design System context.

UI STRUCTURE (HtmlNode):
Each node must be a JSON object with:
- tag: (string) any valid HTML5 tag (div, section, h1, p, button, etc.)
- text: (string, optional) text content
- class: (string, optional) CSS classes
- style: (string or object, optional) inline styles
- children: (array of HtmlNode, optional) nested elements

DESIGN SYSTEM CONTEXT:
${JSON.stringify(context || {}, null, 2)}

CURRENT CANVAS STATE:
${JSON.stringify(currentJson || [], null, 2)}

RULES:
1. Use the provided Design System (colors, fonts, images) whenever possible.
2. Return ONLY a JSON array of HtmlNode objects.
3. Do NOT include markdown blocks, comments, or explanations.
4. If images are provided in the context, use their URLs for <img> tags.
5. Ensure the output is valid JSON.
`.trim();

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Prompt: ${prompt}` },
        ],
        temperature: 0.2, // Low temperature for stability in structure
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NVIDIA API error:", response.status, errText);
      throw new Error(`NVIDIA API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";

    // Clean up potential markdown formatting
    const cleanedJson = content
      .replace(/^```json\s*/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    let nodes: HtmlNode[];
    try {
      nodes = JSON.parse(cleanedJson);
      if (!Array.isArray(nodes)) nodes = [nodes];
    } catch (e) {
      console.error("Failed to parse AI JSON:", e, cleanedJson);
      return NextResponse.json(
        { error: "AI returned invalid JSON structure", raw: cleanedJson },
        { status: 500 }
      );
    }

    return NextResponse.json({
      nodes,
      message: "Successfully composed with NVIDIA AI",
    });

  } catch (error: any) {
    console.error("NVIDIA Compose Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
