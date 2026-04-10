// useJsonToHtml.ts
"use client";
import { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";

export function useJsonToHtml() {
  const [loading, setLoading] = useState(false);
  const { htmlJson, setHTML, setSCSS, setJS, showModal } = useStateContext();

  const runJsonToHtml = async () => {

    if (!htmlJson || htmlJson.length === 0) {
      setHTML("");
      setSCSS("");
      setJS("");
      return;
    }

    setHTML("");
    setSCSS("");
    setJS("");
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

  return { loading, runJsonToHtml };
}

// ===== использование =====
// const SomeOtherButton = () => {
//   const { loading, runJsonToHtml } = useJsonToHtml();

//   return (
//     <button onClick= { async() => {
//   // твоя логика до
//   await runJsonToHtml();
//   // твоя логика после
// }}>
//   { loading? "Rendering...": "Do stuff + render" }
//   </button>
//   );
// };