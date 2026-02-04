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
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalColor({
  openColorModal,
  setOpenColorModal,
  setCurrentTextIndex,
  currentTextIndex,
  codeCssList,
  handleChangeCss,
}) {
  const {} = useStateContext();
  // --------------------
  const updateColorInCss = (cssString: string, newColor: string): string => {
    if (!cssString || !cssString.trim()) {
      return `color:${newColor};`;
    }

    const colorRegex = /color\s*:\s*[^;]+;?/i;

    if (colorRegex.test(cssString)) {
      return cssString.replace(colorRegex, `color:${newColor};`);
    }

    const trimmed = cssString.trim();
    const withSemicolon = trimmed.endsWith(";") ? trimmed : trimmed + ";";
    return `${withSemicolon} color:${newColor};`;
  };
  // --------------------
  const handlePickColorFromModal = (value: string) => {
    if (currentTextIndex === null) return;

    const currentCss = codeCssList[currentTextIndex];
    const nextCss = updateColorInCss(currentCss, value);

    handleChangeCss(currentTextIndex, nextCss);

    setOpenColorModal(false);
    setCurrentTextIndex(null);
  };
  // --------------------
  return (
    <AnimatePresence>
      {openColorModal && (
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
              setOpenColorModal(false);
              setCurrentTextIndex(null);
            }}
          >
            <CloseIcon width={24} height={24} />
          </button>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]  w-full gap-2">
            {[
              "neutral",
              "red",
              "orange",
              "yellow",
              "green",
              "cyan",
              "blue",
              "purple",
              "brown",
            ].map((groupName) => (
              <div key={groupName} className="flex flex-col gap-0">
                {Colors.filter((c) => c.group === groupName).map((color) => (
                  <button
                    key={color.color}
                    className="btn text-[12px] !py-0.5 !px-1 rounded !justify-start"
                    style={{ color: color.value }}
                    onClick={() => handlePickColorFromModal(color.value)}
                  >
                    <span
                      style={{ backgroundColor: color.value }}
                      className="w-4 h-4 mr-2 inline-block rounded-full "
                    />
                    {color.color}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
