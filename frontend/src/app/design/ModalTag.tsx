"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";

export const TAGS = [
  // Block-level (с отступами)
  { name: "div" },
  { name: "p" },
  { name: "h1" },
  { name: "h2" },
  { name: "h3" },
  { name: "h4" },
  { name: "h5" },
  { name: "h6" },
  { name: "section" },
  { name: "article" },
  { name: "aside" },
  { name: "header" },
  { name: "footer" },
  { name: "main" },
  { name: "nav" },
  { name: "blockquote" },
  { name: "figure" },
  { name: "figcaption" },
  { name: "pre" },
  { name: "address" },
  { name: "details" },
  { name: "summary" },

  // Inline (внутри блоков)
  { name: "span" },
  { name: "a" },
  { name: "strong" },
  { name: "em" },
  { name: "b" },
  { name: "i" },
  { name: "u" },
  { name: "code" },
  { name: "kbd" },
  { name: "samp" },
  { name: "var" },
  { name: "cite" },
  { name: "dfn" },
  { name: "abbr" },
  { name: "time" },
  { name: "mark" },
  { name: "del" },
  { name: "ins" },
  { name: "sub" },
  { name: "sup" },
  { name: "small" },

  // Списки
  { name: "li" },
  { name: "dt" },
  { name: "dd" },

  // Формы (с лейблами/текстом)
  { name: "label" },
  { name: "legend" },
  { name: "caption" },
];

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalTag({
  openTagModal,
  setOpenTagModal,
  setCurrentTextIndex,
  currentTextIndex,
  setTexts,
}) {
  useEffect(() => {
    if (!currentTextIndex) return;
    console.log("<===currentTextIndex===>", currentTextIndex);
  }, [currentTextIndex]);
  // --------------------
  const handlePickTagFromModal = (value: string) => {
    setTexts((prevTexts) => {
      console.log("🔍 prevTexts:", prevTexts);
      console.log("🔍 currentTextIndex:", currentTextIndex);

      // Безопасная проверка индекса
      const index = currentTextIndex;
      if (index === null || index >= prevTexts.length || index < 0) {
        console.error(
          "❌ Invalid index:",
          index,
          "texts.length:",
          prevTexts.length,
        );
        return prevTexts;
      }

      const current = prevTexts[index];
      console.log("🔍 current:", current);

      if (!current) {
        console.warn("⚠️ No current text at index:", index);
        return prevTexts;
      }

      // ✅ Иммутабельное обновление
      const updatedTexts = prevTexts.map((item, i) => {
        if (i === index) {
          const newText = { ...item, tagName: value };
          console.log("🔄 Updating index", index, "newText:", newText);
          return newText;
        }
        return item;
      });

      console.log("✅ updatedTexts:", updatedTexts);
      return updatedTexts;
    });

    setOpenTagModal(false);
    setCurrentTextIndex(null);
  };

  // --------------------
  return (
    <AnimatePresence>
      {openTagModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
          className="fixed top-0 lef-0 overflow-auto max-h-90vh inset-0 z-[1000]  bg-[rgba(0,0,0,0.95)] py-[40px]"
        >
          {/*кнопка закрытия модалки*/}
          <button
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => {
              setOpenTagModal(false);
              setCurrentTextIndex(null);
            }}
          >
            <CloseIcon width={24} height={24} />
          </button>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]  w-full gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.name}
                value={tag.name}
                className="btn btn-teal text-[14px]"
                onClick={(e) => handlePickTagFromModal(e.target.value)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
