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


const inputClasses = [
  "input-field-filled",
  "input-field-outlined",
  "input-field-standard",
] as const;

const directionClasses = [
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
] as const;

type DirectionClass = (typeof directionClasses)[number];
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


  function findNodeByRef(nodes: HtmlNode[]): HtmlNode | null {
    for (const node of nodes) {
      if (node._key === activeClassKey) {
        return node;
      }
      if (node.children) {
        const found = findNodeByRef(node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
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


  // добавляет rev--on-scroll и один directionClass, убирая остальные rev--*
  function applyRevClass(prevClass: string | undefined, dir: DirectionClass): string {
    const parts = (prevClass ?? "")
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    const withoutRevDirections = parts.filter(
      (c) => !directionClasses.includes(c as DirectionClass)
    );

    // гарантируем rev--on-scroll
    if (!withoutRevDirections.includes("rev--on-scroll")) {
      withoutRevDirections.push("rev--on-scroll");
    }

    // добавляем нужное направление
    withoutRevDirections.push(dir);

    // убираем дубли на всякий случай
    return Array.from(new Set(withoutRevDirections)).join(" ");
  }
  // ===========================================================================

  const handleAdd = async (arg: string) => {
    const { data } = await refetchJson({
      name: `style-input-field-${arg}`,
    });

    const result = data?.jsonDocumentByName?.content;
    if (!result || !result[0]?.text || !activeClassKey) return;


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
        if (!node.class?.includes("js-container-input")) return node;

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

        return base;
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
        if (activeClassKey) {
          tree = replaceNodeByKey(tree, activeClassKey, (node) => ({
            ...node,
            class: applyRevClass(node.class, arg as DirectionClass),
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


            {findNodeByRef(htmlJson)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => {
              handleAdd("filled")
            }}>Add filled</button>}
            {findNodeByRef(htmlJson)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => handleAdd("empty")}>Add empty</button>}
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--up")}>Add rev--up</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--down")}>Add rev--down</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--left")}>Add rev--left</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--right")}>Add rev--right</button>
            <button className="btn btn-primary" onClick={() => handleAddRev("rev--zoom")}>Add rev--zoom</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
