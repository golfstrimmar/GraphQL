import { JSDOM } from "jsdom";



const REV_CLASS_BASES = new Set([
  "rev--on-scroll",
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
]);

// служебные классы (ревилы, _filled/_empty и т.п.) не должны попадать в селекторы
function isServiceClass(cls: string): boolean {
  const name = cls.trim();
  if (!name) return false;

  // точные ревил-классы
  if (REV_CLASS_BASES.has(name)) return true;

  // любые классы с "--" или начинающиеся с "_"
  if (name.includes("--") || name.startsWith("_")) return true;

  return false;
}

// html -> nested scss (без <style>, без inline style-классов)
function htmlToNestedScss(html: string): string {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const lines: string[] = [];

  const indent = (depth: number) => "  ".repeat(depth);

  const walk = (el: HTMLElement, depth: number) => {
    const className = el.getAttribute("class");
    const dataKey = el.getAttribute("data-key");
    const styleAttr = (el.getAttribute("style") || "").trim();

    // селектор
    let selector: string;
    if (className) {
      const normalClasses = className
        .split(" ")
        .map((c) => c.trim())
        .filter(Boolean)
        .filter((c) => !isServiceClass(c));

      if (normalClasses.length > 0) {
        selector = "." + normalClasses.join(".");
      } else if (dataKey) {
        selector = `${el.tagName.toLowerCase()}[data-key="${dataKey.trim()}"]`;
      } else {
        selector = el.tagName.toLowerCase();
      }
    } else if (dataKey) {
      selector = `${el.tagName.toLowerCase()}[data-key="${dataKey.trim()}"]`;
    } else {
      selector = el.tagName.toLowerCase();
    }

    // открывающая строка
    lines.push(`${indent(depth)}${selector} {`);

    // если есть style — просто вставляем внутрь как есть (без парсинга)
    if (styleAttr) {
      styleAttr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          lines.push(`${indent(depth + 1)}${s}`);
        });
    }

    // дети
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => walk(child, depth + 1));

    // закрывающая скобка
    lines.push(`${indent(depth)}}`);
  };

  const rootChildren = Array.from(document.body.children) as HTMLElement[];
  rootChildren.forEach((child) => walk(child as HTMLElement, 0));

  return lines.join("\n");
}

// удаляем inline style из html
function stripInlineStyles(html: string): string {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const all = Array.from(document.querySelectorAll<HTMLElement>("*"));

  all.forEach((el) => {
    if (el.hasAttribute("style")) {
      el.removeAttribute("style");
    }
  });

  return document.body.innerHTML;
}

// забираем содержимое всех <style>, фильтруем по маркеру, удаляем их из html
function extractStyleBlocks(
  html: string,
  whiteList: Set<string>
): { html: string; css: string } {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const styleNodes = Array.from(
    document.querySelectorAll("style")
  ) as HTMLStyleElement[];

  const cssBlocks: string[] = [];

  styleNodes.forEach((node) => {
    const css = (node.textContent || "").trim();
    if (!css) {
      node.remove();
      return;
    }

    // ищем маркер в комментарии: /* _что‑то */
    const markerMatch = css.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
    const marker = markerMatch?.[1]; // например "_rev_on_scroll"

    // если маркер есть и он НЕ в белом списке — пропускаем этот <style>
    if (marker && !whiteList.has(marker)) {
      node.remove();
      return;
    }

    // иначе добавляем блок
    cssBlocks.push(css);
    node.remove();
  });

  return {
    html: document.body.innerHTML,
    css: cssBlocks.join("\n\n"),
  };
}

export async function buildScssFromHtml(
  html: string,
  whiteList: Set<string>
): Promise<{ html: string; scss: string }> {
  // 1) вытащить и отфильтровать <style> по маркеру
  const { html: withoutStyleTags, css: globalCss } = extractStyleBlocks(
    html,
    whiteList
  );

  // 2) nested scss из DOM (без служебных классов в селекторах)
  const scssFromDom = htmlToNestedScss(withoutStyleTags);

  // 3) почистить inline style в html
  const cleanHtml = stripInlineStyles(withoutStyleTags);

  // 4) итоговый scss: сначала nested, потом всё из <style>
  const scss = [scssFromDom, globalCss].filter(Boolean).join("\n\n");

  return { html: cleanHtml, scss };
}