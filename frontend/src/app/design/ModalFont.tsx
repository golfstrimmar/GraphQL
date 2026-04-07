"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import GOOGLE_FONTS from "./halpers/googleFonts";
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalFont({
  openFontModal,
  setOpenFontModal,
  setCurrentTextIndex,
  currentTextIndex,
  texts,
  buttons,
  handleChangeCss,
}) {
  const { } = useStateContext();

  const updateFontInCss = (currentCss: string, family: string) => {
    if (!currentCss) return "";
    const fontRegex = /font-family\s*:[^;]+;?/i;

    if (fontRegex.test(currentCss)) {
      return currentCss.replace(
        fontRegex,
        `font-family: '${family}', sans-serif;`,
      );
    }
    const trimmed = currentCss.trim();
    const withSemicolon = trimmed.endsWith(";") ? trimmed : trimmed + ";";
    return `${withSemicolon} font-family:${family};`;
  };

  const handleFontClick = (family: string) => {
    if (currentTextIndex === null) return;
    let currentCss;
    if (texts) {
      currentCss = texts[currentTextIndex].style || "";
    } else if (buttons) {
      currentCss = buttons[currentTextIndex].style || "";
    }

    const nextCss = updateFontInCss(currentCss, family);

    handleChangeCss(currentTextIndex, nextCss);
    setOpenFontModal(false);
    setCurrentTextIndex(null);
  };

  return (
    <AnimatePresence>
      {openFontModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
          className="fixed top-0 lef-0 flex flex-col items-center justify-center overflow-auto max-h-90vh inset-0 z-[1000]  bg-[rgba(0,0,0,0.95)] py-[40px]"
        >
          {/*кнопка закрытия модалки*/}
          <button
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => {
              setOpenFontModal(false);
              setCurrentTextIndex(null);
            }}
          >
            <CloseIcon width={24} height={24} />
          </button>
          <div className="flex flex-col gap-1">
            {GOOGLE_FONTS.map((font, idx: number) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFontClick(font.family, idx)}
                  className="btn btn-teal text-[14px] "
                >
                  {font.family}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
