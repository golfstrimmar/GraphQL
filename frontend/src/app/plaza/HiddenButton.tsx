"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { HtmlNode } from "@/types/HtmlNode";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function HiddenButton() {
  const { htmlJson, isCollapsedAll, setIsCollapsedAll } = useStateContext();

  const handleToggleNode = (node: HtmlNode, shouldCollapse: boolean) => {
    if (!node._key || !node.children || node.children.length === 0) return;

    const nodeEl = document.querySelector(`[data-key="${node._key}"]`) as HTMLElement;
    if (!nodeEl) return;

    const btn = nodeEl.querySelector(".togle-button") as HTMLButtonElement;

    if (shouldCollapse) {
      if (btn) btn.innerHTML = `${nodeEl.tagName}.${node.class || ""}`;
      nodeEl.classList.add("_hidden");
    } else {
      if (btn) btn.innerHTML = "↕";
      nodeEl.classList.remove("_hidden");
    }
  };

  const walk = (node: HtmlNode, shouldCollapse: boolean) => {
    handleToggleNode(node, shouldCollapse);
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => walk(child, shouldCollapse));
    }
  };

  const toggleAll = () => {
    if (!htmlJson) return;
    const newState = !isCollapsedAll;
    setIsCollapsedAll(newState);

    const tree = Array.isArray(htmlJson) ? htmlJson : [htmlJson];
    tree.forEach((node: HtmlNode) => walk(node, newState));
  };

  const isEmpty = !htmlJson || (Array.isArray(htmlJson) && htmlJson.length === 0);

  return (
    <button
      disabled={isEmpty}
      className={`btn-teal !bg-[var(--navy)] w-full !p-0.25 flex-[20px] center cursor-pointer 
        disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed 
        ${isCollapsedAll ? "opacity-50" : "opacity-100"}`}
      onClick={toggleAll}
    >
      ↕
    </button>
  );
}
