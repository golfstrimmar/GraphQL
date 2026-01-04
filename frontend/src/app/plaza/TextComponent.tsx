"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import ModalTexts from "./ModalTexts";
type NodeToSend = {
  _key: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  children: NodeToSend[] | string;
};

interface TextComponentProps {
  node: NodeToSend;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<NodeToSend>) => void;
}

const TextComponent: React.FC<TextComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { texts } = useStateContext();
  const [modalTextsOpen, setModalTextsOpen] = useState<boolean>(false);
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    if (!node?._key) return;
    setTextValue(node?.text || "");
  }, [node?._key, node?.text]);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (!texts) return;
    console.log("<===texts===>", texts);
  }, [texts]);

  const handleTextChange = (newValue: string) => {
    setTextValue(newValue);
    const id = setTimeout(() => {
      updateNodeByKey(node._key, { text: newValue });
    }, 1000);
    return () => clearTimeout(id);
  };
  return (
    <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
      {/*{modalTextsOpen && (
        <ModalTexts
          node={node}
          project={project}
          modalTextsOpen={modalTextsOpen}
          setModalTextsOpen={setModalTextsOpen}
          setProject={setProject}
        />
      )}
   */}
      <p className={itemClass}>
        <span>Text:</span>
        {texts && texts.length > 0 && setModalTextsOpen && (
          <button
            className="btn-teal  text-[12px]"
            onClick={() =>
              setModalTextsOpen(() => {
                return !modalTextsOpen;
              })
            }
          >
            Texts
          </button>
        )}
      </p>

      <textarea
        ref={(el) => {
          if (!el) return;
          textareaRef.current = el;
          adjustHeight(el);
        }}
        value={textValue}
        onChange={(e) => handleTextChange(e.target.value)}
        className="textarea-styles"
      />
    </div>
  );
};

export default TextComponent;
