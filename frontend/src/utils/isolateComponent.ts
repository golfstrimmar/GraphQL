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
  const needsIsolation = nodes.some(
    (node) =>
      node.tag === "script" ||
      node.tag === "style" ||
      node.attributes?.id ||
      JSON.stringify(node).toLowerCase().includes("modal") ||
      JSON.stringify(node).toLowerCase().includes("swiper")
  );

  if (!needsIsolation) return nodes;

  const uniqId = Math.random().toString(36).substring(2, 8);
  const uniqClass = `isolate-${uniqId}`;

  const processNode = (node: HtmlNode, isRootContent: boolean): HtmlNode => {
    let newClass = node.class || "";
    const newAttributes = { ...node.attributes };

    // 1. Привязка корневого уникального класса
    if (
      isRootContent &&
      !["link", "style", "script"].includes(node.tag || "")
    ) {
      newClass = `${newClass} ${uniqClass}`.trim();
    }

    // 2. Изоляция ID и связанных атрибутов в HTML
    if (newAttributes.id) {
      newAttributes.id = `${newAttributes.id}-${uniqId}`;
    }
    if (newAttributes.for) {
      newAttributes.for = `${newAttributes.for}-${uniqId}`;
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
      // Пытаемся добавить префикс уникального класса ко всем селекторам, 
      // если они еще не изолированы.
      // Это базовая реализация: добавляем комментарий и оборачиваем (по возможности)
      newText = `/* @component: ${uniqClass} */\n${newText}\n .${uniqClass} { /* base scope */ }`;
      
      // Нам также нужно убедиться, что универсальные селекторы типа input[type="checkbox"] 
      // не ломают другие чекбоксы.
      // Для этого мы можем попытаться принудительно добавить .uniqClass в начало правил.
      // (В идеале здесь нужен полноценный CSS парсер, но пока обойдемся простым префиксом)
      newText = newText.replace(/(^|[,{}\n])\s*([^{}\n]+)\s*\{/g, (match, p1, p2) => {
          if (p2.includes('@') || p2.includes('from') || p2.includes('to') || p2.includes('%')) return match;
          return `${p1}.${uniqClass} ${p2.trim()}, .${uniqClass}${p2.trim()} {`;
      });
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
