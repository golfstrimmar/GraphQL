"use client";
import React, { useEffect, useRef, useState } from "react";
import type { HtmlNode } from "@/types/HtmlNode";

interface TagComponentProps {
  node: HtmlNode;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
const TagComponent: React.FC<TagComponentProps> = ({
  node,
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
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return (
    <div className="unitStyle">
      <h6 className="my-1">Tag:</h6>
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
