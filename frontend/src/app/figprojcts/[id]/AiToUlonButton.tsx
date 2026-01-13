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

      const cleaned = data.nodes.map((node) => {
        return cleanNode(node);
      });
      console.log("<==🔹🔹🔹=cleaned ===>", cleaned);

      // const resultToJsonHtml = ensureNodeKeys(cleaned);
      // updateHtmlJson((prev: HtmlNode[]) => [...prev, ...resultToJsonHtml]);
      // router.push("/plaza");
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
