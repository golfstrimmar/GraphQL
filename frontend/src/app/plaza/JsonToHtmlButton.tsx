"use client";
import { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import HtmlIcon from "@/components/icons/HtmlIcon";
import Spinner from "@/components/icons/Spinner";

export default function JsonToHtmlButton() {
  const [loading, setLoading] = useState(false);

  const { htmlJson, HTML, SCSS, setHTML, setSCSS, showModal } =
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
        showModal(data.error || "Unknown error", "error");
        return;
      }
      setHTML(data.html);
      setSCSS(data.scss);
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
