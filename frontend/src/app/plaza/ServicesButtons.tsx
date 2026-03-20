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

    HTML,
  } = useStateContext();

  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
    setHTML("");
    setSCSS("");
    setJS("");
  };

  const handleClean = () => {
    cleanServiceTexts(htmlJson, updateHtmlJson);
  };

  return (
    <div className="bg-[var(--navi)] flex items-center gap-1 mb-1 py-1 ">
      <button
        className="btn btn-allert !py-1"
        type="button"
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
      <button
        className="btn-teal flex-[1_0_140px]  flex items-center  !gap-2 "
        type="button"
        onClick={() => handleClean()}
      >
        <ClearIcon width={12} height={12} />
        <p className="!text-[10px] !lh-0">remove servises texts</p>
      </button>
      {/*-------------*/}
      <div className="flex-[50%] center">
        <JsonToHtmlButton />
      </div>
      {/*------отложено! обратная генерация в htmlJson-------*/}
      {/*{HTML.length > 0 && <HtmlToJsonButton />}*/}

      {/*-------------*/}
      <hr className="border-2-[var(--grey-40)]  w-[25px] rotate-90" />
      <button
        className="btn-teal flex-[140px] center"
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
        className="btn-teal  flex-[140px] center"
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
        className="btn-teal    flex-[140px] center"
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
