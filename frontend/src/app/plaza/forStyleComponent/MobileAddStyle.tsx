"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useStateContext } from "@/providers/StateProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NormalizeSCSS from "./NormalizeSCSS";
import ColorPicker from "./ColorPicker";
import DisplayPicker from "./DisplayPicker";
import FlexContainerPicker from "./FlexContainerPicker";
import GridContainerPicker from "./GridContainerPicker";
import CommonPropsPicker from "./CommonPropsPicker";
import TextPropsPicker from "./TextPropsPicker";
import PositionPropsPicker from "./PositionPropsPicker";
import PresetsPicker from "./PresetsPicker";
import СhevronDown from "@/components/icons/ChevronDown";
import CloseIcon from "@/components/icons/CloseIcon";
import formatStyleString from "../forStyleComponent/formatStyleString";


interface PropsMobileAddStyle {
  setCurrentStyle: (text: string) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
const MobileAddStyle: React.FC<PropsMobileAddStyle> = ({
  setCurrentStyle,
  openMobile,
  setOpenMobile
}) => {
  const { } = useStateContext();
  const [addingScss, setAddingScss] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const modalRef = useRef<HTMLDivElement | null>(null);

  const scrollModalToTop = () => {
    const el = modalRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleUndo = () => {
    if (!canUndo) return;
    setHistoryIndex((i) => {
      const ni = i - 1;
      const val = history[ni];
      setAddingScss(val);
      return ni;
    });
  };

  const handleRedo = () => {
    if (!canRedo) return;
    setHistoryIndex((i) => {
      const ni = i + 1;
      const val = history[ni];
      setAddingScss(val);
      return ni;
    });
  };

  const applyValue = (next: string) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, next];
    });
    setHistoryIndex((i) => i + 1);
    setAddingScss(next);
  };

  const toAdd = (foo: string) => {
    setAddingScss((prev) => {
      const base = prev ?? "";
      if (foo.includes("display:")) {
        if (base.includes("display:")) {
          return applyValue(foo);
        }
      }
      if (base.includes(foo)) {
        return applyValue(base);
      }
      if (foo.includes("!important")) {
        return applyValue(base.replace(";", "") + foo + ";");
      }
      return applyValue(base + foo);
    });
  };

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const ItemClass =
    "grid grid-cols-[100px_1fr] gap-2 rounded-2xl shadow-xl p-2 bg-[var(--lightest-slate)] border border-slate-200";

  return createPortal(
    <AnimatePresence>
      {openMobile && (
        <motion.div
          key="modal-message"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="  bg-black/60 backdrop-blur-lg   w-[100vw] h-[100vh] overflow-y-scroll py-2   "
          onClick={(e) => {
            e.stopPropagation();
            if (
              !(e.target as HTMLElement).closest(".modal-inner") &&
              !(e.target as HTMLElement).closest(".button-top")
            ) {
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

          <div ref={modalRef} className="modal-inner     bg-white p-2 ">
            <textarea
              ref={(el) => {
                if (!el) return;
                adjustHeight(el);
              }}
              value={addingScss}
              onChange={(e) => {
                const target = e.target.value;
                applyValue(target);
                adjustHeight(e.target);
              }}
              onInput={(e) => adjustHeight(e.target as HTMLTextAreaElement)}
              className="textarea-styles text-[var(--slate-800)]"
            />

            <div className="flex items-center">
              <button
                className="btn h-8 mr-2 px-1 btn btn-empty"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                ⇦
              </button>
              <button
                className="btn h-8 mr-2 px-1 btn btn-empty"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                ⇨
              </button>
              <button
                className="btn btn-allert h-8 mr-2"
                onClick={() => applyValue("")}
              >
                <Image
                  src="/svg/clear.svg"
                  alt="clear"
                  width={16}
                  height={16}
                />
              </button>
              <button
                onClick={() => {
                  setAddingScss("");
                  setCurrentStyle((prev: string) => {
                    return prev + formatStyleString(addingScss);
                  });
                  setOpenMobile(false);
                }}
                className="btn btn-primary h-8 m-0 flex-[1_1_100%]"
              >
                Add
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Presets
                </span>
                <PresetsPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Common
                </span>
                <CommonPropsPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Text
                </span>
                <TextPropsPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Position
                </span>
                <PositionPropsPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Display
                </span>
                <DisplayPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Flex
                </span>
                <FlexContainerPicker toAdd={toAdd} />
              </div>

              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Grid
                </span>
                <GridContainerPicker toAdd={toAdd} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default MobileAddStyle;