import { NextRequest, NextResponse } from "next/server";
import type { HtmlNode } from "@/types/HtmlNode";

// API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
const MODEL_NAME = "llama-3.1-8b-instant";

export const maxDuration = 30;

// Replicating the logic from AdminComponent's handleLoad
async function fetchEntityFromDb(tagName: string): Promise<HtmlNode[]> {
  const query = `
    query GetJsonDocument($name: String!) {
      jsonDocumentByName(name: $name) {
        content
      }
    }
  `;

  const fetchDoc = async (name: string) => {
    try {
      console.log(`🔍 Fetching DB entity: ${name} from ${GRAPHQL_URL}`);
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { name } }),
      });
      const resJson = await response.json();
      const content = resJson.data?.jsonDocumentByName?.content;
      console.log(`✅ Fetched ${name}:`, content ? "Found" : "Not Found");
      return content || [];
    } catch (e) {
      console.error(`❌ Error fetching ${name}:`, e);
      return [];
    }
  };

  const [main, style, script] = await Promise.all([
    fetchDoc(tagName),
    fetchDoc(`style-${tagName}`),
    fetchDoc(`script-${tagName}`),
  ]);

  const combined = [
    ...(Array.isArray(main) ? main : (main ? [main] : [])),
    ...(Array.isArray(style) ? style : (style ? [style] : [])),
    ...(Array.isArray(script) ? script : (script ? [script] : [])),
  ].filter(n => n && typeof n === 'object');

  return combined as HtmlNode[];
}

function ensureNodeKeys(tree: any): any {
  const withKey = (node: any): any => ({
    ...node,
    _key: node._key ?? crypto.randomUUID(),
    children: Array.isArray(node.children) ? node.children.map(withKey) : [],
  });
  return Array.isArray(tree) ? tree.map(withKey) : withKey(tree);
}

export async function POST(req: NextRequest) {
  console.log("🚀 AI Compose (Groq) endpoint started");

  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured in .env" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Промпт обязателен" }, { status: 400 });
    }

    // Complete list of entities from TagsNamen in JSON-Document collection
    const availableTags = [
      // Complex components
      "hero", "slider", "fade-slider", "carousel", "double-slider", "gallery", 
      "gallery-popup", "gallery-slider-popup", "cards", "card", "accordion", "tabs",
      "modal", "custom-select", "input-field", "textarea-field",
      "input-name-svg", "input-mail-svg", "input-tel-svg", "f-number", "f-check",
      "fieldset-radio", "fildset-rating", "range-wrap-js", "search-f", "input-datalist",
      // Layout utilities (also entities/documents)
      "container", "flex row", "flex col", "grid 100px_1fr", "grid minmax",
      "section container wrap", "ul flex row", "ul flex col"
    ];

    const systemPrompt = `
You are a Layout Orchestrator. Your task is to compose a page using our internal "Database Entities" (Tags).

AVAILABLE ENTITIES (DATABASE TAGS):
${availableTags.join(", ")}

JSON SCHEMA:
[
  {
    "tag": "entity-tag-name",
    "text": "Actual content if the entity supports it",
    "class": "extra-classes",
    "style": "custom: css; (optional)",
    "children": []
  }
]

RULES:
1. VALID HTML ONLY: If an item is NOT in the ENTITIES list, you MUST use standard HTML tags (div, section, h1-h6, p, span, a, button, img).
2. NEVER GENERATE TAGS LIKE "flex", "grid", "row": If you want flex layout, use "tag": "div" and "class": "flex-row" (or select from ENTITIES).
3. NO EXPLANATIONS: Return only JSON array.
`.trim();

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Selection Request: ${prompt}` },
        ],
        temperature: 0.2, // Lower temp for more predictable entity selection
      }),
    });

    const data = await response.json();
    let aiContent = data.choices?.[0]?.message?.content?.trim() || "";
    console.log("🚀 AI Raw Response:", aiContent);
    
    // Improved JSON extraction: find the first '[' and the last ']'
    const startIdx = aiContent.indexOf('[');
    const endIdx = aiContent.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      console.warn("⚠️ No JSON array found. Returning fallback notice.");
      return NextResponse.json({
        nodes: [{ tag: "div", text: "AI failed to generate a valid layout. Try a different prompt.", style: "color:red; padding:20px;" }],
        message: "AI Failed to generate valid JSON"
      });
    }

    const cleanedJson = aiContent.substring(startIdx, endIdx + 1)
      .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas before ] or }
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure keys are quoted (though Groq usually does this)
      .trim();

    console.log("🛠️ Cleaned JSON for parsing:", cleanedJson);

    let aiNodes: any[];
    try {
      aiNodes = JSON.parse(cleanedJson);
    } catch (e: any) {
      console.error("❌ JSON.parse failed:", e.message, "Cleaned JSON:", cleanedJson);
      return NextResponse.json({ 
        error: "Invalid AI response format", 
        parseError: e.message,
        raw: aiContent,
        cleaned: cleanedJson
      }, { status: 500 });
    }

    const basicTags = ["div", "section", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "li", "a", "button", "img", "svg"];

    async function processNodes(nodes: any[]): Promise<HtmlNode[]> {
      const processed: HtmlNode[] = [];
      
      for (const node of nodes) {
        let nodeTag = (node.tag || "div").toLowerCase().trim();
        const nodeClass = (node.class || "").toLowerCase().trim();
        
        // Safety: Prevent hallucinations like <flex>, <row>, etc.
        if (["flex", "row", "col", "grid"].includes(nodeTag)) {
          nodeTag = "div";
        }

        const match = availableTags.find(t => 
          t === nodeTag || 
          nodeClass === t || 
          nodeClass.split(/\s+/).includes(t)
        );

        if (match && !basicTags.includes(nodeTag)) {
          const dbContent = await fetchEntityFromDb(match);
          if (dbContent.length > 0) {
            const enriched = ensureNodeKeys(dbContent) as HtmlNode[];
            if (node.text && enriched[0]) {
              enriched[0].text = node.text;
            }
            processed.push(...enriched);
          } else {
            // DB fallback
            const newNode = { ...node, tag: nodeTag };
            if (Array.isArray(newNode.children)) {
              newNode.children = await processNodes(newNode.children);
            }
            processed.push(ensureNodeKeys(newNode) as HtmlNode);
          }
        } else {
          // Regular node
          const newNode = { ...node, tag: nodeTag };
          if (!basicTags.includes(nodeTag)) {
            newNode.tag = "div"; // Final safety net
          }
          if (Array.isArray(newNode.children)) {
            newNode.children = await processNodes(newNode.children);
          }
          processed.push(ensureNodeKeys(newNode) as HtmlNode);
        }
      }
      
      return processed;
    }

    const finalNodes = await processNodes(aiNodes);

    return NextResponse.json({
      nodes: finalNodes,
      message: "Successfully composed from DB entities using Groq",
    });

  } catch (error: any) {
    console.error("AI Compose Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
