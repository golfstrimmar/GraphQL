import type { HtmlNode } from "@/types/HtmlNode";

export async function buildJs(
  nodes: HtmlNode[],
): Promise<string> {
  const scripts: string[] = [];

  const walk = (list: HtmlNode[]) => {
    for (const node of list) {
      if (node.tag === "script" && typeof node.text === "string" && node.text.trim()) {
        const raw = node.text.trim();

        // // ищем маркер в комментарии: /* _что‑то */
        // const markerMatch = raw.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
        // const marker = markerMatch?.[1]; // "_rev_on_scroll" и т.п.

        // // если есть маркер И он не в whiteList — пропускаем этот скрипт
        // if (marker && !whiteList.has(marker)) {
        //   continue;
        // }

        scripts.push(raw);
      }

      if (node.children?.length) {
        walk(node.children as HtmlNode[]);
      }
    }
  };

  walk(nodes);

  return scripts.join("\n\n");
}