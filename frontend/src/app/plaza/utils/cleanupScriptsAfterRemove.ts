import type { HtmlNode } from "@/types/HtmlNode";
import type { RemovedMeta } from "./removeNodeByKey";

const cleanupScriptsAfterRemove = (
  meta: RemovedMeta,
  nextHtml: HtmlNode[],
  isDragging = false,
): HtmlNode[] => {
  if (isDragging) return nextHtml;
  const { removed, removedClass } = meta;
  if (!removed) return nextHtml;

  const cls = removedClass ?? "";
  if (!cls) return nextHtml;

  let res = nextHtml;

  // Проверяет, есть ли в дереве хотя бы одна не-script нода с этим классом
  const hasNodesWithMark = (mark: string, currentTree: HtmlNode[]): boolean => {
    const visit = (node: HtmlNode): boolean => {
      if (
        node.tag !== "script" &&
        node.tag !== "style" &&
        typeof node.class === "string" &&
        new RegExp(`(^|\\s)${mark}(\\s|$)`).test(node.class)
      ) {
        return true;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (typeof child === "string") continue;
          if (visit(child)) return true;
        }
      }
      return false;
    };
    return currentTree.some(visit);
  };

  // Удаляет все script-ноды, чей text содержит jsMark
  const filterScriptsDeep = (nodes: HtmlNode[], jsMark: string): HtmlNode[] => {
    const visit = (node: HtmlNode): HtmlNode | null => {
    if (
      node.tag === "script" &&
      typeof node.text === "string" &&
      (node.text.toLowerCase().includes(`@component: .${jsMark.toLowerCase()}`) ||
        node.text.toLowerCase().includes(`@isolate: ${jsMark.toLowerCase()}`) ||
        node.text.includes(`/* @component: .${jsMark} */`) ||
        node.text.includes(`/* @isolate: ${jsMark} */`))
    ) {
        return null;
      }
      if (Array.isArray(node.children)) {
        const newChildren: (HtmlNode | string)[] = [];
        for (const ch of node.children) {
          if (typeof ch === "string") {
            newChildren.push(ch);
          } else {
            const v = visit(ch);
            if (v) newChildren.push(v);
          }
        }
        return { ...node, children: newChildren as HtmlNode["children"] };
      }
      return node;
    };
    const result: HtmlNode[] = [];
    for (const n of nodes) {
      const v = visit(n);
      if (v) result.push(v);
    }
    return result;
  };

  // "custom-select foo" -> ["custom-select", "foo"]
  const allTokens = cls.split(/\s+/).filter((t) => t.length >= 3);
  
  // Ищем токен изоляции (swiper-isolate-...)
  const isolationToken = allTokens.find(t => t.toLowerCase().includes('isolate-'));

  for (const token of allTokens) {
    if (!hasNodesWithMark(token, res)) {
      // Изоляция: удаляем смело, если токен исчез
      if (token.toLowerCase().includes('isolate-')) {
        console.log(`[Cleanup] Removing isolated script for: ${token}`);
        res = filterScriptsDeep(res, token);
        continue;
      }

      // Обычный токен (базовый класс): удаляем только если нет кода изоляции
      // Это предотвращает удаление "общего" скрипта при удалении конкретного слайдера
      if (!isolationToken) {
        console.log(`[Cleanup] Removing base script for token: ${token}`);
        res = filterScriptsDeep(res, token);
      } else {
        console.log(`[Cleanup] Skipping base script cleanup for token "${token}" because isolation token "${isolationToken}" was present`);
      }
    }
  }

  return res;
};

export default cleanupScriptsAfterRemove;
