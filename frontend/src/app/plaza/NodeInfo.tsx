"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import { motion, AnimatePresence } from "framer-motion";
import СhevronRight from "@/components/icons/СhevronRight";
import StyleComponent from "./ForInfo/StyleComponent";
import ClassComponent from "./ForInfo/ClassComponent";
import TextComponent from "./ForInfo/TextComponent";
import TagComponent from "./ForInfo/TagComponent";
import { useHtmlFromJson } from "@/hooks/useHtmlFromJson";
import { useScssFromJson } from "@/hooks/useScssFromJson";
import { useStateContext } from "@/providers/StateProvider";
import CreateIcon from "@/components/icons/CreateIcon";
import { useRouter } from "next/navigation";

type HtmlNode = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: HtmlNode[] | string;
};

interface InfoProjectProps {
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  project: ProjectData;
  setOpenInfoKey: React.Dispatch<React.SetStateAction<string>>;
  openInfoKey: string;
  setModalTextsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
}
interface InfoProjectProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
}
const NodeInfo: React.FC<InfoProjectProps> = ({
  openInfoModal,
  setOpenInfoModal,
}) => {
  const router = useRouter();
  const { activeKey, htmlJson } = useStateContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [Open, setOpen] = useState<boolean>(false);
  const [NodeToSend, setNodeToSend] = useState<HtmlNode | null>(null);
  // -------------

  // -------------
  useEffect(() => {
    console.log("<==!!!=activeKey===>", activeKey);
    if (!activeKey) {
      setNodeToSend("");
      setOpenInfoModal(false);
      return;
    }

    const node = findNodeByKey(htmlJson, activeKey);
    if (node) {
      setNodeToSend(node);
    }
  }, [activeKey]);
  // -------------

  const itemStyle =
    "flex flex-col items-start justify-center p-2 m-1 border border-gray-300 rounded bg-gray-100 text-sm";

  return (
    <AnimatePresence mode="wait">
      {activeKey && (
        <motion.div
          key="info-project"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
          className="bg-navy rounded shadow-xl p-1  border border-slate-200  bottom-0 right-0 transform w-[calc(100vw-20px)]  fixed  z-5000"
        >
          <div className="grid grid-cols-[repeat(3_,max-content)_1fr] relative rounded border-2 border-[var(--teal)] p-1 text-[#000] h-full">
            {/*<button
              onClick={() => setOpenInfoModal(false)}
              className="absolute  -top-3 border   bg-slate-200 hover:bg-slate-300 transition-all duration-200   btn-teal w-[90%] left-[50%] translate-x-[-50%] !p-0.5"
            >
              <div className="w-full h-4  center border-2 border-[var(--teal)] rounded bg-[var(--teal-light)]">
                <СhevronRight width={10} height={10} />
              </div>
            </button>*/}
            <p className={itemStyle}>{NodeToSend?.tag}</p>
            <p className={itemStyle}>{NodeToSend?.class}</p>
            <p className={itemStyle}>{NodeToSend?.text}</p>
            <p className={itemStyle}>{NodeToSend?.style}</p>
            {/*===============Tag=================
            <TagComponent
              setProject={setProject}
              node={node}
              updateNodeByKey={updateNodeByKey}
              itemClass={itemClass}
            />
            <ClassComponent
              project={project}
              setProject={setProject}
              node={node}
              updateNodeByKey={updateNodeByKey}
              itemClass={itemClass}
            />
            <StyleComponent
              project={project}
              setProject={setProject}
              node={node}
              updateNodeByKey={updateNodeByKey}
              itemClass={itemClass}
            />
            <TextComponent
              project={project}
              setProject={setProject}
              node={node}
              updateNodeByKey={updateNodeByKey}
              itemClass={itemClass}
            />
            {node?.tag === "img" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>Src:</span>
                </p>
                <textarea
                  value={node?.attributes?.src || ""}
                  ref={(el) => {
                    if (!el) return;
                    textareaRef.current = el;
                    adjustHeight(el);
                  }}
                  onChange={(e) => {
                    const updatedProject = updateNodeByKey(
                      project,
                      node._key,
                      {
                        attributes: { src: e.target.value },
                      },
                    );
                    setProject(updatedProject as ProjectData);
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}
            {node?.tag === "input" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>Id:</span>
                </p>
                <textarea
                  value={node?.attributes?.id || ""}
                  onChange={(e) => {
                    const updatedProject = updateNodeByKey(
                      project,
                      node._key,
                      {
                        attributes: { id: e.target.value },
                      },
                    );
                    setProject(updatedProject as ProjectData);
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}
            {node?.tag === "label" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>For:</span>
                </p>
                <textarea
                  value={node?.attributes?.for || ""}
                  onChange={(e) => {
                    const updatedProject = updateNodeByKey(
                      project,
                      node._key,
                      {
                        attributes: { for: e.target.value },
                      },
                    );
                    setProject(updatedProject as ProjectData);
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}{" "}
            {node?.tag === "a" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>Href:</span>
                </p>
                <textarea
                  value={node?.attributes?.href || ""}
                  onChange={(e) => {
                    const updatedProject = updateNodeByKey(
                      project,
                      node._key,
                      {
                        attributes: { href: e.target.value },
                      },
                    );
                    setProject(updatedProject as ProjectData);
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}{" "}
            {node?.tag === "a" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>Rel:</span>
                </p>
                <textarea
                  value={node?.attributes?.rel || ""}
                  onChange={(e) => {
                    const updatedProject = updateNodeByKey(
                      project,
                      node._key,
                      {
                        attributes: { rel: e.target.value },
                      },
                    );
                    setProject(updatedProject as ProjectData);
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
              )}*/}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeInfo;
