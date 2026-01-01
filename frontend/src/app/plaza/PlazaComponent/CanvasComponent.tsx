"use client";
import PageHeader from "./PageHeader";
import react, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";

export default function CanvasComponent({ project, renderNode }) {
  const { htmlJson, setHtmlJson, setModalMessage, texts, setTexts } =
    useStateContext();

  useEffect(() => {
    if (!texts) return;

    const mappedTexts = texts.map((text) => ({
      tag: "div",
      text: text.text, // или text.id, если есть
      class: "",
      style: `@include ${text.mixin};`,
      children: [],
    }));

    setHtmlJson((prev) => {
      if (!texts) return prev;
      if (!prev.children) return prev;

      const apply = (root) => {
        const existingTexts = new Set(
          (root.children ?? [])
            .filter((c) => c.tag === "div") // опционально, только текстовые
            .map((c) => c.text), // ключ для уникальности
        );

        const onlyNewTexts = mappedTexts.filter(
          (m) => !existingTexts.has(m.text),
        );

        return {
          ...root,
          children: [...onlyNewTexts, ...(root.children ?? [])],
        };
      };

      if (Array.isArray(prev)) {
        const [root, ...rest] = prev;
        return [apply(root), ...rest];
      }

      return apply(prev);
    });
  }, [texts]);

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mt-4 mb-8 border border-slate-200 ">
      {PageHeader("canvasIcon", "Canvas")}
      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000]"
      >
        {project &&
          (Array.isArray(project)
            ? project.map(renderNode)
            : renderNode(project))}
      </div>
    </div>
  );
}
