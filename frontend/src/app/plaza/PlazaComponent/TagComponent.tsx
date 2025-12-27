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

interface TagComponentProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  node: ProjectData;
  updateNodeByKey: (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ) => ProjectData | ProjectData[];
}

const TagComponent: React.FC<TagComponentProps> = ({
  project,
  setProject,
  node,
  updateNodeByKey,
  createHtml,
  createSCSS,
}) => {
  const { htmlJson } = useStateContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tagValue, setTagValue] = useState("");
  const [lastUpdate, setLastUpdate] = useState(0);
  // useEffect(() => {
  //   if (!htmlJson) return;
  //   const now = Date.now();
  //   if (now - lastUpdate < 800) return;
  //   setLastUpdate(now);
  //   void createHtml();
  //   void createSCSS();
  // }, [htmlJson, createHtml, createSCSS, lastUpdate]);
  // sync on node change
  useEffect(() => {
    setTagValue(node?.tag || "");
  }, [node?._key]);

  // debounce update
  useEffect(() => {
    if (!node?._key) return;

    const id = setTimeout(() => {
      setProject(
        (prev) =>
          updateNodeByKey(prev, node._key, { tag: tagValue }) as ProjectData,
      );
    }, 200);

    return () => clearTimeout(id);
  }, [tagValue, node?._key]);

  return (
    <div className="bg-white relative rounded ml-[55px]  mt-4">
      <p className="absolute left-[-55px] !font-bold px-2 inline-block z-30 p-1 h-[26px]   text-white  w-[max-content]">
        Tag:
      </p>

      <input
        ref={inputRef}
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
        className="textarea-styles"
      />
    </div>
  );
};

export default TagComponent;
