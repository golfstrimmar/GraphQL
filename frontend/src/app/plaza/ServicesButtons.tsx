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
  // bg-black/60 backdrop-blur-lg
  return (
    <div className=" flex items-center flex-col gap-2  ">

      <button
        className="btn-teal !bg-[var(--navy)] w-full !p-0.25 flex-[40px] center   disabled:opacity-50"
        type="button"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <СhevronLeft width={12} height={12} />
      </button>
      <button
        className="btn-teal !bg-[var(--navy)] w-full !p-0.25 flex-[40px] center   disabled:opacity-50"
        type="button"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <СhevronRight width={12} height={12} />
      </button>
      <button
        className="btn-allert btn w-full !p-0.5 !py-1 flex-[40px] center  "
        type="button"
        title="Reset All"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon width={10} height={10} />
      </button>

    </div>
  );
}
