"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import Spinner from "@/components/icons/Spinner";
import type { HtmlNode } from "@/types/HtmlNode";
import { findNodeByKey } from "@/utils/findNodeByKey";


const commonClasses = [
  "rev-on-scroll",
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
  const [addingClasses, setAddingClasses] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [flaClasses, setFlaClasses] = useState<boolean>(false);
  const addClsRef = useRef<Set<string>>(new Set());
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    fetchPolicy: "no-cache",
  });

  function cleanUnderscoreClasses(set: Set<string>): void {
    const items = Array.from(set);
    if (items.length === 0) return;

    const lastIndex = items.length - 1;

    const lastItem = items[lastIndex];
    const hasDoubleDash = lastItem.includes("--");
    const hasSingleDash = lastItem.includes("_");



    items.forEach((cls, index) => {
      if ((hasDoubleDash || hasSingleDash) && index !== lastIndex) {
        set.delete(cls);
      }
    });
    setAddingClasses([]);
  }
  // ===========================================================================

  useEffect(() => {
    if (!flaClasses) return;
    if (addingClasses.length === 0) return;

    const addCls = addClsRef.current;

    console.log("<===addingClasses===>", addingClasses);
    addingClasses.forEach((cls) => addCls.add(cls));

    cleanUnderscoreClasses(addCls);

    console.log("<===addCls===>", addCls);

    // 2) сразу вызываем функцию, которая ходит в базу по Set
    handleFromSet(addCls);
    logNodeWithAddedClasses()
    // 3) сброс флагов/очередей
    setFlaClasses(false);
    setAddingClasses([]);
    setOpenMobile(false);
  }, [addingClasses, flaClasses]);



  const handleFromSet = async (addCls: Set<string>) => {
    const extraNodes: HtmlNode[] = [];

    for (const cls of addCls) {
      // нам нужны только style-reveal, script-reveal и style-input-field-*
      if (cls === "style-reveal") {
        const { data } = await refetchJson({ name: "style-reveal" });
        const content = data?.jsonDocumentByName?.content as HtmlNode[] | undefined;
        if (content && content[0]?.text) {
          extraNodes.push(...content);
        }
      }

      if (cls === "script-reveal") {
        const { data } = await refetchJson({ name: "script-reveal" });
        const content = data?.jsonDocumentByName?.content as HtmlNode[] | undefined;
        if (content && content[0]?.text) {
          extraNodes.push(...content);
        }
      }

      if (cls === "_filled" || cls === "_empty") {
        const mode = cls === "_filled" ? "filled" : "empty";
        const { data } = await refetchJson({ name: `style-input-field-${mode}` });
        const content = data?.jsonDocumentByName?.content as HtmlNode[] | undefined;
        if (content && content[0]?.text) {
          extraNodes.push(...content);
        }
      }
    }

    if (!extraNodes.length) return;

    const withKeys = ensureNodeKeys(extraNodes) as HtmlNode[];
    updateHtmlJson((prev) => {
      const tree = Array.isArray(prev) ? prev : [prev];
      return [...tree, ...withKeys];
    });
  };



  function logNodeWithAddedClasses() {
    const node = findNodeByKey(htmlJson, activeClassKey);
    if (!node) {
      console.warn("Node not found for key:", activeClassKey);
      return;
    }

    const current = node.class?.split(/\s+/).filter(Boolean) ?? [];

    const extra = addingClasses
      .filter(Boolean)
      .filter((cls) => cls.includes("--") || cls.includes("_"));

    const result = new Set(current);

    for (const cls of extra) {
      // взаимоисключение _filled / _empty
      if (cls === "_filled") {
        result.delete("_empty");
        result.add("_filled");
        continue;
      }
      if (cls === "_empty") {
        result.delete("_filled");
        result.add("_empty");
        continue;
      }

      // ревилы: одно направление + всегда rev-on-scroll
      if (cls.startsWith("rev--")) {
        // удаляем только другие направления, базовый rev-on-scroll не трогаем
        for (const v of Array.from(result)) {
          if (v.startsWith("rev--")) {
            result.delete(v);
          }
        }

        // добавляем новое направление
        result.add(cls);

        // гарантируем, что базовый класс есть
        if (!result.has("rev-on-scroll")) {
          result.add("rev-on-scroll");
        }

        continue;
      }

      // остальные — просто добавляем, без дублей
      result.add(cls);
    }

    node.class = Array.from(result).join(" ");
    console.log("Updated node:", node);
  }

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


            {findNodeByKey(htmlJson, activeClassKey)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "_filled"])
            }}>Add filled</button>}
            {findNodeByKey(htmlJson, activeClassKey)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "_empty"])
            }}>Add empty</button>}
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--up", "rev-on-scroll"])
            }}>Add rev--up</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--down", "rev-on-scroll"])
            }}>Add rev--down</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--left", "rev-on-scroll"])
            }}>Add rev--left</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--right", "rev-on-scroll"])
            }}>Add rev--right</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--zoom", "rev-on-scroll"])
            }}>Add rev--zoom</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

