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
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalFont({
  openFontModal,
  setOpenFontModal,
  setCurrentTextIndex,
  currentTextIndex,
  codeCssList,
  handleChangeCss,
}) {
  const {} = useStateContext();
  const GOOGLE_FONTS = [
    { family: "Inter", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Roboto", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Open Sans", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Lato", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Montserrat", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Poppins", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Source Sans Pro", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Nunito", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Raleway", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Merriweather", weights: [300, 400, 500, 600, 700, 800] },
    { family: "Lobster", weights: [300, 400, 500, 600, 700, 800] },
  ];
  const updateFontInCss = (currentCss: string, family: string) => {
    if (!currentCss || !currentCss.trim()) {
      return `font-family:${family};`;
    }

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

    const currentCss = codeCssList[currentTextIndex] || "";
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
