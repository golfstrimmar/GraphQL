import type { HtmlNode } from "@/types/HtmlNode";

export function isolateSwiperNodes(nodes: HtmlNode[]): HtmlNode[] {
  // Check if this component bundle contains Swiper functionality
  const hasSwiper = nodes.some(
    (node) =>
      JSON.stringify(node).includes("swiper") ||
      JSON.stringify(node).includes("Swiper")
  );

  if (!hasSwiper) return nodes;

  const uniqId = Math.random().toString(36).substring(2, 8);
  const uniqClass = `swiper-isolate-${uniqId}`;

  const processNode = (node: HtmlNode, isRootContent: boolean): HtmlNode => {
    // 1. Hook HTML Root Node
    // If it's a structural element (not link/style/script) at the root level, tag it.
    let newClass = node.class || "";
    if (
      isRootContent &&
      !["link", "style", "script"].includes(node.tag || "")
    ) {
      newClass = `${newClass} ${uniqClass}`.trim();
    }

    let newText = node.text;

    // 2. Isolate Javascript Logic
    if (node.tag === "script" && newText && newText.includes("Swiper")) {
      newText = newText.replace(
        /(new\s+Swiper\s*\(\s*['"])([^'"]+)(['"])/g,
        `$1.${uniqClass} $2$3`
      );
      newText = newText.replace(
        /nextEl:\s*['"]([^'"]+)['"]/g,
        `nextEl: '.${uniqClass} $1'`
      );
      newText = newText.replace(
        /prevEl:\s*['"]([^'"]+)['"]/g,
        `prevEl: '.${uniqClass} $1'`
      );
      newText = newText.replace(
        /el:\s*['"]([^'"]*pagination[^'"]*)['"]/g,
        `el: '.${uniqClass} $1'`
      );

      // Глобальная изоляция всех DOM-запросов (document.querySelector / All)
      // Превращаем 'document.querySelectorAll(".sliderFull")' в 'document.querySelectorAll(".swiper-isolate-xyz:is(.sliderFull), .swiper-isolate-xyz .sliderFull")'
      newText = newText.replace(
        /document\.querySelector(All)?\(\s*(['"])([^'"]+)\2\s*\)/g,
        (match, isAll, quote, selector) => {
          // Игнорируем запросы к глобальным тегам и подключению скриптов
          if (
            selector === 'script' ||
            selector.includes('swiper-js') ||
            selector.includes('swiper-css') ||
            selector === 'body' ||
            selector === 'head'
          ) {
            return match;
          }
          const sel = selector.trim();
          return `document.querySelector${isAll || ''}(${quote}.${uniqClass}:is(${sel}), .${uniqClass} ${sel}${quote})`;
        }
      );
      
      // Оборачиваем весь скрипт в IIFE (Самовызывающуюся функцию),
      // чтобы любые глобальные переменные (const link) или функции (function initDoubleSwiper) 
      // были строго локальными для этого конкретного слайдера и не вызывали SyntaxError при дублировании.
      newText = `\n/* ISOLATED SCOPE: ${uniqClass} */\n(() => {\n${newText}\n})();\n`;
    }

    // 2b. Isolate Style Tags (added)
    if (node.tag === "style" && newText) {
       newText = `${newText}\n/* ISOLATED STYLE: ${uniqClass} */\n`;
    }

    // 3. Process Children recursively (but they are not root)
    const children = Array.isArray(node.children)
      ? node.children.map((child) => processNode(child, false))
      : node.children;

    return { ...node, class: newClass, text: newText, children };
  };

  return nodes.map((node) => processNode(node, true));
}
