"use client";
import React, { useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import cleanServiceTexts from "./utils/cleanServiceTexts";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import MakeHtmlButton from "./MakeHtmlButton";
import HtmlToJsonButton from "./HtmlToJsonButton";
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
  } = useStateContext();

  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
    setHTML("");
    setSCSS("");
  };

  const handleClean = () => {
    cleanServiceTexts(htmlJson, updateHtmlJson);
  };

  return (
    <div className="bg-[var(--lightest-navy)] flex items-center gap-1 mb-1 py-1 ">
      <button
        className="btn btn-allert !py-1"
        type="button"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon width={16} height={16} />
      </button>
      <button
        className="btn-teal   disabled:opacity-50"
        type="button"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <СhevronLeft width={16} height={16} />
      </button>
      <button
        className="btn-teal    disabled:opacity-50 "
        type="button"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <СhevronRight width={16} height={16} />
      </button>
      <button
        className="btn-teal  flex items-center  !gap-2 "
        type="button"
        onClick={() => handleClean()}
      >
        <ClearIcon width={16} height={16} />
        <p className="!text-[12px] !lh-0">remove servises texts</p>
      </button>
      <MakeHtmlButton />
      <HtmlToJsonButton />
    </div>
  );
}
