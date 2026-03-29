"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";

const commonClasses = [
  "rev--on-scroll",
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
  const [addingClass, setAddingClass] = useState<string>("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const toggleClass = (className: string) => {
    setAddingClass((prev) => {
      const parts = prev.split(/\s+/).filter(Boolean);
      if (parts.includes(className)) {
        return parts.filter((p) => p !== className).join(" ");
      }
      return [...parts, className].join(" ");
    });
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

            <div className="flex gap-2 mb-4">
              <button
                className="btn btn-allert h-10 px-4"
                onClick={() => setAddingClass("")}
              >
                Clear
              </button>
              <button
                onClick={handleAdd}
                className="btn btn-primary h-10 flex-1"
              >
                Add to Node
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
