import { HtmlNode } from "@/types/HtmlNode";
import { ensureNodeKeys } from "./ensureNodeKeys";
import { isolateComponentNodes } from "./isolateComponent";

export const reIsolateClone = (tree: HtmlNode[], sourceKey: string): HtmlNode[] => {
  let foundOriginal = false;
  let done = false;

  const walk = (nodes: HtmlNode[]): HtmlNode[] =>
    nodes.map((node) => {
      if (done) return node;

      if (node._key === sourceKey) {
        // первый — оригинал
        foundOriginal = true;
        return node;
      }

      if (foundOriginal && !done && node._key) {
        // первый же после оригинала с _key считаем клоном
        done = true;

        // 1) убираем старые isolate‑классы
        const cleanedClass = (node.class || "")
          .replace(/isolate-[a-z0-9]{6}/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const clone: HtmlNode = {
          ...node,
          class: cleanedClass,
        };

        // 2) выдаём новые ключи
        const withKeys = ensureNodeKeys(clone) as HtmlNode;

        // 3) прогоняем только клон через изоляцию
        const [isolatedClone] = isolateComponentNodes([withKeys]);

        return isolatedClone;
      }

      return {
        ...node,
        children: node.children ? walk(node.children) : node.children,
      };
    });

  return walk(tree);
};
