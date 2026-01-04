"use client";
import React, { useEffect, useRef, useState } from "react";
type NodeToSend = {
  _key: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  children: NodeToSend[] | string;
};

interface TagComponentProps {
  node: NodeToSend;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<NodeToSend>) => void;
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹

const TagComponent: React.FC<TagComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tagValue, setTagValue] = useState(node.tag);

  useEffect(() => {
    if (!node.tag) return;
    console.log("<===node.tag===>", node.tag);
    setTagValue(node.tag);
  }, [node.tag]);

  const handleTagChange = (newValue: string) => {
    setTagValue(newValue);
    updateNodeByKey(node._key, { tag: newValue });
  };

  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  return (
    <div className="bg-white flex flex-col relative rounded max-h-[min-content] mt-10">
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
