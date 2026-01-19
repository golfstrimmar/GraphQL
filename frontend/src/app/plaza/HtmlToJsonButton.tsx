"use client";

import { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import Spinner from "@/components/icons/Spinner";
import HtmlIcon from "@/components/icons/HtmlIcon";

//=== 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
export default function HtmlToJsonButton() {
  const { HTML, SCSS, setHtmlJson, setModalMessage } = useStateContext();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!HTML) {
      setModalMessage("No HTML");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/html-to-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: HTML, scss: SCSS || "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage("Unknown error");
        return;
      }

      // data.htmlJson → массив HtmlNode
      setHtmlJson(data.htmlJson);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setModalMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-teal   px-1 rounded !text-[12px] !lh-0"
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            <HtmlIcon width={18} height={18} /> <span> ⇨ jsonHtml</span>
          </>
        )}
      </button>
    </div>
  );
}
