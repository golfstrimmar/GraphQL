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
import Image from "next/image";
import NormalizeSCSS from "../NormalizeSCSS";
import ColorPicker from "./ColorPicker";
import DisplayPicker from "./DisplayPicker";
import FlexContainerPicker from "./FlexContainerPicker";
import GridContainerPicker from "./GridContainerPicker";
import CommonPropsPicker from "./CommonPropsPicker";
import TextPropsPicker from "./TextPropsPicker";
import PositionPropsPicker from "./PositionPropsPicker";

export default function MobileAddStyle({
  setStyleText,
  openMobile,
  setOpenMobile,
}) {
  const {} = useStateContext();
  const [addingScss, setAddingScss] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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

  // --------------
  const applyValue = (next: string) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1); // обрезаем redo-ветку
      return [...trimmed, next];
    });
    setHistoryIndex((i) => i + 1);
    setAddingScss(next);
  };

  // --------------
  const toAdd = (foo: string) => {
    setAddingScss((prev) => {
      const base = prev ?? "";

      let next = base;
      if (foo.includes("&:hover")) {
        if (base.includes(":hover")) return base;

        const lastBraceIndex = base.lastIndexOf("}");
        const insertPos =
          lastBraceIndex >= 0 ? lastBraceIndex + 1 : base.length;
        const next = base.slice(0, insertPos) + foo + "\n";
        applyValue(next);
        return next;
      }

      if (foo.includes("background-color:")) {
        if (base.includes("background-color:")) {
          return base;
        }
        next = base + foo + "\n";
      } else if (foo.includes("display:")) {
        if (base.includes("display:")) {
          return base;
        }
        next = base + foo + "\n";
      } else {
        if (base.includes(foo)) {
          return base;
        }
        next = base + foo + "\n";
      }

      applyValue(next);
      return next;
    });
  };

  // --------------
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  // --------------
  const ItemClass =
    "grid grid-cols-[100px_1fr] gap-2 bg-[var(--lightest-slate)] rounded-2xl shadow-xl p-2 border border-slate-200"; // --------------

  // --------------
  return (
    <AnimatePresence mode="wait">
      {openMobile && (
        <motion.div
          key="modal-message"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="modalmessage py-4 fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-lg w-[100vw] min-h-[100vh]"
          onClick={(e) => {
            e.stopPropagation();
            if (!(e.target as HTMLElement).closest(".modal-inner")) {
              setOpenMobile(false);
            }
          }}
        >
          <button
            className="absolute block top-4 right-8 rounded-full z-[7140] p-2 cursor-pointer"
            onClick={() => setOpenMobile(false)}
          >
            <Image src="./svg/cross.svg" alt="close" width={20} height={20} />
          </button>

          <div className="modal-inner bg-white p-2 w-full mx-auto max-w-[90%] min-h-[90vh] h-full overflow-y-scroll ">
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
              className="textarea-styles"
            />

            {/*<div className="flex items-center">
              <button
                className="btn btn-allert h-8 mr-2"
                onClick={() => setAddingScss("")}
              >
                <Image
                  src="/svg/clear.svg"
                  alt="copy"
                  width={16}
                  height={16}
                />{" "}
              </button>
              <button className="btn btn-primary h-8 m-0"> Add </button>
            </div>*/}
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
                  setStyleText((prev: string) => {
                    return NormalizeSCSS(prev, addingScss);
                  });

                  setOpenMobile(false);
                }}
                className="btn btn-primary h-8 m-0 flex-[1_1_100%]"
              >
                Add
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              {/*========Common===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Common
                </span>
                <CommonPropsPicker toAdd={toAdd} />
              </div>
              {/*========Text===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Text
                </span>
                <TextPropsPicker toAdd={toAdd} />
              </div>
              {/*========Position===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Position
                </span>
                <PositionPropsPicker toAdd={toAdd} />
              </div>
              {/*========display===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  display:
                </span>
                <DisplayPicker toAdd={toAdd} />
              </div>

              {/*========Flex===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Flex
                </span>
                <FlexContainerPicker toAdd={toAdd} />
              </div>
              {/*=======Grid===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  Grid
                </span>
                <GridContainerPicker toAdd={toAdd} />
              </div>
              {/*========background-color===========*/}
              <div className={ItemClass}>
                <span className="text-[var(--navy)] font-bold text-[14px]">
                  background-color:
                </span>
                <ColorPicker toAdd={toAdd} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
