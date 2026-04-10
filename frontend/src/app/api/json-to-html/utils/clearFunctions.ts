import {
  collectAllClasses,
  addRevMarkerIfUsed,
} from "@/app/api/json-to-html/utils/classCollectors";
import { inlineSvgIcons } from "@/app/api/json-to-html/utils/inlineSvgIcons";
import { parseHtml } from "@/app/api/json-to-html/utils/parseHtml";
import { buildScssFromHtml } from "@/app/api/json-to-html/utils/buildScssFromHtml";
import { buildJs } from "@/app/api/json-to-html/utils/buildJs";


type HtmlNode = {
  tag: string;
  class?: string;
  style?: string;
  _key?: string;
  text?: string;
  children?: HtmlNode[];
  attributes?: Record<string, string>;
};

async function runClearPipeline(nodes: HtmlNode[]): Promise<{
  html: string;
  scss: string;
  js: string;
}> {
  // 1) собираем классы
  const whiteList = collectAllClasses(nodes);
  console.log("<===whiteList===>", whiteList);
  // 2) помечаем, что рев-стили нужны, если rev-классы встречаются
  addRevMarkerIfUsed(nodes, whiteList);

  const withInlineSvg = await inlineSvgIcons(nodes); // img → svg
  const rawHtml = parseHtml(withInlineSvg);

  // 3) белый список (классы + спец-маркеры) отдаём в билдер scss
  const { html, scss } = await buildScssFromHtml(rawHtml, whiteList);

  const js = await buildJs(nodes, whiteList); // ← передаём тот же whiteList

  return { html, scss, js };
}

export default runClearPipeline;