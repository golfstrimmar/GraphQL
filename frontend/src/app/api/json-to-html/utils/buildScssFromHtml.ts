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
function getNestedScssFromDoc(doc: Document): string {
  const lines: string[] = [];
  const indent = (depth: number) => "  ".repeat(depth);

  // Вспомогательная функция для определения селектора элемента
  const getSelector = (el: HTMLElement, depth: number): string => {
    const elementId = el.getAttribute("id");
    const className = el.getAttribute("class");

    if (depth === 0 && elementId) {
      return `#${elementId}`;
    }

    if (className) {
      const normalClasses = className
        .split(" ")
        .map((c) => c.trim())
        .filter(Boolean)
        .filter((c) => !isServiceClass(c));

      if (normalClasses.length > 0) {
        return "." + normalClasses[0];
      }
    }

    return el.tagName.toLowerCase();
  };

  /**
   * Рекурсивная функция, которая обрабатывает список элементов-сиблингов.
   * Мы группируем их по селектору, чтобы не дублировать блоки.
   */
  const walk = (elements: HTMLElement[], depth: number) => {
    const groups = new Map<string, HTMLElement[]>();

    // 1. Группируем элементы по их селектору
    elements.forEach((el) => {
      const selector = getSelector(el, depth);
      if (!groups.has(selector)) {
        groups.set(selector, []);
      }
      groups.get(selector)!.push(el);
    });

    // 2. Для каждой группы создаем ОДИН блок в SCSS
    groups.forEach((els, selector) => {
      lines.push(`${indent(depth)}${selector} {`);

      // Собираем все уникальные свойства стилей из всех элементов группы
      const uniqueStyles = new Set<string>();
      els.forEach((el) => {
        const styleAttr = (el.getAttribute("style") || "").trim();
        if (styleAttr) {
          styleAttr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((s) => uniqueStyles.add(s.endsWith(";") ? s : s + ";"));
        }
      });

      // Выводим стили
      uniqueStyles.forEach((style) => {
        lines.push(`${indent(depth + 1)}${style}`);
      });

      // Собираем всех детей от всех элементов этой группы (например, все внутренности всех карточек)
      const allChildren: HTMLElement[] = [];
      els.forEach((el) => {
        allChildren.push(...(Array.from(el.children) as HTMLElement[]));
      });

      // Рекурсивно идем глубже, если есть дети
      if (allChildren.length > 0) {
        walk(allChildren, depth + 1);
      }

      lines.push(`${indent(depth)}}`);
    });
  };

  const rootChildren = Array.from(doc.body.children) as HTMLElement[];
  walk(rootChildren, 0);

  return lines.join("\n");
}

// удаляем inline style из html
function stripInlineStylesFromDoc(doc: Document): void {
  const all = Array.from(doc.querySelectorAll<HTMLElement>("*"));
  all.forEach((el) => {
    if (el.hasAttribute("style")) {
      el.removeAttribute("style");
    }
  });
}

// забираем содержимое всех <style>, фильтруем по маркеру, удаляем их из html
function extractAndRemoveStyles(
  doc: Document,
  whiteList: Set<string>
): string {
  const styleNodes = Array.from(doc.querySelectorAll("style")) as HTMLStyleElement[];
  const cssBlocks: string[] = [];

  styleNodes.forEach((node) => {
    const css = (node.textContent || "").trim();
    if (!css) {
      node.remove();
      return;
    }

    // ищем маркер в комментарии: /* _что‑то */
    const markerMatch = css.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
    const marker = markerMatch?.[1];

    // если маркер есть и он НЕ в белом списке — пропускаем этот <style>
    if (marker && !whiteList.has(marker)) {
      node.remove();
      return;
    }

    // иначе добавляем блок
    cssBlocks.push(css);
    node.remove();
  });

  return cssBlocks.join("\n\n");
}

export async function buildScssFromHtml(
  html: string,
  whiteList: Set<string>
): Promise<{ html: string; scss: string }> {
  // 1) Парсим HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // 2) Вытащить и отфильтровать <style> (удаляет их из DOM)
  const globalCss = extractAndRemoveStyles(document, whiteList);


  // 4) nested scss из DOM (теперь с использованием ID для корней и упрощенными классами)
  const scssFromDom = getNestedScssFromDoc(document);

  // 5) Почистить inline style в DOM
  stripInlineStylesFromDoc(document);

  // 6) Итоговый scss
  const scss = [scssFromDom, globalCss].filter(Boolean).join("\n\n");

  return {
    html: document.body.innerHTML,
    scss
  };
}
