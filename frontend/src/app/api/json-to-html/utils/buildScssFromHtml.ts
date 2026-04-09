import { JSDOM } from "jsdom";

const REV_MARKER = "_rev_on_scroll";

const REV_CLASS_BASES = new Set([
  "rev--on-scroll",
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
]);

// грубо проверяем, что блок css относится к рев-стилям
function wrapRevBlockWithMarker(css: string): string {
  // если нет ни одного рев-селектора — не трогаем
  const hasRevSelector = [...REV_CLASS_BASES].some((cls) =>
    css.includes("." + cls)
  );
  if (!hasRevSelector) return css;

  // оборачиваем весь блок в маркеры
  return `/* ${REV_MARKER} */\n${css}\n/* /${REV_MARKER} */`;
}

// 1) режем маркерный блок внутри CSS/inline-style
function stripMarkerBlock(style: string, whiteList: Set<string>): string {
  // ищем маркер начала: /* _something */
  const startMatch = style.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
  if (!startMatch) return style;

  const cls = startMatch[1]; // "_empty", "_rev_on_scroll", ...
  if (whiteList.has(cls)) return style; // маркер есть — ничего не режем

  const startIndex = startMatch.index!;
  // ищем закрывающий маркер для этого же имени: /* /_something */
  const endRegex = new RegExp(`/\\*\\s*/${cls}\\s*\\*/`);
  const endMatch = style.slice(startIndex).match(endRegex);
  if (!endMatch) {
    // нет закрывающего — на всякий случай вырежем только комментарий начала
    return (
      style.slice(0, startIndex) +
      style.slice(startIndex + startMatch[0].length)
    );
  }

  const endIndex = startIndex + endMatch.index! + endMatch[0].length;

  // вырезаем блок целиком: от начала маркера до конца закрывающего
  const before = style.slice(0, startIndex);
  const after = style.slice(endIndex);
  return (before + after).trim();
}

// 2) сырой html → очищенный html + scss (иерархия = DOM)
export async function buildScssFromHtml(
  html: string,
  whiteList: Set<string>
): Promise<{ html: string; scss: string }> {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const baseLines: string[] = [];
  const modLines: string[] = [];

  const isModifierSelector = (sel: string) =>
    sel.includes("._filled") || sel.includes(".isolate-");

  const pushLine = (selector: string, content: string, depth: number) => {
    const indent = "  ".repeat(depth);
    const target = isModifierSelector(selector) ? modLines : baseLines;
    content.split("\n").forEach((line) => target.push(indent + line));
  };

  // === ШАГ 1. Глобальные <style data-global> ===
  const globalStyleNodes = Array.from(
    document.querySelectorAll('style[data-global="true"]')
  ) as HTMLStyleElement[];

  const globalCssLines: string[] = [];

  globalStyleNodes.forEach((node) => {
    let css = node.textContent || "";
    css = css.trim();
    if (!css) {
      node.remove();
      return;
    }

    // если это рев-стили — оборачиваем весь блок в маркер _rev_on_scroll
    css = wrapRevBlockWithMarker(css);

    // прогоняем stripMarkerBlock, пока есть что резать
    let prev: string;
    do {
      prev = css;
      css = stripMarkerBlock(css, whiteList);
    } while (css !== prev);

    if (css.trim()) {
      globalCssLines.push(css.trim());
    }

    // вырезаем <style> из HTML, чтобы он не просочился в итог
    node.remove();
  });

  // === ШАГ 2. Инлайновые стили, как раньше ===
  const walk = (el: HTMLElement, depth = 0) => {
    const className = el.getAttribute("class");
    const dataKey = el.getAttribute("data-key");
    let styleAttr = el.getAttribute("style") || "";

    const selector = className
      ? `.${className
        .split(" ")
        .map((c) => c.trim())
        .filter(Boolean)          // убираем "" и " "
        .join(".")}`
      : dataKey
        ? `${el.tagName.toLowerCase()}[data-key="${dataKey}"]`
        : el.tagName.toLowerCase();

    pushLine(selector, `${selector} {`, depth);

    if (styleAttr.trim()) {
      // сначала вырежем маркерный блок, если его класс не в whiteList
      styleAttr = stripMarkerBlock(styleAttr, whiteList);

      if (styleAttr.trim()) {
        const hasComplex = /[&{}]/.test(styleAttr);
        if (hasComplex) {
          pushLine(selector, styleAttr.trim(), depth + 1);
        } else {
          const styleBody = styleAttr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((rule) => `${rule};`)
            .join("\n");
          if (styleBody) pushLine(selector, styleBody, depth + 1);
        }
      }

      el.removeAttribute("style");
    }

    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => walk(child, depth + 1));

    pushLine(selector, "}", depth);
  };

  const rootChildren = Array.from(document.body.children) as HTMLElement[];
  rootChildren.forEach((child) => walk(child, 0));

  const cleanedHtml = document.body.innerHTML;

  // глобальные стили — в начало SCSS
  const scssParts = [
    ...globalCssLines,
    "",
    ...baseLines,
    "",
    ...modLines,
  ].filter((block) => block.trim() !== "");

  const scss = scssParts.join("\n");

  return { html: cleanedHtml, scss };
}