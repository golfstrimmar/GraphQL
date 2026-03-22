"use client";
import React, { useEffect, useRef, useState } from "react";
import type { HtmlNode } from "@/types/HtmlNode";

interface TagComponentProps {
  node: HtmlNode;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹

const TagComponent: React.FC<TagComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tagValue, setTagValue] = useState("");

  useEffect(() => {
    console.log("<===node===>", node);
    if (!node) return;
    setTagValue(node?.tag);
  }, [node]);

  const handleTagChange = (newValue: string) => {
    setTagValue(newValue);
    if (node._key) {
      updateNodeByKey(node._key, { tag: newValue });
    }
  };

  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  return (
    <div className="bg-white flex flex-col relative rounded max-h-[min-content] ">
      <p className={itemClass}>Tag:</p>
      <input
        ref={inputRef}
        value={tagValue}
        onChange={(e) => handleTagChange(e.target.value)}
        className="textarea-styles"
      />
    </div>
  );
};

export default TagComponent;
