"use client";
import { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import HtmlIcon from "@/components/icons/HtmlIcon";
import Spinner from "@/components/icons/Spinner";

export default function JsonToHtmlButton() {
  const [loading, setLoading] = useState(false);

  const { htmlJson, HTML, SCSS, setHTML, setSCSS, setModalMessage } =
    useStateContext();

  const handleClick = async () => {
    if (!htmlJson || htmlJson.length === 0) return;
    setHTML("");
    setSCSS("");
    setLoading(true);

    try {
      const res = await fetch("/api/json-to-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(htmlJson),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.error || "Unknown error");
        return;
      }
      setHTML(data.html);
      setSCSS(data.scss); // уже очищенный scss из роута
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setModalMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary  rounded !text-[12px] !lh-0 w-full  !py-1 center"
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <span>jsonHtml ⇨</span>
          <HtmlIcon width={18} height={18} />
        </>
      )}
    </button>
  );
}
