"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
import cleanServiceTexts from "./cleanServiceTexts";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
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
  } = useStateContext();

  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
  };

  const handleClean = () => {
    cleanServiceTexts(htmlJson, updateHtmlJson);
  };
  return (
    <div className="bg-slate-200 flex items-center gap-1 mb-1">
      <button
        className="btn btn-allert !py-1"
        type="button"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon width={10} height={10} />
      </button>
      <button
        className="btn-teal   disabled:opacity-50"
        type="button"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <СhevronLeft width={10} height={10} />
      </button>
      <button
        className="btn-teal    disabled:opacity-50 "
        type="button"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <СhevronRight width={10} height={10} />
      </button>
      <button
        className="btn-teal  flex items-center  !gap-2 "
        type="button"
        onClick={() => handleClean()}
      >
        <ClearIcon width={10} height={10} />
        <p className="!text-[12px] !lh-0">servises texts</p>
      </button>
    </div>
  );
}
