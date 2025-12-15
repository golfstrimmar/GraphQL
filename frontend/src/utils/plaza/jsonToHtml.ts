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
function buildAttrs(node) {
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
// BEM-селектор
// BEM-селектор + поддержка нескольких классов
function getScssSelector(node, parentClasses: string[] = []) {
  const nodeClasses = normalizeClasses(node.class);
  const parentMain = parentClasses[0] || ""; // основной BEM-блок, если есть

  // если есть классы у узла
  if (nodeClasses.length) {
    // BEM: .block + элемент .block__elem
    if (
      parentMain &&
      nodeClasses.length === 1 &&
      nodeClasses[0].startsWith(parentMain + "__")
    ) {
      const elem = nodeClasses[0].slice(parentMain.length + 2);
      return `&__${elem}`;
    }

    // обычные классы: .class1.class2
    return "." + nodeClasses.join(".");
  }

  // нет классов → просто тег
  return node.tag || "div";
}

function cleanServiceText(raw: string): string {
  let text = raw;
  // длинные сначала
  const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);

  sorted.forEach((word) => {
    const pattern = word.replace(/\s+/g, "\\s+");
    const re = new RegExp(`^\\s*${pattern}\\s*$`, "i");
    if (re.test(text)) {
      text = ""; // если весь текст — служебка, убираем полностью
    }
  });

  return text;
}
// --- Pug генератор ---
function attrsToPug(node) {
  const parts = [];
  if (node.class && node.class.trim()) {
    // не пишем отдельно, тк класс в .class
  }
  if (node.attributes && typeof node.attributes === "object") {
    for (const [key, value] of Object.entries(node.attributes)) {
      parts.push(`${key}="${String(value).replace(/"/g, "'")}"`);
    }
  }
  return parts.length ? `(${parts.join(" ")})` : "";
}

function toPug(nodes, indent = "") {
  return nodes
    .map((node) => {
      const { tag, text = "", class: cls = "", children = [] } = node;

      let pugLine = indent + tag;

      if (cls && cls.trim()) {
        pugLine += "." + cls.trim().split(/\s+/).join(".");
      }

      const attrString = attrsToPug(node);
      if (attrString) pugLine += attrString;

      // текст: чистим служебные
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

function renderNodesAndCollectScss(nodes, parentClasses: string[] = []) {
  let html = "";
  let scssBlocks = [];
  let pug = "";

  nodes.forEach((node) => {
    const {
      tag,
      text = "",
      class: nodeClass = "",
      style = "",
      children = [],
    } = node;

    const nodeClasses = normalizeClasses(nodeClass);

    // все актуальные классы этого уровня
    const currentClasses = nodeClasses.length > 0 ? nodeClasses : parentClasses;

    const selector = getScssSelector(node, currentClasses);

    let childScssBlocks = [];
    if (children.length > 0) {
      childScssBlocks = renderNodesAndCollectScss(
        children,
        currentClasses,
      ).scssBlocks;
    }

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

    const attrsStr = buildAttrs(node);
    let htmlItem;
    if (selfClosingTags.has(tag.toLowerCase())) {
      htmlItem = `<${tag}${attrsStr}/>${text}`;
    } else {
      htmlItem = `<${tag}${attrsStr}>${text}${
        renderNodesAndCollectScss(children, currentClasses).html
      }</${tag}>`;
    }
    html += htmlItem;

    function stripServiceTexts(html: string): string {
      let out = html;

      // длинные строки сначала (flex row, hero img и т.п.)
      const sorted = [...SERVICE_TEXTS].sort((a, b) => b.length - a.length);

      sorted.forEach((text) => {
        const pattern = text.replace(/\s+/g, "\\s+");
        const re = new RegExp(`>(\\s*)${pattern}(\\s*)<`, "g");
        out = out.replace(re, ">$1$2<"); // оставляем только пробелы (если были)
      });

      // подчистить лишние пробелы между тегами
      out = out.replace(/>\s+</g, "><").trim();

      return out;
    }
    const output = stripServiceTexts(html);
    html = output;

    pug += "\n" + toPug([node]);
  });

  return { html, scssBlocks, pug: pug.trim() };
}

function scssBlocksToString(blocks, indent = "") {
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
    .replace(/\s*\n\s*/g, " ") // переносы строк → пробел
    .replace(/\s{2,}/g, " ") // несколько пробелов → один
    .replace(/\s*{\s*/g, " { ") // аккуратно расставить пробелы вокруг {
    .replace(/\s*}\s*/g, " } ") // и вокруг }
    .replace(/\s*;\s*/g, ";") // убрать пробелы вокруг ;
    .trim();
  console.log("<==💥💥💥💥==cleaned==💥💥💥💥==>", cleaned);
  return cleaned;
}

const jsonToHtml = (json) => {
  const nodes = json.children || [];
  const { html, scssBlocks, pug } = renderNodesAndCollectScss(nodes);
  const scss = scssBlocksToString(scssBlocks);
  return { html, scss, pug };
};

export default jsonToHtml;
