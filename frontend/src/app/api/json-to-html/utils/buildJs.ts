import type { HtmlNode } from "@/types/HtmlNode";

function stripMarkerBlock(style: string, whiteList: Set<string>): string {
  const startMatch = style.match(/\/\*\s*(_[a-zA-Z0-9_-]+)\s*\*\//);
  if (!startMatch) return style;

  const cls = startMatch[1];
  if (whiteList.has(cls)) return style;

  const startIndex = startMatch.index!;
  const endRegex = new RegExp(`/\\*\\s*/${cls}\\s*\\*/`);
  const endMatch = style.slice(startIndex).match(endRegex);
  if (!endMatch) {
    return (
      style.slice(0, startIndex) +
      style.slice(startIndex + startMatch[0].length)
    );
  }

  const endIndex = startIndex + endMatch.index! + endMatch[0].length;
  const before = style.slice(0, startIndex);
  const after = style.slice(endIndex);
  return (before + after).trim();
}

// 3) дерево → js (скрипты с @component, без дубликатов)
export async function buildJs(
  nodes: HtmlNode[],
  whiteList: Set<string>
): Promise<string> {
  const scripts = new Set<string>();

  const walk = (list: HtmlNode[]) => {
    list.forEach((node) => {
      if (node.tag === "script" && node.text && node.text.trim()) {
        let raw = node.text.trim();

        // вырезаем маркерные блоки по тем же правилам, что в CSS
        let prev: string;
        do {
          prev = raw;
          raw = stripMarkerBlock(raw, whiteList);
        } while (raw !== prev);

        const lines = raw.split("\n").map((l) => l.trim());
        const jsCode = lines.join("\n").trim();

        if (jsCode) {
          scripts.add(jsCode);
        }
      }

      if (node.children && node.children.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);

  return Array.from(scripts).join("\n\n");
}