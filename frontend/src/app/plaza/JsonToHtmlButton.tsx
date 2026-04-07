"use client";
import { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import HtmlIcon from "@/components/icons/HtmlIcon";
import Spinner from "@/components/icons/Spinner";


type JsonToHtmlButtonProps = {
  cN?: string;
};

export default function JsonToHtmlButton({ cN = "py-0.75" }: JsonToHtmlButtonProps) {
  const [loading, setLoading] = useState(false);

  const { htmlJson, updateHtmlJson, setHTML, setSCSS, setJS, showModal } =
    useStateContext();
  // ===>===>===>===>===>===>===>===>===>===>
  const handleClick = async () => {
    if (!htmlJson || htmlJson.length === 0) {
      setHTML("");
      setSCSS("");
      setJS("");
      setLoading(false);
      return;
    }

    setHTML("");
    setSCSS("");
    setJS("");
    setLoading(true);

    // очистка дубликатов style по text
    // const styleNodes = htmlJson.filter((n) => n.tag === "style");
    // const nonStyleNodes = htmlJson.filter((n) => n.tag !== "style");

    // const map = new Map<string, (typeof styleNodes)[number]>();
    // for (const item of styleNodes) {
    //   if (!map.has(item.text)) {
    //     map.set(item.text, item);
    //   }
    // }
    // const uniqueStyleNodes = Array.from(map.values());
    // const cleanedHtmlJson = [...nonStyleNodes, ...uniqueStyleNodes];

    //  сохранить очищенное в провайдер
    // updateHtmlJson(cleanedHtmlJson);

    try {
      const res = await fetch("/api/json-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(htmlJson),
      });

      const data = await res.json();
      if (!res.ok) {
        showModal(data.error || "Unknown error", "error");
        return;
      }

      setHTML(data.html);
      setSCSS(data.scss);
      if (data.js !== undefined) setJS(data.js);
      const el = document.getElementById("preview-section");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      showModal(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn-primary  font-bold text-slate-800 rounded !text-[12px] !lh-0 w-full !px-0 !py-0.75  center ${cN} ${loading ? "admin-shimmer--red" : ""}`}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* <span>jsonHtml ⇨</span> */}
          <HtmlIcon width={14} height={14} />
        </>
      )}
    </button>
  );
}
