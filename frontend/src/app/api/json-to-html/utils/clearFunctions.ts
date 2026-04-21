import {
  collectAllClasses,
  addRevMarkerIfUsed,
} from "@/app/api/json-to-html/utils/classCollectors";
import { inlineSvgIcons } from "@/app/api/json-to-html/utils/inlineSvgIcons";
import { buildHtml } from "@/app/api/json-to-html/utils/buildHtml";
import { buildScssFromHtml } from "@/app/api/json-to-html/utils/buildScssFromHtml";
import { buildJs } from "@/app/api/json-to-html/utils/buildJs";
import type { HtmlNode } from "@/types/HtmlNode";

async function runClearPipeline(nodes: HtmlNode[]): Promise<{
  html: string;
  scss: string;
  js: string;
}> {
  // 1) собираем классы в белый список
  const whiteList = collectAllClasses(nodes);
  
  // 2) помечаем, что рев-стили нужны, если rev-классы встречаются
  addRevMarkerIfUsed(nodes, whiteList);

  const withInlineSvg = await inlineSvgIcons(nodes as HtmlNode[]); // img → svg
  const rawHtml = buildHtml(withInlineSvg as HtmlNode[]);
  
  // 3) Используем новый билдер SCSS, который работает с DOM и ID корневых блоков
  // Он возвращает "чистый" html и вложенный scss
  const { html, scss } = await buildScssFromHtml(rawHtml, whiteList);

  const js = await buildJs(nodes as HtmlNode[]); 
  
  return { html, scss, js };
}

export default runClearPipeline;