"use client";
import React, { useState, useEffect } from "react";
import Colors from "./Colors";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
type ColorGroup = (typeof Colors)[number]["group"];
type ColorItem = (typeof Colors)[number];

interface ColorPickerProps {
  el: string;
  toAdd: (text: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ColorPicker({
  el,
  toAdd,
  open,
  setOpen,
}: ColorPickerProps): React.ReactElement {
  const groupsOrder: ColorGroup[] = [
    "neutral",
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "brown",
    "gradient",
  ];
  const [actuelColor, setActuelColor] = useState<string>("");
  useEffect(() => {
    if (!actuelColor) return;
    toAdd(el + actuelColor);
    setOpen(false);
  }, [actuelColor]);
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal-message"
          initial={{ opacity: 0, scale: 0.8, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ duration: 0.3 }}
          className="modalmessage fixed top-0 left-0    bg-[rgba(0,0,0,0.95)] z-213000!  rounded-lg w-[100vw] h-[100vh] flex justify-center  items-center "
          onClick={(e) => {
            e.stopPropagation();
            if (!(e.target as HTMLElement).closest(".modal-inner")) {
              setOpen(false);
            }
          }}
        >
          <button
            className="absolute block top-4 right-8 rounded-full z-[7140] p-2 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Image src="./svg/cross.svg" alt="close" width={20} height={20} />
          </button>

          <div className="modal-inner">
            <div className="flex flex-wrap gap-4">
              {groupsOrder.map((group) => {
                const items = Colors.filter(
                  (c) => c.group === group,
                ) as ColorItem[];
                if (!items.length) return null;

                return (
                  <div key={group}>
                    <div className="flex  flex-wrap gap-2">
                      {items.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          aria-label={`Set background color to ${c.color}`}
                          className="w-8 h-6 rounded-full border border-black/10"
                          style={{ background: c.value }}
                          title={c.color}
                          onClick={() => {
                            setActuelColor(`${c.value};`);

                          }}
                        ></button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
