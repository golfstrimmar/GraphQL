"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
import cleanServiceTexts from "./utils/cleanServiceTexts";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import JsonToHtmlButton from "./JsonToHtmlButton";
// import HtmlToJsonButton from "./HtmlToJsonButton";
import ProjectsIcon from "@/components/icons/ProjectsIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import PreviewIcon from "@/components/icons/PreviewIcon";
import { themeManifests } from "./utils/themeManifests";

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function ServicesButtons() {
  const {
    htmlJson,
    resetHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    updateHtmlJson,
    setActiveKey,
    setDragKey,
    setHTML,
    setSCSS,
    setJS,
    HTML, setIsCollapsedAll
  } = useStateContext();

  const [selectedTheme, setSelectedTheme] = React.useState("Neo-Brutalism");
  const [isStylizing, setIsStylizing] = React.useState(false);

  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
    setHTML("");
    setSCSS("");
    setJS("");
    setIsCollapsedAll(false);
  };

  const handleClean = () => {
    cleanServiceTexts(htmlJson, updateHtmlJson);
  };

  const handleStylize = async () => {
    if (htmlJson.length === 0) return;

    setIsStylizing(true);
    try {
      const res = await fetch("/api/ai-style-harmonize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlJson, themeName: selectedTheme }),
      });
      const data = await res.json();
      if (data.nodes) {
        updateHtmlJson(data.nodes);
        console.log("🤖 AI Harmonization complete!");
      }
    } catch (e) {
      console.error("AI Stylize failed:", e);
    } finally {
      setIsStylizing(false);
    }
  };

  return (
    <div className="bg-[var(--navi)] flex items-center gap-1 mb-1 px-1 ">
      <button
        className="btn btn-allert !py-1"
        type="button"
        title="Reset All"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon width={12} height={12} />
      </button>
      <button
        className="btn-teal   disabled:opacity-50"
        type="button"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <СhevronLeft width={12} height={12} />
      </button>
      <button
        className="btn-teal    disabled:opacity-50 "
        type="button"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <СhevronRight width={12} height={12} />
      </button>

      {/* --- STYLIZE SECTION ---
      <div className="flex bg-[#1a1a1a] rounded mx-2 border border-[#444]">
        <select
          className="bg-transparent text-white text-[10px] px-2 outline-none cursor-pointer hover:bg-[#333] h-[28px]"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          {Object.keys(themeManifests).map(t => (
            <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
          ))}
        </select>
        <button
          className={`btn-teal !rounded-none border-l border-[#444] w-[max-content] flex items-center gap-2 px-3 ${isStylizing ? 'animate-pulse' : ''}`}
          type="button"
          disabled={isStylizing || htmlJson.length === 0}
          onClick={handleStylize}
        >
          <p className="!text-[10px] uppercase font-bold tracking-wider ">
            {isStylizing ? "Processing..." : "Stylize"}
          </p>
        </button>
      </div>*/}

      <button
        className="btn-teal flex-[1_0_140px]  flex items-center  !gap-2 "
        type="button"
        onClick={() => handleClean()}
      >
        <ClearIcon width={12} height={12} />
        <p className="!text-[10px] !lh-0">remove servises texts</p>
      </button>
      {/*-------------*/}
      <div className="flex-[60%] ">
        <JsonToHtmlButton />
      </div>
      {/*------отложено! обратная генерация в htmlJson-------*/}
      {/*{HTML.length > 0 && <HtmlToJsonButton />}*/}

      {/*-------------*/}
      <hr className="border-2-[var(--grey-40)]  w-[25px] rotate-90" />
      <button
        className="btn-teal flex-[40px] center"
        type="button"
        onClick={() => {
          const el = document.getElementById("preview-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
      >
        <PreviewIcon width={12} height={12} />
      </button>
      <button
        className="btn-teal  flex-[40px] center"
        type="button"
        onClick={() => {
          const el = document.getElementById("canvas-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
      >
        <WorkerIcon width={12} height={12} />
      </button>
      <button
        className="btn-teal    flex-[40px] center"
        type="button"
        onClick={() => {
          const el = document.getElementById("projects-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
      >
        <ProjectsIcon width={12} height={12} />
      </button>
    </div>
  );
}
