"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";

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
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  node: ProjectData;
  updateNodeByKey: (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ) => ProjectData | ProjectData[];
}

const TextComponent: React.FC<TextComponentProps> = ({
  setProject,
  node,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { texts } = useStateContext();
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
    <div className="bg-white relative rounded ml-[55px] flex mt-4">
      <p className="absolute left-[-55px] !font-bold px-2 inline-block z-30 p-1 h-[26px]   text-white  w-[max-content]">
        Text:
      </p>

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
    </div>
  );
};

export default TextComponent;
