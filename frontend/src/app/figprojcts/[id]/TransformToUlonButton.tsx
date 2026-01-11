"use client";
import { useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import type { HtmlNode } from "@/types/HtmlNode";

export function TransformToUlonButton({ fileCache }: { fileCache: any }) {
  const { updateHtmlJson } = useStateContext();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!fileCache) return;
    console.log("<===fileCache===>", fileCache);
  }, [fileCache]);
  const handleClick = () => {
    startTransition(async () => {
      const res = await fetch("/api/ai-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileCache),
      });
      console.log("<=🛑🛑🛑==res===>", res);

      if (!res.ok) {
        console.error("ai-to-html failed");
        return;
      }

      const data: { nodes: HtmlNode[] } = await res.json();
      updateHtmlJson(data.nodes);
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
