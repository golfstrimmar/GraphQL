"use client";
import { useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import type { HtmlNode } from "@/types/HtmlNode";
import { ensureNodeKeys } from "@/app/plaza/utils/ensureNodeKeys";
import Spinner from "@/components/icons/Spinner";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export function AiToUlonButton({ fileCache }: { fileCache: any }) {
  const { texts, updateHtmlJson, setModalMessage } = useStateContext();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // ------------------------

  useEffect(() => {
    if (!texts) return;
    console.log("<==🔹🟢=texts===>", texts);
  }, [texts]);

  // ------------------------
  const cleanTextAlignCenter = (style?: string) => {
    if (!style) return style;

    const cleaned = style
      .replace(/text-align\s*:\s*center\s*;?/gi, "")
      .replace(/text-align\s*:\s*left\s*;?/gi, "")
      .replace(/text-align\s*:\s*right\s*;?/gi, "");

    return (
      cleaned
        .replace(/;;+/g, ";")
        .replace(/\s{2,}/g, " ")
        .trim() || undefined
    );
  };
  // ------------------------------
  const cleanNode = (node: HtmlNode): HtmlNode => {
    const cleanedStyle = cleanTextAlignCenter(node.style);

    return {
      ...node,
      ...(cleanedStyle ? { style: cleanedStyle } : {}),
      children: node.children?.map(cleanNode) ?? [],
    };
  };

  // извлекаем все вхождения color-подобных значений из style
  const extractColorsFromStyle = (style: string): string[] => {
    const colors: string[] = [];

    // rgb(...) / rgba(...)
    const rgbRegex = /(rgb[a]?\([^;]+?\))/gi;
    let m: RegExpExecArray | null;
    while ((m = rgbRegex.exec(style)) !== null) {
      colors.push(m[1]);
    }

    // hex типа #adadad или #aaa
    const hexRegex = /(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))/g;
    while ((m = hexRegex.exec(style)) !== null) {
      colors.push(m[1]);
    }

    return colors;
  };

  // заменяем конкретное значение цвета на переменную
  const replaceColorInStyle = (
    style: string,
    from: string,
    to: string,
  ): string =>
    style.replace(
      new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      to,
    );
  const extractAndReplaceColors = (
    nodes: HtmlNode[],
  ): { nodes: HtmlNode[]; colors: ColorVar[] } => {
    const colorMap = new Map<string, string>(); // value -> $color-N

    const getColorVarName = (value: string): string => {
      if (colorMap.has(value)) return colorMap.get(value)!;
      const idx = colorMap.size + 1;
      const name = `$color-${idx}`;
      colorMap.set(value, name);
      return name;
    };

    const processNode = (node: HtmlNode): HtmlNode => {
      let next: HtmlNode = { ...node };

      if (next.style) {
        const foundColors = extractColorsFromStyle(next.style);

        let newStyle = next.style;

        for (const color of foundColors) {
          const varName = getColorVarName(color);
          newStyle = replaceColorInStyle(newStyle, color, varName);
        }

        next = { ...next, style: newStyle };
      }

      if (next.children && next.children.length) {
        next = {
          ...next,
          children: next.children.map(processNode),
        };
      }

      return next;
    };

    const processedNodes = nodes.map(processNode);

    const colors: ColorVar[] = Array.from(colorMap.entries()).map(
      ([value, name]) => ({ name, value }),
    );

    return { nodes: processedNodes, colors };
  };

  // ------------------------------
  const handleClick = () => {
    startTransition(async () => {
      const res = await fetch("/api/ai-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileCache),
      });

      if (!res.ok) {
        console.error("ai-to-html failed");
        setModalMessage("Ai to html failed");
        return;
      }

      const data: { nodes: HtmlNode[] } = await res.json();
      console.log("<==🔹🔹🔹=data===>", data);
      const cleaned = data.nodes.map((node) => {
        return cleanNode(node);
      });
      console.log("<==🔹🔹🔹=cleaned ===>", cleaned);
      const { nodes: withColorVars, colors } = extractAndReplaceColors(cleaned);
      console.log("<=🔹=withColorVars===>", withColorVars);
      console.log("<=🔹==colors===>", colors);
      const resultToJsonHtml = ensureNodeKeys(cleaned);
      updateHtmlJson((prev: HtmlNode[]) => [...prev, ...resultToJsonHtml]);
      router.push("/plaza");
    });
  };
  // ---// ---// ---// ---// ---// ---
  return (
    <button
      className="btn btn-empty px-2 self-end ml-auto !text-[var(--teal)]"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <Spinner /> : "Ai to ULON Project"}
    </button>
  );
}
