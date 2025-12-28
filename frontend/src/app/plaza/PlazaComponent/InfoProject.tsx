"use client";
import React, { useEffect, useState, useRef } from "react";
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

type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  children: ProjectData[] | string;
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
const InfoProject: React.FC<InfoProjectProps> = ({
  project,
  setProject,
  setOpenInfoKey,
  openInfoKey,
}) => {
  const { createHtml } = useHtmlFromJson();
  const { createSCSS } = useScssFromJson();
  const { htmlJson } = useStateContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [lastUpdate, setLastUpdate] = useState(0);
  useEffect(() => {
    if (!htmlJson) return;
    const now = Date.now();
    if (now - lastUpdate < 1000) return;
    setLastUpdate(now);
    void createHtml();
    void createSCSS();
  }, [htmlJson, createHtml, createSCSS, lastUpdate]);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    if (!openInfoKey) return;
    console.log("<===openInfoKey===>", openInfoKey);
  }, [openInfoKey]);
  // ================================
  const updateNodeByKey = (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ): ProjectData | ProjectData[] => {
    if (Array.isArray(nodes)) {
      return nodes.map(
        (node) => updateNodeByKey(node, key, changes) as ProjectData,
      );
    }

    if (nodes._key === key) {
      // если в changes есть attributes — аккуратно мержим
      if (changes.attributes) {
        return {
          ...nodes,
          attributes: { ...nodes.attributes, ...changes.attributes },
        };
      }
      return { ...nodes, ...changes };
    }

    if (Array.isArray(nodes.children)) {
      const updatedChildren = nodes.children.map((child) =>
        typeof child === "string"
          ? child
          : (updateNodeByKey(child, key, changes) as ProjectData),
      );
      return { ...nodes, children: updatedChildren };
    }

    return { ...nodes };
  };
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  // ================================
  const infoProject = (node: ProjectData) => {
    if (!node) return;
    const itemClass =
      "absolute top-[-30px] !font-bold  inline-flex items-center gap-2 z-30 py-1 min-h-[26px] text-white w-[max-content]";

    return (
      <AnimatePresence mode="wait">
        {openInfoKey != null && project && (
          <motion.div
            key="info-project"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
            className="bg-navy rounded shadow-xl p-1  border border-slate-200  bottom-0 right-0 transform min-w-[calc(100vw-80px)]  fixed  z-5000"
          >
            <div className="grid grid-cols-[repeat(2_,max-content)_1fr_2fr] relative rounded border-2 border-[var(--teal)] p-1 text-[#000] h-full">
              {/*===============Tag=================  */}
              <TagComponent
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
                itemClass={itemClass}
              />
              {/*===============Class=================  */}
              <ClassComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
                itemClass={itemClass}
              />
              {/*===============Style=================  */}
              <StyleComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
                itemClass={itemClass}
              />
              {/*===============Text=================  */}
              <TextComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
                itemClass={itemClass}
              />
              {/*===============================  */}
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
              )}
              <button
                onClick={() => setOpenInfoKey(null)}
                className="absolute  -top-3 border   bg-slate-200 hover:bg-slate-300 transition-all duration-200   btn-teal w-[90%] left-[50%] translate-x-[-50%] !p-0.5"
              >
                <div className="w-full h-4  center border-2 border-[var(--teal)] rounded bg-[var(--teal-light)]">
                  <СhevronRight width={10} height={10} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  // ================================
  // ================================
  // ================================
  return <div>{infoProject(findNodeByKey(project, openInfoKey))}</div>;
};

export default InfoProject;
