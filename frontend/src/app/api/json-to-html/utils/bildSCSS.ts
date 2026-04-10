import type { HtmlNode } from "@/types/HtmlNode";

export function buildSCSS(nodes: HtmlNode[]): string {
  const lines: string[] = [];

  const indent = (depth: number) => "  ".repeat(depth);

  const walk = (node: HtmlNode, depth: number) => {
    // пропускаем <script> и <style> целиком
    if (node.tag === "script" || node.tag === "style") return;

    const className = node.class || "";
    const dataKey =
      (node as any).attributes?.["data-key"] as string | undefined;
    const styleAttr = (node.style || "").trim();

    // селектор
    let selector: string;
    if (className) {
      const classes = className
        .split(/\s+/)
        .map((c) => c.trim())
        .filter(Boolean).filter(c => !c.startsWith("_"));
      selector = node.tag + "." + classes.join(".");
    } else if (dataKey) {
      selector = `${node.tag}[data-key="${dataKey}"]`;
    }

    // открывающая скобка
    lines.push(`${indent(depth)}${selector} {`);

    // инлайн-стили → просто строки внутри блока
    if (styleAttr) {
      styleAttr
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          const line = s.endsWith(";") ? s : s + ";";
          lines.push(`${indent(depth + 1)}${line}`);
        });
    }

    // дети
    if (node.children && node.children.length) {
      for (const child of node.children as HtmlNode[]) {
        walk(child, depth + 1);
      }
    }

    // закрывающая скобка
    lines.push(`${indent(depth)}}`);
  };

  nodes.forEach((n) => walk(n, 0));

  return lines.join("\n");
}