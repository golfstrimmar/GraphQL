import {
  collectAllClasses,
  addRevMarkerIfUsed,
} from "@/app/api/json-to-html/utils/classCollectors";
import { inlineSvgIcons } from "@/app/api/json-to-html/utils/inlineSvgIcons";
import { buildHtml } from "@/app/api/json-to-html/utils/buildHtml";
import { buildSCSS } from "@/app/api/json-to-html/utils/bildSCSS";
import { buildScssFromHtml } from "@/app/api/json-to-html/utils/buildScssFromHtml";
import { buildJs } from "@/app/api/json-to-html/utils/buildJs";
import type { HtmlNode } from "@/types/HtmlNode";

async function runClearPipeline(nodes: HtmlNode[]): Promise<{
  html: string;
  scss: string;
  js: string;
}> {
  // 1) собираем классы
  // const whiteList = collectAllClasses(nodes);
  // console.log("<===whiteList===>", whiteList);
  // // 2) помечаем, что рев-стили нужны, если rev-классы встречаются
  // addRevMarkerIfUsed(nodes, whiteList);

  const withInlineSvg = await inlineSvgIcons(nodes as HtmlNode[]); // img → svg
  const rawHtml = buildHtml(withInlineSvg as HtmlNode[]);
  console.log("<=🚀🚀🚀==rawHtml==🚀🚀🚀=>", rawHtml);
  const scss = await buildSCSS(nodes as HtmlNode[]);
  console.log("<=🚀🚀🚀==scssFromDom==🚀🚀🚀=>", scss);
  // 3) белый список (классы + спец-маркеры) отдаём в билдер scss
  // const { html, scss } = await buildScssFromHtml(rawHtml, whiteList);

  const js = await buildJs(nodes as HtmlNode[]); // ← передаём тот же whiteList
  console.log("<=🚀🚀🚀==js==🚀🚀🚀=>", js);
  return { html: rawHtml, scss, js };
}

export default runClearPipeline;