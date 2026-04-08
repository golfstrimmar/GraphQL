"use client";

import React, { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import Spinner from "@/components/icons/Spinner";
import type { HtmlNode } from "@/types/HtmlNode";



const commonClasses = [
  "rev--on-scroll",
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
] as const;

const directionClasses = [
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
] as const;

const inputClasses = [
  "input-field-filled",
  "input-field-outlined",
  "input-field-standard",
] as const;


export default function MobileAddClass({
  activeClassKey,
  openMobile,
  setOpenMobile,
}: {
  activeClassKey: string;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { htmlJson, updateHtmlJson } = useStateContext();
  const [addingClass, setAddingClass] = useState<string>("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    fetchPolicy: "no-cache",
  });


  // function findNodeByRef(nodes: HtmlNode[]): HtmlNode | null {
  //   for (const node of nodes) {
  //     if (node._key === activeClassKey) {
  //       return node;
  //     }
  //     if (node.children) {
  //       const found = findNodeByRef(node.children);
  //       if (found) {
  //         return found;
  //       }
  //     }
  //   }
  //   return null;
  // }
  const replaceNodeByKey = (
    tree: HtmlNode[] | HtmlNode,
    key: string,
    updater: (node: HtmlNode) => HtmlNode
  ): HtmlNode[] | HtmlNode => {
    const walk = (nodes: HtmlNode[]): HtmlNode[] =>
      nodes.map((n) => {
        if (n._key === key) {
          return updater(n);
        }
        if (n.children && Array.isArray(n.children)) {
          return {
            ...n,
            children: walk(n.children),
          };
        }
        return n;
      });

    return Array.isArray(tree) ? walk(tree) : walk([tree])[0];
  };
  // ===========================================================================

  const handleAdd = async (arg: string) => {
    const { data } = await refetchJson({
      name: `style-input-field-${arg}`,
    });

    const result = data?.jsonDocumentByName?.content;
    if (!result || !result[0]?.text || !activeClassKey) return;

    const svgNode = {
      tag: "img",
      text: "",
      class: "svg-wrapper",
      style: "width: 30px;\nheight: 30px;",
      children: [],
      attributes: {
        src: "https://cdn.jsdelivr.net/npm/heroicons@latest/24/outline/arrow-left-circle.svg",
      },
    };

    const fieldset = (node: { class?: string }, arg: string) => {
      const target = `_${arg}`;
      let newClass = node.class ?? "";

      if (target === "_empty" && newClass.includes("_filled")) {
        newClass = newClass.replace("_filled", "_empty");
      } else if (target === "_filled" && newClass.includes("_empty")) {
        newClass = newClass.replace("_empty", "_filled");
      } else if (!newClass.includes(target)) {
        newClass = `${newClass} ${target}`.trim();
      }

      return newClass;
    };

    const removeBlock = (css: string, name: "_filled" | "_empty") =>
      css.replace(
        new RegExp(`/\\* ${name} \\*/[\\s\\S]*?/\\* \\/${name} \\*/`, "g"),
        ""
      );

    updateHtmlJson((prev) => {
      const updatedTree = JSON.parse(JSON.stringify(prev));

      return replaceNodeByKey(updatedTree, activeClassKey, (node) => {
        if (!node.class?.includes("_container-input")) return node;

        const nextStyle =
          arg === "filled"
            ? removeBlock(node.style ?? "", "_empty") + "\n" + result[0].text
            : arg === "empty"
              ? removeBlock(node.style ?? "", "_filled") + "\n" + result[0].text
              : (node.style ?? "") + "\n" + result[0].text;

        const base = {
          ...node,
          class: fieldset(node, arg),
          style: nextStyle,
        };

        if (arg !== "svg") return base;

        const children = base.children ?? [];
        const legendIndex = children.findIndex(
          (child: any) => child.tag === "legend"
        );

        if (legendIndex === -1) {
          return {
            ...base,
            children: [...children, svgNode],
          };
        }

        return {
          ...base,
          children: [
            ...children.slice(0, legendIndex + 1),
            svgNode,
            ...children.slice(legendIndex + 1),
          ],
        };
      });
    });

    setOpenMobile(false);
  };
  const handleAddRev = async (arg: string) => {
    try {
      // 1. STYLE
      const { data: styleData } = await refetchJson({ name: "style-reveal" });
      const styleContent = styleData?.jsonDocumentByName?.content as HtmlNode[] | undefined;

      // 2. SCRIPT
      const { data: scriptData } = await refetchJson({ name: "script-reveal" });
      const scriptContent = scriptData?.jsonDocumentByName?.content as HtmlNode[] | undefined;

      // 3. ОБНОВЛЯЕМ htmlJson
      updateHtmlJson((prev) => {
        let tree = prev;

        // 3.1. Вешаем класс на активную ноду (если есть activeClassKey)
        if (activeClassKey) {
          tree = replaceNodeByKey(tree, activeClassKey, (node) => ({
            ...node,
            class: `${node.class ?? ""} rev--on-scroll ${arg}`.trim(),
          })) as typeof prev;
        }

        // 3.2. Разворачиваем style/script‑ноды в конец дерева
        const extraNodes: HtmlNode[] = [];

        if (styleContent && Array.isArray(styleContent)) {
          extraNodes.push(...styleContent);
        }

        if (scriptContent && Array.isArray(scriptContent)) {
          extraNodes.push(...scriptContent);
        }

        if (extraNodes.length === 0) return tree;

        // при необходимости навешиваем _key'и
        const withKeys = ensureNodeKeys(extraNodes) as HtmlNode[];

        return Array.isArray(tree)
          ? [...tree, ...withKeys]
          : [tree, ...withKeys];
      });
    } catch (error) {
      console.error("handleAddRev error:", error);
    } finally {
      setOpenMobile(false);
    }
  };
  // ===========================================================================
  const ItemClass =
    "flex flex-wrap gap-2 rounded-2xl shadow-xl p-4 bg-[var(--lightest-slate)] border border-slate-200 mt-4";

  return createPortal(
    <AnimatePresence>
      {openMobile && (
        <motion.div
          key="modal-class"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="bg-black/60 backdrop-blur-lg fixed w-[100vw] h-[100vh] overflow-y-scroll py-10 z-6050 top-0 left-0"
          onClick={(e) => {
            e.stopPropagation();
            if (!(e.target as HTMLElement).closest(".modal-inner")) {
              setOpenMobile(false);
            }
          }}
        >
          <button
            className="w-4 h-4 block text-white absolute top-4 right-6 z-10000 hover:text-gray-500 cursor-pointer transition-colors duration-300"
            onClick={() => setOpenMobile(false)}
          >
            <CloseIcon />
          </button>
          <div className="modal-inner bg-white p-4 max-w-[95%] mx-auto rounded-lg mt-10 shadow-2xl">
            <button className="btn btn-primary" onClick={() => handleAdd("filled")}>Add filled</button>
            <button className="btn btn-primary" onClick={() => handleAdd("empty")}>Add empty</button>
            <button className="btn btn-primary" onClick={() => handleAdd("svg")}>Add svg</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--up")}>Add rev--up</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--down")}>Add rev--down</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--left")}>Add rev--left</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--right")}>Add rev--right</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--zoom")}>Add rev--zoom</button>
          </div>
          {/* <div ref={modalRef} className="modal-inner bg-white p-4 max-w-md mx-auto rounded-lg mt-10 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-[var(--navy)]">Add Classes</h3>

            <textarea
              value={addingClass}
              onChange={(e) => setAddingClass(e.target.value)}
              className="textarea-styles text-[var(--slate-800)] mb-4 w-full h-24 border border-slate-300 rounded p-2 outline-none focus:border-[var(--teal)]"
              placeholder="Selected classes will appear here..."
            />

            {needsRevAssets && !hasRevAssets && (
              <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm flex flex-col gap-2 rounded shadow-sm shadow-amber-200">
                <span className="font-medium">⚠️ Animation Assets Required</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] opacity-90 text-pretty">The 'reveal' engine was not found. Please click to add it.</span>
                  <button
                    onClick={handleAddRevAssets}
                    className="btn btn-primary !h-8 !px-4 !text-[12px] flex items-center gap-1 shadow-md whitespace-nowrap"
                  >
                    {loadingAssets ? <Spinner /> : <span>Load Reveal</span>}
                  </button>
                </div>
              </div>
            )}
            {needsInputAssets && !hasInputAssets && (
              <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm flex flex-col gap-2 rounded shadow-sm shadow-amber-200">
                <span className="font-medium">⚠️ Input Assets Required</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] opacity-90 text-pretty">The 'Input' engine was not found. Please click to add it.</span>
                  <button
                    onClick={handleAddInputAssets}
                    className="btn btn-primary !h-8 !px-4 !text-[12px] flex items-center gap-1 shadow-md whitespace-nowrap"
                  >
                    {loadingAssets ? <Spinner /> : <span>Load Input Assets</span>}
                  </button>
                </div>
              </div>
            )}



            <div className={ItemClass}>
              {commonClasses.map((cls) => {
                const isActive = addingClass.split(/\s+/).includes(cls);
                return (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${isActive
                      ? "bg-[var(--teal)] text-white border-[var(--teal)] shadow-md"
                      : "bg-white text-[var(--slate-800)] border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>

            <div className={ItemClass}>
              <h4 className="w-full text-xs font-bold text-slate-500 mb-1">Input Classes</h4>
              {inputClasses.map((cls) => {
                const isActive = addingClass.split(/\s+/).includes(cls);
                return (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${isActive
                      ? "bg-[var(--teal)] text-white border-[var(--teal)] shadow-md"
                      : "bg-white text-[var(--slate-800)] border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                className="btn btn-allert h-10 px-4"
                onClick={() => setAddingClass("")}
              >
                Clear
              </button>
              <button
                onClick={handleAdd}
                disabled={(needsRevAssets && !hasRevAssets) || (needsInputAssets && !hasInputAssets)}
                className={`btn btn-primary h-10 flex-1 transition-all ${(needsRevAssets && !hasRevAssets) || (needsInputAssets && !hasInputAssets)
                  ? "opacity-40 cursor-not-allowed grayscale"
                  : ""
                  }`}
              >
                Apply Classes
              </button>
            </div>
          </div> */}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
