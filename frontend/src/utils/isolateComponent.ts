import type { HtmlNode } from "@/types/HtmlNode";

/**
 * Универсальная функция изоляции компонента.
 * Добавляет уникальный класс к корневым элементам, 
 * делает ID и ссылки на них уникальными, 
 * изолирует JS-логику и CSS.
 */
export function isolateComponentNodes(nodes: HtmlNode[]): HtmlNode[] {
  // Нам нужно определить, стоит ли изолировать этот набор узлов.
  // Обычно мы изолируем всё, что приходит из базы как отдельный блок,
  // если в нем есть хотя бы один ID или скрипт/стиль.
  const checkNeedsIsolation = (node: HtmlNode): boolean => {
    // 1. Постоянные триггеры: ID, скрипты, стили
    if (node.attributes?.id) return true;
    if (node.tag === "script" || node.tag === "style") return true;

    // 2. Специфические ключевые слова в тегах или атрибутах
    const nodeHeader = (node.tag + JSON.stringify(node.attributes || "")).toLowerCase();
    if (nodeHeader.includes("modal") || nodeHeader.includes("swiper")) return true;

    // 3. Рекурсивный поиск в детях
    if (node.children && Array.isArray(node.children)) {
      return node.children.some(checkNeedsIsolation);
    }
    return false;
  };

  // 1. Поиск существующего ID изоляции, чтобы не плодить классы
  let existingId = "";
  const findExistingId = (node: HtmlNode) => {
    if (node.class && !["link", "style", "script"].includes(node.tag || "")) {
      const match = node.class.match(/isolate-([a-z0-9]{6})/);
      if (match) {
        existingId = match[1];
        return true;
      }
    }
    if (node.children && Array.isArray(node.children)) {
      return node.children.some(findExistingId);
    }
    return false;
  };
  nodes.some(findExistingId);

  const needsIsolation = nodes.some(checkNeedsIsolation);
  if (!needsIsolation && !existingId) return nodes;

  const uniqId = existingId || Math.random().toString(36).substring(2, 8);
  const uniqClass = `isolate-${uniqId}`;

  const processNode = (node: HtmlNode, isRootContent: boolean): HtmlNode => {
    let newClass = node.class || "";
    const newAttributes = { ...node.attributes };

    // 1. Привязка корневого уникального класса и очистка дублей
    if (
      isRootContent &&
      !["link", "style", "script"].includes(node.tag || "")
    ) {
      // Удаляем все упоминания isolate- (старые или лишние)
      let cleanedClass = newClass.replace(/isolate-[a-z0-9]{6}/g, "").replace(/\s+/g, " ").trim();
      // Добавляем наш актуальный класс
      newClass = `${cleanedClass} ${uniqClass}`.trim();
    }

    // 2. Изоляция ID и связанных атрибутов в HTML
    if (newAttributes.id) {
      newAttributes.id = `${newAttributes.id}-${uniqId}`;
    }
    if (newAttributes.for) {
      newAttributes.for = `${newAttributes.for}-${uniqId}`;
    }
    if (newAttributes.name) {
      newAttributes.name = `${newAttributes.name}-${uniqId}`;
    }
    if (typeof newAttributes.href === 'string' && newAttributes.href.startsWith("#")) {
      newAttributes.href = `${newAttributes.href}-${uniqId}`;
    }
    if (newAttributes["data-target"]) {
      newAttributes["data-target"] = `${newAttributes["data-target"]}-${uniqId}`;
    }

    const isGlobal = node.attributes?.["data-global"] === "true";
    let newText = node.text;

    // 3. Изоляция стилей (CSS)
    if (node.tag === "style" && newText && !isGlobal) {
      // 3a. Очистка старых пометок
      newText = newText.replace(/\/\* @component: isolate-[a-z0-9]{6} \*\/\n/g, "");
      
      // 3b. Оставляем CSS как есть, только добавляем пометку
      newText = `/* @component: ${uniqClass} */\n${newText}`;
    }

    // 4. Изоляция JS-логики
    if (node.tag === "script" && newText && !isGlobal) {
      // 4a. Внедряем проверку области клика
      newText = newText.replace(
        /document\.addEventListener\(['"]click['"]\s*,\s*function\s*\(([^)]+)\)\s*\{/g,
        `document.addEventListener('click', function($1) {\n  if (!$1.target.closest('.${uniqClass}')) return; `
      );

      // 4b. Ограничиваем querySelector/All
      newText = newText.replace(
        /document\.querySelector(All)?\(\s*(['"])([^'"]+)\2\s*\)/g,
        (match, isAll, quote, selector) => {
          const sel = selector.trim();
          if (
            ['script', 'body', 'head', 'window', 'document'].includes(sel) ||
            sel.includes('._open')
          ) {
            return match;
          }
          return `document.querySelector${isAll || ''}(${quote}.${uniqClass}:is(${sel}), .${uniqClass} ${sel}${quote})`;
        }
      );

      // 4c. Изоляция getElementById
      newText = newText.replace(
        /document\.getElementById\(\s*(['"])([^'"]+)\1\s*\)/g,
        `document.getElementById($1$2-${uniqId}$1)`
      );

      // 4d. Оборачиваем в IIFE
      newText = `\n/* ISOLATED COMPONENT SCOPE: ${uniqId} */\n(() => {\n${newText}\n})();\n`;
    }

    // 5. Рекурсивная обработка детей
    const children = Array.isArray(node.children)
      ? node.children.map((child) => processNode(child, false))
      : node.children;

    return { ...node, class: newClass, text: newText, attributes: newAttributes, children };
  };

  return nodes.map((node) => processNode(node, true));
}
