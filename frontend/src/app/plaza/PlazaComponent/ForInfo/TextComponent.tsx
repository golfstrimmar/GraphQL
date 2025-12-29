"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import ModalTexts from "./ModalTexts";
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
  itemClass: string;
}

const TextComponent: React.FC<TextComponentProps> = ({
  setProject,
  project,
  node,
  updateNodeByKey,
  itemClass,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { texts } = useStateContext();
  const [modalTextsOpen, setModalTextsOpen] = useState<boolean>(false);
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
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
    }, 1000);

    return () => clearTimeout(id);
  }, [textValue, node?._key]);

  return (
    <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
      {modalTextsOpen && (
        <ModalTexts
          node={node}
          project={project}
          modalTextsOpen={modalTextsOpen}
          setModalTextsOpen={setModalTextsOpen}
          setProject={setProject}
        />
      )}

      <p className={itemClass}>
        <span>Text:</span>
        {/*{texts && texts.length > 0 && setModalTextsOpen && (*/}
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
        {/*)}*/}
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
