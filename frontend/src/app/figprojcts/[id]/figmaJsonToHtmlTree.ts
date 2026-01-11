// utils/figmaJsonToHtmlTree.ts
import type { HtmlNode } from "@/types/HtmlNode";

// Под твою структуру Figma JSON
export type FigmaBaseNode = {
  name: string;
  type: string;
  size?: { w: number; h: number };
  styles?: {
    bg?: string;
    layout?: {
      direction?: "row" | "column";
      gap?: number;
      align?: {
        main?: "start" | "center" | "end";
        cross?: "start" | "center" | "end";
      };
    };
    text?: {
      family?: string;
      size?: number;
      weight?: string;
      align?: "left" | "center" | "right";
    };
  };
  content?: string;
  children?: FigmaNode[];
};

export type FigmaTextNode = FigmaBaseNode & {
  type: "TEXT";
  content: string;
};

export type FigmaRectangleNode = FigmaBaseNode & {
  type: "RECTANGLE";
};

export type FigmaGroupNode = FigmaBaseNode & {
  type: "GROUP";
  children: FigmaNode[];
};

export type FigmaFrameNode = FigmaBaseNode & {
  type: "FRAME";
  children?: FigmaNode[];
};

export type FigmaVectorNode = FigmaBaseNode & {
  type: "VECTOR";
};

export type FigmaNode =
  | FigmaTextNode
  | FigmaRectangleNode
  | FigmaGroupNode
  | FigmaFrameNode
  | FigmaVectorNode
  | FigmaBaseNode; // fallback на случай других типов

export type FigmaExport = {
  metadata: any;
  designTokens: any;
  structure: FigmaFrameNode; // в твоём файле root = FRAME
  summary: any;
};

let keyCounter = 0;
const genKey = () => `figma-node-${keyCounter++}`;

const figmaAlignToTextAlign = (align?: string) => {
  if (align === "center") return "center";
  if (align === "right") return "right";
  return "left";
};

// ---------- TEXT ----------
const mapTextNode = (node: FigmaTextNode): HtmlNode => {
  const styleParts: string[] = [];

  if (node.styles?.bg) {
    styleParts.push(`background-color: ${node.styles.bg}`);
  }
  if (node.styles?.text?.family) {
    styleParts.push(
      `font-family: ${node.styles.text.family}, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`,
    );
  }
  if (node.styles?.text?.size) {
    styleParts.push(`font-size: ${node.styles.text.size}px`);
  }
  if (node.styles?.text?.weight) {
    styleParts.push(`font-weight: ${node.styles.text.weight}`);
  }
  if (node.styles?.text?.align) {
    styleParts.push(
      `text-align: ${figmaAlignToTextAlign(node.styles.text.align)}`,
    );
  }
  if (node.size?.w) {
    styleParts.push(`max-width: ${node.size.w}px`);
  }

  // простая эвристика: крупный текст как h2, остальное p
  const tag =
    node.styles?.text?.size && node.styles.text.size >= 32 ? "h2" : "p";

  return {
    tag,
    text: node.content ?? "",
    class: "",
    style: styleParts.join("; "),
    _key: genKey(),
    children: [],
  };
};

// ---------- RECTANGLE ----------
const mapRectangleNode = (node: FigmaRectangleNode): HtmlNode => {
  const styleParts: string[] = [];

  if (node.styles?.bg) {
    styleParts.push(`background-color: ${node.styles.bg}`);
  }
  if (node.size?.w) styleParts.push(`width: ${node.size.w}px`);
  if (node.size?.h) styleParts.push(`height: ${node.size.h}px`);

  return {
    tag: "div",
    text: "",
    class: "",
    style: styleParts.join("; "),
    _key: genKey(),
    children: [],
  };
};

// ---------- FRAME / GROUP / fallback (контейнеры) ----------
const mapContainerNode = (
  node: FigmaFrameNode | FigmaGroupNode | FigmaBaseNode,
): HtmlNode | null => {
  const children =
    node.children
      ?.map((child: FigmaNode) => mapFigmaNode(child))
      .filter(Boolean) ?? [];

  // если после обхода нет ни одного ребёнка — вообще ничего не рендерим
  if (!children.length) {
    return null;
  }

  const styleParts: string[] = [];

  if (node.styles?.bg) {
    styleParts.push(`background-color: ${node.styles.bg}`);
  }
  if (node.size?.w) styleParts.push(`width: ${node.size.w}px`);
  if (node.size?.h) styleParts.push(`height: ${node.size.h}px`);

  const layout = node.styles?.layout;
  if (layout?.direction) {
    styleParts.push(`display: flex`);
    styleParts.push(
      `flex-direction: ${layout.direction === "row" ? "row" : "column"}`,
    );
  }
  if (layout?.gap != null) {
    styleParts.push(`gap: ${layout.gap}px`);
  }
  if (layout?.align?.main) {
    const map: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
    };
    styleParts.push(
      `justify-content: ${map[layout.align.main] ?? "flex-start"}`,
    );
  }
  if (layout?.align?.cross) {
    const map: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
    };
    styleParts.push(`align-items: ${map[layout.align.cross] ?? "flex-start"}`);
  }

  return {
    tag: "div",
    text: "",
    class: "",
    style: styleParts.join("; "),
    _key: genKey(),
    children,
  };
};

// ---------- VECTOR → пропускаем ----------
const mapVectorNode = (_node: FigmaVectorNode): null => {
  return null;
};

// ---------- универсальный маппер ----------
export const mapFigmaNode = (node: FigmaNode): HtmlNode | null => {
  switch (node.type) {
    case "TEXT":
      return mapTextNode(node as FigmaTextNode);
    case "RECTANGLE":
      return mapRectangleNode(node as FigmaRectangleNode);
    case "GROUP":
    case "FRAME":
      return mapContainerNode(node as FigmaFrameNode | FigmaGroupNode);
    case "VECTOR":
      return mapVectorNode(node as FigmaVectorNode);
    default:
      // неизвестный тип → контейнер с рекурсией, чтобы не терять детей
      return mapContainerNode(node as FigmaBaseNode);
  }
};

export default function figmaJsonToHtmlTree(data: FigmaExport): HtmlNode[] {
  keyCounter = 0;
  const root = data.structure;
  const mappedRoot = mapFigmaNode(root as FigmaNode);
  return mappedRoot ? [mappedRoot] : [];
}
