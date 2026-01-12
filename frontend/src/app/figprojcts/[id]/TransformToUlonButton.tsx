"use client";
import { useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import type { HtmlNode } from "@/types/HtmlNode";
import { ensureNodeKeys } from "@/app/plaza/utils/ensureNodeKeys";

export function TransformToUlonButton({ fileCache }: { fileCache: any }) {
  const { updateHtmlJson, setModalMessage } = useStateContext();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
      console.log("<=🛑🛑🛑=====>", data.nodes);
      const resultToJsonHtml = ensureNodeKeys(data.nodes);
      updateHtmlJson((prev: HtmlNode[]) => {
        return [...prev, ...resultToJsonHtml];
      });
      router.push("/plaza");
    });
  };

  return (
    <button
      className="btn btn-empty px-2 self-end ml-auto !text-[var(--teal)]"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "Transforming..." : "Ai to ULON Project"}
    </button>
  );
}
