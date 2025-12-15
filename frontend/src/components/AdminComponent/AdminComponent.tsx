"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";

const TagsNamen1 = [
  { tag: "a", color: "#3b82f6" }, // blue
  { tag: "button", color: "#06b6d4" }, // cyan
  { tag: "section", color: "rgb(220, 230, 220)" }, // slate
  { tag: "container", color: "dodgerblue" }, // slate
  { tag: "div", color: "rgb(226, 232, 240)" }, // slate
  { tag: "p", color: "#22c55e" }, // green
  { tag: "span", color: "#8b5cf6" }, // violet
  { tag: "ul", color: "#f97316" }, // orange
  { tag: "li", color: "#eab308" }, // yellow
  { tag: "imgs", color: "#0ea5e9" },
  { tag: "img", color: "#0ea5e9" }, // sky
  { tag: "svg", color: "#06b6d4" }, // cyan
  { tag: "nav", color: "#14b8a6" }, // teal

  { tag: "h1", color: "#ef4444" }, // red
  { tag: "h2", color: "#f97316" }, // orange
  { tag: "h3", color: "#f59e0b" }, // amber
  { tag: "h4", color: "#eab308" }, // yellow
  { tag: "h5", color: "#84cc16" }, // lime
  { tag: "h6", color: "#22c55e" }, // green
];
const TagsNamen2 = [
  { tag: "input", color: "#3b82f6" }, // blue
  { tag: "textarea", color: "#6366f1" }, // indigo
  { tag: "label", color: "#f97316" },
  { tag: "legend", color: "#ec4899" }, // pink
];
const TagsNamen3 = [
  { tag: "article", color: "#14b8a6" }, // teal
  { tag: "aside", color: "#06b6d4" }, // cyan
  { tag: "br", color: "#737373" }, // gray
  { tag: "hr", color: "#71717a" }, // zinc
  { tag: "fieldset", color: "#f43f5e" },
  { tag: "form", color: "#0ea5e9" }, // sky
  { tag: "header", color: "#6366f1" }, // indigo
  { tag: "ol", color: "#f59e0b" }, // amber
  { tag: "option", color: "#a855f7" }, // purple
  { tag: "optgroup", color: "#d946ef" }, // fuchsia
  { tag: "select", color: "#8b5cf6" }, // violet
  { tag: "source", color: "#38bdf8" }, // sky-light
];
const TagsNamen4 = [
  { tag: "section container wrap", color: "powderblue" }, // teal
  { tag: "flex row", color: "powderblue" }, // teal
  { tag: "flex col", color: "powderblue" }, // teal
  { tag: "ul flex row", color: "powderblue" }, // teal
  { tag: "ul flex col", color: "powderblue" }, // teal
];
const TagsNamen5 = [
  { tag: "hero", color: "powderblue" }, // teal
  { tag: "cards section", color: "powderblue" }, // teal
  { tag: "sec", color: "powderblue" }, // teal
];
// =====================================

const AdminComponent = () => {
  const { updateHtmlJson } = useStateContext();
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: name },
    fetchPolicy: "no-cache",
  });
  // =============================
  const handleLoad = async (name: string) => {
    if (!name) return;
    const { data } = await refetchJson({ name });
    const content = data?.jsonDocumentByName?.content;
    if (!content) return;
    updateHtmlJson((prev) => ({
      ...prev,
      children: [
        ...(prev?.children ?? []),
        ...(Array.isArray(content) ? content : [content]),
      ],
    }));
  };
  const renderTags = (TagsNamen) => {
    return (
      <div className="flex flex-wrap gap-1 bg-slate-200  p-2">
        {TagsNamen.map((el, i) => (
          <button
            key={i}
            className={"btn  px-1.5! border-1 border-[#aaa] text-black"}
            style={{ background: el.color }}
            type="button"
            onClick={() => handleLoad(el.tag)}
          >
            {el.tag}
          </button>
        ))}
      </div>
    );
  };
  // =============================
  return (
    <div className="admincomponent">
      {renderTags(TagsNamen1)}
      {renderTags(TagsNamen2)}
      {renderTags(TagsNamen3)}
      <hr className="bordered border-slate-200 my-1 " />
      {renderTags(TagsNamen4)}
      <hr className="bordered border-slate-200 my-1 " />
      {renderTags(TagsNamen5)}
    </div>
  );
};

export default AdminComponent;
