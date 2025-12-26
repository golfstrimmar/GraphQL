"use client";
import React, { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

type ProjectData = {
  _key: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  children: ProjectData[] | string;
};

interface TextComponentProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  node: ProjectData;
  updateNodeByKey: (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ) => ProjectData | ProjectData[];
  texts?: string[];
  setModalTextsOpen?: (v: boolean) => void;
}

const TextComponent: React.FC<TextComponentProps> = ({
  setProject,
  node,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const [textValue, setTextValue] = useState("");
  useEffect(() => {
    if (!texts) return;
    console.log("<===texts===>", texts);
  }, [texts]);
  // sync on node change
  useEffect(() => {
    setTextValue(node?.text || "");
  }, [node?._key]);

  // debounce update
  useEffect(() => {
    if (!node?._key) return;

    const id = setTimeout(() => {
      setProject(
        (prev) =>
          updateNodeByKey(prev, node._key, { text: textValue }) as ProjectData,
      );
    }, 400);

    return () => clearTimeout(id);
  }, [textValue, node?._key]);

  return (
    <>
      <div className="flex py-0.5 mt-2 ml-auto -mb-3 w-[max-content] bg-white rounded z-30 !font-bold">
        <span className="rounded inline-block px-2">Text:</span>
      </div>

      <textarea
        ref={(el) => {
          if (!el) return;
          textareaRef.current = el;
          adjustHeight(el);
        }}
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        className="textarea-styles"
      />
    </>
  );
};

export default TextComponent;
