"use client";

import React, { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";
import { useApolloClient } from "@apollo/client";
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

export default function MobileAddClass({
  setClassText,
  openMobile,
  setOpenMobile,
}: {
  setClassText: React.Dispatch<React.SetStateAction<string>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { htmlJson, updateHtmlJson } = useStateContext();
  const [addingClass, setAddingClass] = useState<string>("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const client = useApolloClient();

  // 1. Check for animation resources in the current project
  const hasRevAssets = useMemo(() => {
    const check = (nodes: HtmlNode[]): boolean => {
      for (const node of nodes) {
        if (node.tag === "style" || node.tag === "script") {
          const txt = node.text || "";
          // Check for both possible markers
          if (txt.includes("@component: reveal") || txt.includes("@component: rev--on-scroll")) return true;
        }
        if (Array.isArray(node.children)) {
          if (check(node.children as HtmlNode[])) return true;
        }
      }
      return false;
    };
    return check(htmlJson);
  }, [htmlJson]);

  // 2. Detect if rev resources are needed based on selected classes
  const needsRevAssets = useMemo(() => {
    return addingClass.toLowerCase().includes("rev--");
  }, [addingClass]);

  const toggleClass = (className: string) => {
    setAddingClass((prev) => {
      let parts = prev.split(/\s+/).filter(Boolean);
      const isDirection = (directionClasses as readonly string[]).includes(className);

      if (parts.includes(className)) {
        // Toggle off
        return parts.filter((p) => p !== className).join(" ");
      }

      // Toggle on
      if (isDirection) {
        // Remove other directions first
        parts = parts.filter((p) => !(directionClasses as readonly string[]).includes(p));
      }

      return [...parts, className].join(" ");
    });
  };

  const handleAddRevAssets = async () => {
    setLoadingAssets(true);
    try {
      // Fetching style-reveal and script-reveal separately as requested
      const [styleRes, scriptRes] = await Promise.all([
        client.query({ query: GET_JSON_DOCUMENT, variables: { name: "style-reveal" }, fetchPolicy: "no-cache" }),
        client.query({ query: GET_JSON_DOCUMENT, variables: { name: "script-reveal" }, fetchPolicy: "no-cache" })
      ]);

      const styleContent = styleRes.data?.jsonDocumentByName?.content;
      const scriptContent = scriptRes.data?.jsonDocumentByName?.content;

      if (!styleContent && !scriptContent) {
        alert("Animation assets (style-reveal / script-reveal) not found in database.");
        return;
      }

      const allServiceNodes: HtmlNode[] = [];

      if (styleContent) {
        const nodes = ensureNodeKeys(styleContent) as HtmlNode[];
        allServiceNodes.push(...nodes.map(n => ({
          ...n,
          text: `/* @component: reveal */\n${n.text}`,
          attributes: { ...n.attributes, "data-global": "true" }
        })));
      }

      if (scriptContent) {
        const nodes = ensureNodeKeys(scriptContent) as HtmlNode[];
        allServiceNodes.push(...nodes.map(n => ({
          ...n,
          text: `/* @component: reveal */\n${n.text}`,
          attributes: { ...n.attributes, "data-global": "true" }
        })));
      }

      if (allServiceNodes.length > 0) {
        updateHtmlJson(prev => [...allServiceNodes, ...prev]);
        console.log("Animation styles and scripts added successfully.");
      }
    } catch (e) {
      console.error("GraphQL Error:", e);
      alert("Failed to fetch animation assets from database.");
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAdd = () => {
    setClassText((prev: string) => {
      const existing = prev.split(/\s+/).filter(Boolean);
      const toAdd = addingClass.split(/\s+/).filter(Boolean);
      const combined = Array.from(new Set([...existing, ...toAdd]));
      return combined.join(" ");
    });
    setOpenMobile(false);
  };

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

          <div ref={modalRef} className="modal-inner bg-white p-4 max-w-md mx-auto rounded-lg mt-10 shadow-2xl">
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

            <div className="flex gap-2 mb-4">
              <button
                className="btn btn-allert h-10 px-4"
                onClick={() => setAddingClass("")}
              >
                Clear
              </button>
              <button
                onClick={handleAdd}
                disabled={needsRevAssets && !hasRevAssets}
                className={`btn btn-primary h-10 flex-1 transition-all ${
                  needsRevAssets && !hasRevAssets 
                    ? "opacity-40 cursor-not-allowed grayscale" 
                    : ""
                }`}
              >
                Apply Classes
              </button>
            </div>

            <div className={ItemClass}>
              {commonClasses.map((cls) => {
                const isActive = addingClass.split(/\s+/).includes(cls);
                return (
                  <button
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isActive 
                        ? "bg-[var(--teal)] text-white border-[var(--teal)] shadow-md" 
                        : "bg-white text-[var(--slate-800)] border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
