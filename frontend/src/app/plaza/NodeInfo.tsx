"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { findNodeByKey } from "@/utils/findNodeByKey";
import { motion, AnimatePresence } from "framer-motion";
import СhevronRight from "@/components/icons/СhevronRight";
import TagComponent from "./forNodeInfo/TagComponent";
import ClassComponent from "./forNodeInfo/ClassComponent";
import TextComponent from "./forNodeInfo/TextComponent";
import StyleComponent from "./forNodeInfo/StyleComponent";
import ModStyleComponent from "./forNodeInfo/ModStyleComponent";
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

interface NodeInfoProps {
  openInfoModal: boolean;
  setOpenInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveKey: (key: string | null) => void;
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
const NodeInfo: React.FC<NodeInfoProps> = ({
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
    setJS, setIsCollapsedAll
  } = useStateContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [nodeToSend, setNodeToSend] = useState<HtmlNode | null>(null);
  const [localAttrs, setLocalAttrs] = useState(nodeToSend?.attributes ?? {});
  const attrTimeoutsRef = useRef<Record<string, any>>({});
  const [modClass, setModClass] = useState<string>('');
  const [styleText, setStyleText] = useState<string>("");
  const [modStyleText, setModStyleText] = useState<string>('');
  const [fullStyle, setFullStyle] = useState<string>('');
  // ====>====>====>====>====>====>====>====>====>====>
  // синхронизируемся, когда NodeToSend сменился (другая нода)
  useEffect(() => {
    setLocalAttrs(nodeToSend?.attributes ?? {});
  }, [nodeToSend?._key]); // важно: по ключу, а не по всему объекту
  // -------------
  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
    setHTML("");
    setSCSS(""); setJS("");
    setIsCollapsedAll(false);
  };
  // -------------
  useEffect(() => {
    if (!activeKey) {
      setNodeToSend(null);
      setOpenInfoModal(false);
      return;
    }
    const node = findNodeByKey(htmlJson, activeKey);
    if (node) {
      setNodeToSend(node);
    }
  }, [activeKey, htmlJson]);
  // ================================
  const splitStyles = (fullStyle: string) => {
    if (!fullStyle) return { base: "", mods: "", modClass: "" };

    // 1. Находим блок модификатора целиком (&--name { ... })
    const modifierRegex = /(&--[^{]+\{[^}]+\})/;
    const match = fullStyle.match(modifierRegex);

    let mods = "";
    let MClass = "";

    if (match) {
      mods = match[0]; // Весь текст блока

      // 2. Извлекаем только имя (то, что между &-- и началом скобки {)
      const nameMatch = mods.match(/&--([^{ \s]+)/);
      if (nameMatch) {
        MClass = nameMatch[1]; // Например: "active"
      }
    }

    // 3. Убираем блок модификатора из основной строки, чтобы оставить чистые стили
    const base = fullStyle.replace(modifierRegex, "").trim();

    // 4. Форматируем базовые стили: каждое свойство на новой строке
    const baseFormatted = base
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(";\n");

    if (MClass) setModClass(MClass || '');

    return {
      base: baseFormatted ? baseFormatted + ";" : "",
      mods: mods,      // Весь блок стилей для второго редактора

    };
  };
  // ================================
  useEffect(() => {
    if (!nodeToSend) return;
    const rawStyle = nodeToSend.style || "";
    const { base, mods } = splitStyles(rawStyle);
    setStyleText(base);
    setModStyleText(mods);
  }, [nodeToSend]);
  // useEffect(() => {
  //   if (!styleText) return;
  //   console.log('<=🔹🟢🔹🟢==styleText===>', styleText);
  //   updateNodeByKey(nodeToSend?._key, { style: styleText });
  // }, [styleText]);

  // ================================
  // useEffect(() => {
  //   if (!styleText) return;
  //   console.log('<==🔹🟢🔹🟢==styleText==🟢🔹==>', styleText);
  //   setFullStyle(`${styleText}\n${modStyleText}`);
  // }, [styleText]);
  // useEffect(() => {
  //   if (!modStyleText) return;
  //   console.log('<==🔹🟢🔹🟢==modStyleText==🟢🔹==>', modStyleText);
  //   updateNodeByKey(nodeToSend?._key, { style: styleText + modStyleText });
  // }, [modStyleText]);

  // useEffect(() => {
  //   if (!fullStyle) return; console.log('<===fullStyle===>', fullStyle);
  //   updateNodeByKey(nodeToSend?._key, { style: fullStyle });
  // }, [fullStyle]);

  // ================================
  const updateNodeByKey = (key: string, changes: Partial<HtmlNode>) => {

    updateHtmlJson((prev) => {
      const updateRecursively = (nodes: HtmlNode[]): HtmlNode[] => {
        return nodes.map((node) => {
          if (node?._key === key) {
            // console.log("<=🔹🟢==node=🟢🔹==>", node);
            // console.log("<=🔹🟢==changes=🟢🔹==>", changes);
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
          className="bg-black/60 backdrop-blur-lg   p-1 pt-8   bottom-0 left-0 transform w-[calc(100vw-10px)] min-h-[188px]  max-h-[370px] overflow-y-auto  fixed  z-6000"
          style={{
            borderTop: "5px solid var(--teal)",
          }}
        >
          <div className="flex gap-1 w-[calc(100%-10px)] absolute top-0 left-1  !py-1 z-10">
            <button
              className="btn btn-primary  flex-[40px]"
              onClick={() => setActiveKey(null)}
            >
              <Image
                src="./svg/cross-com.svg"
                alt="close"
                width={12}
                height={12}
              />
            </button>
            <div className="flex-[70%]">
              <JsonToHtmlButton />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-2 relative rounded border-2 border-[var(--teal)] p-1  w-full h-full  bg-slate-200">
            {nodeToSend && (
              <>
                <div className="flex flex-col gap-2">
                  <TagComponent
                    node={nodeToSend}
                    updateNodeByKey={updateNodeByKey}
                  />
                  <ClassComponent
                    node={nodeToSend}
                    updateNodeByKey={updateNodeByKey}
                    modClass={modClass}
                    setModClass={setModClass}
                  />
                  <TextComponent
                    node={nodeToSend}
                    updateNodeByKey={updateNodeByKey}
                  />

                </div>
                <div className="grid grid-cols-1 w-full gap-2">
                  <StyleComponent
                    node={nodeToSend}
                    styleText={styleText}
                    setStyleText={setStyleText}
                    updateNodeByKey={updateNodeByKey}
                  />
                  {/* <ModStyleComponent
                    node={nodeToSend}
                    modClass={modClass}
                    modStyleText={modStyleText}
                    setModStyleText={setModStyleText}
                  /> */}
                </div>
              </>
            )}
            {nodeToSend?.tag === "img" && (
              <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  mt-10  flex flex-col relative ">
                <p className="itemClass">
                  <span>Src:</span>
                </p>
                <textarea
                  value={nodeToSend?.attributes?.src || ""}
                  ref={(el) => {
                    if (!el) return;
                    textareaRef.current = el;
                    adjustHeight(el);
                  }}
                  onChange={(e) => {
                    if (nodeToSend && nodeToSend._key) {
                      updateNodeByKey(nodeToSend._key!, {
                        attributes: { ...nodeToSend.attributes, src: e.target.value },
                      });
                    }
                  }}
                  className="textarea-styles"
                  placeholder=""
                />
              </div>
            )}


          </div>
          {/* 
          {nodeToSend?.attributes &&
            Object.keys(nodeToSend.attributes).length > 0 && (
              <div className="flex gap-2 mt-6 rounded border-2 border-[var(--teal)] p-1 pt-6 text-[#000]  bg-slate-200">
                {Object.entries(localAttrs).map(([k, value]) => (
                  <div
                    key={k}
                    className="bg-white  flex-[0_1_100%] flex flex-col relative rounded max-h-[min-content] "
                  >
                    <p className="itemClass">{k}:</p>
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
                        // setLocalAttrs((prev) => ({
                        //   ...prev,
                        //   [k]: val,
                        // }));

                        // 2. дебаунсим обновление дерева
                        // const timeouts = attrTimeoutsRef.current;
                        // if (timeouts[k]) {
                        //   clearTimeout(timeouts[k]);
                        // }

                        // timeouts[k] = window.setTimeout(() => {
                          // if (nodeToSend) {
                          //   updateNodeByKey(nodeToSend._key, {
                          //     attributes: {
                          //       ...nodeToSend.attributes,
                          //       [k]: val,
                          //     },
                          //   });
                          // }
                        // }, 300);
                      }}
                      className="textarea-styles"
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            )} */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeInfo;
