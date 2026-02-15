"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import { motion, AnimatePresence } from "framer-motion";
import СhevronRight from "@/components/icons/СhevronRight";
import StyleComponent from "./forNodeInfo/StyleComponent";
import ClassComponent from "./forNodeInfo/ClassComponent";
import TextComponent from "./forNodeInfo/TextComponent";
import TagComponent from "./forNodeInfo/TagComponent";
import { useHtmlFromJson } from "@/hooks/useHtmlFromJson";
import { useScssFromJson } from "@/hooks/useScssFromJson";
import { useStateContext } from "@/providers/StateProvider";
import CreateIcon from "@/components/icons/CreateIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import ClearIcon from "@/components/icons/ClearIcon";
import { useRouter } from "next/navigation";
import JsonToHtmlButton from "./JsonToHtmlButton";
import ProjectsIcon from "@/components/icons/ProjectsIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import PreviewIcon from "@/components/icons/PreviewIcon";
import type { HtmlNode } from "@/types/HtmlNode";
import Image from "next/image";

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

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
const NodeInfo: React.FC<InfoProjectProps> = ({
  openInfoModal,
  setOpenInfoModal,
  setActiveKey,
}) => {
  const router = useRouter();
  const {
    htmlJson,
    activeKey,
    resetHtmlJson,
    updateHtmlJson,
    setDragKey,
    setHTML,
    setSCSS,
  } = useStateContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [Open, setOpen] = useState<boolean>(false);
  const [NodeToSend, setNodeToSend] = useState<HtmlNode | null>(null);
  const [localAttrs, setLocalAttrs] = useState(NodeToSend?.attributes ?? {});
  const attrTimeoutsRef = useRef<Record<string, number | undefined>>({});
  // ====>====>====>====>====>====>====>====>====>====>
  // синхронизируемся, когда NodeToSend сменился (другая нода)
  useEffect(() => {
    setLocalAttrs(NodeToSend?.attributes ?? {});
  }, [NodeToSend?._key]); // важно: по ключу, а не по всему объекту
  // -------------
  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
    setHTML("");
    setSCSS("");
  };
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
    console.log("<=🚀🚀🚀==node=🚀🚀🚀=>", node);
  }, [activeKey, htmlJson]);
  // ================================
  const updateNodeByKey = (key: string, changes: Partial<HtmlNode>) => {
    updateHtmlJson((prev) => {
      const updateRecursively = (nodes: HtmlNode[]): HtmlNode[] => {
        return nodes.map((node) => {
          if (node._key === key) {
            return { ...node, ...changes };
          }
          if (Array.isArray(node.children)) {
            return { ...node, children: updateRecursively(node.children) };
          }
          return node;
        });
      };
      return updateRecursively(prev);
    });
  };
  // ====>====>====>====>====>====>====>====>====>====>
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const itemStyle =
    "flex flex-col items-start justify-center p-2 m-1 border border-gray-300 rounded bg-gray-100 text-sm";
  const itemClass =
    "absolute top-[-25px] !font-bold  inline-flex items-center gap-2 z-30 py-1 min-h-[26px] text-white w-[max-content]";

  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <AnimatePresence mode="wait">
      {activeKey && (
        <motion.div
          key="info-project"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
          className="bg-[var(--navi-admin)]   p-1 pt-8   bottom-0 left-0 transform w-[calc(100vw-10px)] min-h-[188px]  max-h-[370px] overflow-y-auto  fixed  z-6000"
          style={{
            borderTop: "3px solid var(--teal)",
          }}
        >
          <div className="flex gap-1 w-[calc(100%-10px)] absolute top-0 left-1  !py-0.5 z-10">
            <button
              className="btn btn-allert !py-1 flex-[40px]"
              type="button"
              onClick={() => {
                resetAll();
              }}
            >
              <ClearIcon width={16} height={16} />
            </button>
            <button
              className="btn btn-primary  flex-[40px]"
              onClick={() => setActiveKey(null)}
            >
              <Image
                src="./svg/cross-com.svg"
                alt="close"
                width={15}
                height={15}
              />
            </button>
            <div className="flex-[70%]">
              <JsonToHtmlButton />
            </div>
            <button
              className="btn-teal flex-[140px] center"
              type="button"
              onClick={() => {
                const el = document.getElementById("preview-section");
                if (el) {
                  const y =
                    el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              <PreviewIcon width={18} height={18} />
            </button>
            <button
              className="btn-teal  flex-[140px] center"
              type="button"
              onClick={() => {
                const el = document.getElementById("canvas-section");
                if (el) {
                  const y =
                    el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              <WorkerIcon width={16} height={16} />
            </button>
            <button
              className="btn-teal  flex-[140px] center"
              type="button"
              onClick={() => {
                const el = document.getElementById("projects-section");
                if (el) {
                  const y =
                    el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              <ProjectsIcon width={16} height={16} />
            </button>
          </div>

          <div className="grid grid-cols-[repeat(2_,max-content)_1fr_1fr] relative rounded border-2 border-[var(--teal)] p-1 pt-6  text-[#000] w-full h-full">
            {/*===============Tag=================*/}
            <TagComponent
              node={NodeToSend}
              itemClass={itemClass}
              updateNodeByKey={updateNodeByKey}
            />
            {/*===============Class=================*/}
            <ClassComponent
              node={NodeToSend}
              itemClass={itemClass}
              updateNodeByKey={updateNodeByKey}
            />
            {/*===============Style=================*/}
            <StyleComponent
              node={NodeToSend}
              itemClass={itemClass}
              updateNodeByKey={updateNodeByKey}
            />
            {/*===============Tag=================*/}
            <TextComponent
              node={NodeToSend}
              itemClass={itemClass}
              updateNodeByKey={updateNodeByKey}
            />
            {NodeToSend?.tag === "img" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className={itemClass}>
                  <span>Src:</span>
                </p>
                <textarea
                  value={NodeToSend?.attributes?.src || ""}
                  ref={(el) => {
                    if (!el) return;
                    textareaRef.current = el;
                    adjustHeight(el);
                  }}
                  onChange={(e) => {
                    updateNodeByKey(NodeToSend._key, {
                      attributes: { src: e.target.value },
                    });
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}

            {/* {node?.tag === "input" && (
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

          {NodeToSend?.attributes &&
            Object.keys(NodeToSend.attributes).length > 0 && (
              <div className="flex gap-2 mt-6 rounded border-2 border-[var(--teal)] p-1 pt-6 text-[#000]">
                {Object.entries(localAttrs).map(([k, value]) => (
                  <div
                    key={k}
                    className="bg-white  flex-[0_1_100%] flex flex-col relative rounded max-h-[min-content] "
                  >
                    <p className={itemClass}>{k}:</p>
                    <textarea
                      value={String(value)}
                      ref={(el) => {
                        if (!el) return;
                        textareaRef.current = el;
                        adjustHeight(el);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        adjustHeight(e.target);

                        // 1. сразу обновляем локальный стейт — курсор остаётся
                        setLocalAttrs((prev) => ({
                          ...prev,
                          [k]: val,
                        }));

                        // 2. дебаунсим обновление дерева
                        const timeouts = attrTimeoutsRef.current;
                        if (timeouts[k]) {
                          clearTimeout(timeouts[k]);
                        }

                        timeouts[k] = window.setTimeout(() => {
                          updateNodeByKey(NodeToSend._key, {
                            attributes: {
                              ...NodeToSend.attributes,
                              [k]: val,
                            },
                          });
                        }, 300);
                      }}
                      className="textarea-styles"
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeInfo;
