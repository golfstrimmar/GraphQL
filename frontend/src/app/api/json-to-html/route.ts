import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const maxDuration = 30;

const selfClosingTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const SERVICE_TEXTS = [
  "section",
  "container",
  "flex row",
  "flex col",
  "link",
  "span",
  "div",
  "div__wrap",
  "a",
  "button",
  "ul",
  "flex",
  "ul flex row",
  "ul flex col",
  "li",
  "nav",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "legend",
  "article",
  "aside",
  "fieldset",
  "form",
  "header",
  "ol",
  "option",
  "optgroup",
  "select",
  "imgs",
  "img",
  "img-container",
  "img container",
  "hero__wrap",
  "hero__title",
  "hero__content",
  "hero img",
  "hero__img",
  "hero__info",
  "hero__items",
  "slotes",
  "slotes__wrap",
  "slotes__title",
  "slotes__title title",
  "slotes__cards",
  "slotes__cards cards",
  "cards__card",
  "cards__card card",
  "card__title",
  "card__button",
];

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

// селектор без BEM/ампершандов
function getScssSelector(node: any) {
  const nodeClasses = normalizeClasses(node.class);

  if (nodeClasses.length) {
    return "." + nodeClasses.join(".");
  }

  return node.tag || "div";
}

function cleanServiceText(raw: string): string {
  let text = raw;
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);

  sorted.forEach((word) => {
    const pattern = word.replace(/\s+/g, "\\s+");
    const re = new RegExp(`^\\s*${pattern}\\s*$`, "i");
    if (re.test(text)) {
      text = "";
    }
  });

  return text;
}

// --- Pug генератор ---
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
      if (cleanedText.trim()) {
        pugLine += ` ${cleanedText.trim()}`;
      }

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
} {
  let html = "";
  let scssBlocks: any[] = [];
  let pug = "";

  nodes.forEach((node) => {
    const {
      tag,
      text = "",
      class: nodeClass = "",
      style = "",
      children = [],
    } = node;

    const selector = getScssSelector(node);

    // рекурсивно собираем детей
    let childHtml = "";
    let childScssBlocks: any[] = [];
    if (children.length > 0) {
      const childRes = renderNodesAndCollectScss(children);
      childHtml = childRes.html;
      childScssBlocks = childRes.scssBlocks;
    }

    // SCSS-структура
    if (style && style.trim()) {
      scssBlocks.push({
        selector,
        style: style.trim(),
        children: childScssBlocks,
      });
    } else if (childScssBlocks.length > 0) {
      scssBlocks.push({
        selector,
        style: "",
        children: childScssBlocks,
      });
    }

    // HTML с вложенностью
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

    // Pug
    const pugNode = toPug([node]);
    pug += (pug ? "\n" : "") + pugNode;
  });

  return { html, scssBlocks, pug: pug.trim() };
}

function scssBlocksToString(blocks: any[], indent = ""): string {
  let out = "";
  blocks.forEach(({ selector, style, children }) => {
    out += `${indent}${selector} {${style ? " " + style : ""}`;
    if (children && children.length > 0) {
      out += "\n" + scssBlocksToString(children, indent + "  ");
      out += `${indent}`;
    }
    out += " }\n";
  });
  const cleaned = out
    .replace(/background:\s*rgb\(220,\s*230,\s*220\);?/g, "")
    .replace(/background:\s*rgb\(226,\s*232,\s*240\);?/g, "")
    .replace(/padding:\s*2px\s*4px;?/g, "")
    .replace(/border:\s*1px\s*solid\s*#adadad;?/g, "")
    .replace(/background:\s*dodgerblue;?/g, "")
    .replace(/background:\s*#22c55e;?/g, "")
    .replace(/background:\s*#8b5cf6;?/g, "")
    .replace(/background:\s*#f97316;?/g, "")
    .replace(/background:\s*#eab308;?/g, "")
    .replace(/background:\s*#0ea5e9;?/g, "")
    .replace(/background:\s*#3b82f6;?/g, "")
    .replace(/background:\s*#06b6d4;?/g, "")
    .replace(/background:\s*#14b8a6;?/g, "")
    .replace(/background:\s*#ef4444;?/g, "")
    .replace(/background:\s*#f59e0b;?/g, "")
    .replace(/background:\s*#84cc16;?/g, "")
    .replace(/background:\s*#6366f1;?/g, "")
    .replace(/background:\s*#ec4899;?/g, "")
    .replace(/background:\s*#737373;?/g, "")
    .replace(/background:\s*#71717a;?/g, "")
    .replace(/background:\s*#f43f5e;?/g, "")
    .replace(/background:\s*#a855f7;?/g, "")
    .replace(/background:\s*#d946ef;?/g, "")
    .replace(/background:\s*#38bdf8;?/g, "")
    .replace(/background:\s*powderblue;?/g, "")
    .replace(/\.imgs\s*\{[^}]*img\s*\{\s*[^}]*\}[^}]*\}/g, "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*{\s*/g, " { ")
    .replace(/\s*}\s*/g, " } ")
    .replace(/\s*;\s*/g, ";")
    .trim();
  return cleaned;
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

async function callGroq(scss: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `
    Работай на уровне эксперта по SCSS.

    Тебе дают СЫРОЙ SCSS одного файла. В нём НЕТ заранее вынесенных utility-/текстовых классов (.text1, .text2, .text3 и т.п.), только стили компонентов и вложенные селекторы.

    Твоя задача — ОЧИСТИТЬ и ПЕРЕФОРМАТИРОВАТЬ этот SCSS по правилам:

    Вынос utility-/текстовых классов

    Найди повторяющиеся группы свойств, которые оформлены как классы и используются для типографики/текста (например .text1, .text2, .text3 и подобные).

    Для каждого такого класса оставь ОДНО объявление в начале файла.

    Удали все другие объявления этих же классов ниже по файлу.

    Внутри компонентных блоков не дублируй эти свойства — используй только сами классы (без @extend).

    Вложенные селекторы

    Сохраняй текущую структуру вложенности селекторов.

    Во всех вложенных селекторах используй только запись .class или tag.class.

    НЕ используй амперсанд (&) НИГДЕ — ни в селекторах (&.foo), ни в псевдоклассах (&:hover).

    Если в исходном коде были селекторы вида &.foo, перепиши их как .foo (или tag.foo, если это очевидно из контекста).

    @extend и дубли

    Удали любые конструкции вида:
    .foo { @extend .foo; }
    &.foo { @extend .foo; }

    Не добавляй новых @extend, даже если видишь повторяющиеся свойства.

    Убери дублирующиеся правила и повторяющиеся блоки с одинаковыми селекторами и одинаковыми свойствами.

    Форматирование

    Приведи SCSS к аккуратному, читаемому виду: понятные отступы, переносы строк, один селекторный блок на фигурные скобки.

    Не меняй значения свойств и визуальное поведение компонентов.

    Вывод

    В ответе ТОЛЬКО чистый SCSS, без комментариев, без пояснений, без текста до или после кода.


`.trim();

  const userPrompt = `
Вот сырой SCSS. Очисти и отформатируй его по правилам.

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

export async function POST(request: Request) {
  try {
    const body = await request.json(); // htmlJson
    const nodes = body || [];

    const { html, scssBlocks, pug } = renderNodesAndCollectScss(nodes);
    const rawScss = removeDuplicateLiBlocks(scssBlocksToString(scssBlocks));

    let cleanedScss = rawScss;

    if (GROQ_API_KEY && rawScss && rawScss.trim()) {
      cleanedScss = await callGroq(rawScss);
    }
    function postFixScss(scss: string) {
      return (
        scss
          // убрать extend самого себя
          .replace(/(&\.)?([a-zA-Z0-9_-]+)\s*\{\s*@extend\s+\.\2\s*;\s*}/g, "")
          // заменить "&.class{" на ".class{"
          .replace(/&(\.[a-zA-Z0-9_-]+)/g, "$1")
      );
    }

    return NextResponse.json({
      html,
      scss: postFixScss(cleanedScss),
      pug,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
